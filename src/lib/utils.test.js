import { describe, it, expect } from "vitest";
import { cn, formatCurrency, formatDate, formatDateTime } from "./utils";

describe("cn", () => {
  it("merges class names and resolves Tailwind conflicts", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });

  it("drops falsy values", () => {
    expect(cn("a", false, null, undefined, "b")).toBe("a b");
  });
});

describe("formatCurrency", () => {
  it("formats a number as Thai Baht", () => {
    expect(formatCurrency(1500)).toBe("฿1,500.00");
  });

  it("coerces numeric strings", () => {
    expect(formatCurrency("250.5")).toBe("฿250.50");
  });
});

describe("formatDate", () => {
  it("formats a date as dd MMM yyyy", () => {
    // Built from local y/m/d components (not an ISO string) so the assertion
    // holds regardless of the CI runner's timezone.
    expect(formatDate(new Date(2026, 0, 15))).toBe("15 Jan 2026");
  });

  it("returns an em dash for a missing date", () => {
    expect(formatDate(null)).toBe("—");
    expect(formatDate(undefined)).toBe("—");
  });
});

describe("formatDateTime", () => {
  it("formats a date with time", () => {
    // Time-of-day is timezone-dependent in CI, so only assert the overall shape.
    expect(formatDateTime("2026-01-15T09:05:00Z")).toMatch(/^\d{2} \w{3}, \d{2}:\d{2}$/);
  });

  it("returns an em dash for a missing date", () => {
    expect(formatDateTime(null)).toBe("—");
  });
});
