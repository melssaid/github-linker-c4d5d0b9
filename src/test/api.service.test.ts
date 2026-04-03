import { describe, it, expect } from "vitest";
import { ApiError } from "@/services/api.service";

describe("ApiError", () => {
  it("stores status and message", () => {
    const err = new ApiError("Not Found", 404, { detail: "missing" });
    expect(err.status).toBe(404);
    expect(err.message).toBe("Not Found");
    expect(err.body).toEqual({ detail: "missing" });
    expect(err.name).toBe("ApiError");
    expect(err instanceof Error).toBe(true);
  });
});
