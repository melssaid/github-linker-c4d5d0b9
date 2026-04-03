/**
 * Central utility exports.
 * Import shared helpers from this module rather than from scattered locations.
 *
 * @example
 *   import { cn, formatDate } from "@/utils";
 */

export { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Date helpers
// ---------------------------------------------------------------------------

/**
 * Formats a date value into a localised Arabic (Bahrain) string.
 * Falls back to ISO format when Intl is unavailable.
 *
 * @param date   - A Date object, ISO string, or timestamp number.
 * @param locale - BCP 47 locale tag (default: "ar-BH").
 */
export function formatDate(
  date: Date | string | number,
  locale = "ar-BH",
): string {
  try {
    return new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(date));
  } catch {
    return new Date(date).toISOString().split("T")[0];
  }
}

/**
 * Returns the local date string (YYYY-MM-DD) for a given date in the user's timezone.
 * @param date - A Date object or date-like value (default: today).
 */
export function toISODate(date: Date | string | number = new Date()): string {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// ---------------------------------------------------------------------------
// String helpers
// ---------------------------------------------------------------------------

/**
 * Capitalises the first letter of a string.
 */
export function capitalize(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Truncates a string to `maxLength` characters, appending an ellipsis when truncated.
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return `${str.slice(0, maxLength - 1)}…`;
}

// ---------------------------------------------------------------------------
// Number helpers
// ---------------------------------------------------------------------------

/**
 * Clamps a number between `min` and `max` (inclusive).
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Returns a percentage string (e.g. `"75%"`) given a numerator and denominator.
 * Returns `"0%"` when the denominator is zero to avoid division by zero.
 */
export function toPercent(numerator: number, denominator: number): string {
  if (denominator === 0) return "0%";
  return `${Math.round((numerator / denominator) * 100)}%`;
}
