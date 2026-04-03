import { describe, it, expect } from "vitest";
import { formatDate, toISODate, capitalize, truncate, clamp, toPercent } from "@/utils";

describe("utils", () => {
  describe("toISODate", () => {
    it("returns YYYY-MM-DD in local timezone", () => {
      const d = new Date(2024, 0, 15); // Jan 15 2024 local time
      expect(toISODate(d)).toBe("2024-01-15");
    });

    it("accepts a timestamp number", () => {
      const d = new Date(2024, 5, 1); // Jun 1 2024 local time
      expect(toISODate(d.getTime())).toBe("2024-06-01");
    });
  });

  describe("capitalize", () => {
    it("capitalises the first letter", () => {
      expect(capitalize("hello")).toBe("Hello");
    });

    it("returns empty string unchanged", () => {
      expect(capitalize("")).toBe("");
    });
  });

  describe("truncate", () => {
    it("does not truncate short strings", () => {
      expect(truncate("hi", 10)).toBe("hi");
    });

    it("truncates long strings with ellipsis", () => {
      const result = truncate("hello world", 6);
      expect(result).toHaveLength(6);
      expect(result.endsWith("…")).toBe(true);
      expect(result).toBe("hello…");
    });
  });

  describe("clamp", () => {
    it("clamps below min", () => expect(clamp(-5, 0, 10)).toBe(0));
    it("clamps above max", () => expect(clamp(20, 0, 10)).toBe(10));
    it("passes through in-range values", () => expect(clamp(5, 0, 10)).toBe(5));
  });

  describe("toPercent", () => {
    it("calculates percentage", () => expect(toPercent(3, 4)).toBe("75%"));
    it("returns 0% for zero denominator", () => expect(toPercent(5, 0)).toBe("0%"));
  });

  describe("formatDate", () => {
    it("returns a non-empty string", () => {
      const result = formatDate("2024-01-15");
      expect(typeof result).toBe("string");
      expect(result.length).toBeGreaterThan(0);
    });
  });
});
