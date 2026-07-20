import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { generateParcelId } from "./pid";

describe("generateParcelId", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 6, 1));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts a new month at 0001", async () => {
    const prisma = { parcel: { findFirst: vi.fn().mockResolvedValue(null) } };
    await expect(generateParcelId(prisma)).resolves.toBe("070001");
  });

  it("increments the sequence within the same month", async () => {
    const prisma = {
      parcel: { findFirst: vi.fn().mockResolvedValue({ pid: "070007" }) },
    };
    await expect(generateParcelId(prisma)).resolves.toBe("070008");
  });

  it("scopes the lookup to parcels from the current month", async () => {
    const findFirst = vi.fn().mockResolvedValue(null);
    const prisma = { parcel: { findFirst } };
    await generateParcelId(prisma);
    expect(findFirst).toHaveBeenCalledWith({
      where: { pid: { startsWith: "07" } },
      orderBy: { pid: "desc" },
    });
  });
});
