/**
 * Generic HTTP request service.
 * Provides a thin wrapper around the Fetch API with JSON handling,
 * error normalisation, and optional authentication headers.
 */

export interface ApiRequestOptions extends RequestInit {
  /** Base URL to prepend when the path is relative. */
  baseUrl?: string;
  /** Bearer token to include in the Authorization header. */
  token?: string;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly body?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Makes a typed JSON request.
 *
 * @param url    - Full URL or path (relative to `options.baseUrl`).
 * @param options - Fetch options extended with `baseUrl` and `token`.
 * @returns Parsed JSON response body.
 * @throws {ApiError} When the response status is not in the 2xx range.
 */
export async function request<T = unknown>(
  url: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const { baseUrl, token, headers: customHeaders, ...fetchOptions } = options;

  const fullUrl = baseUrl
    ? `${baseUrl.replace(/\/$/, "")}/${url.replace(/^\//, "")}`
    : url;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(customHeaders as Record<string, string>),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const response = await fetch(fullUrl, { ...fetchOptions, headers });

  if (!response.ok) {
    let body: unknown;
    try {
      body = await response.json();
    } catch {
      body = await response.text();
    }
    throw new ApiError(
      `Request failed: ${response.status} ${response.statusText}`,
      response.status,
      body,
    );
  }

  // Return undefined for 204 No Content responses.
  // T is expected to be undefined-compatible when calling endpoints that return 204.
  if (response.status === 204) return undefined as unknown as T;

  return response.json() as Promise<T>;
}

/** Convenience helper for GET requests. */
export const get = <T = unknown>(url: string, options?: ApiRequestOptions) =>
  request<T>(url, { ...options, method: "GET" });

/** Convenience helper for POST requests. */
export const post = <T = unknown>(
  url: string,
  body: unknown,
  options?: ApiRequestOptions,
) => request<T>(url, { ...options, method: "POST", body: JSON.stringify(body) });

/** Convenience helper for PUT requests. */
export const put = <T = unknown>(
  url: string,
  body: unknown,
  options?: ApiRequestOptions,
) => request<T>(url, { ...options, method: "PUT", body: JSON.stringify(body) });

/** Convenience helper for PATCH requests. */
export const patch = <T = unknown>(
  url: string,
  body: unknown,
  options?: ApiRequestOptions,
) =>
  request<T>(url, { ...options, method: "PATCH", body: JSON.stringify(body) });

/** Convenience helper for DELETE requests. */
export const del = <T = unknown>(url: string, options?: ApiRequestOptions) =>
  request<T>(url, { ...options, method: "DELETE" });

export const apiService = { request, get, post, put, patch, del };
