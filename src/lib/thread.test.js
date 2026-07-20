import { describe, it, expect, vi } from "vitest";
import { threadFor } from "./thread";

describe("threadFor", () => {
  it("returns the existing thread id without creating one", async () => {
    const prisma = {
      thread: {
        findUnique: vi.fn().mockResolvedValue({ id: "thread-1" }),
        create: vi.fn(),
      },
    };

    await expect(threadFor(prisma, "unit-1")).resolves.toBe("thread-1");
    expect(prisma.thread.findUnique).toHaveBeenCalledWith({ where: { unitId: "unit-1" } });
    expect(prisma.thread.create).not.toHaveBeenCalled();
  });

  it("creates a thread when none exists for the unit", async () => {
    const prisma = {
      thread: {
        findUnique: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue({ id: "thread-2" }),
      },
    };

    await expect(threadFor(prisma, "unit-2")).resolves.toBe("thread-2");
    expect(prisma.thread.create).toHaveBeenCalledWith({ data: { unitId: "unit-2" } });
  });
});
