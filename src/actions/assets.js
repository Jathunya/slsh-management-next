"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { assertRole } from "@/lib/auth";
import { revalidatePath } from "next/cache";

const assetSchema = z.object({
  serial: z.string().min(2),
  name: z.string().min(2),
  category: z.enum(["ELEVATOR", "GENERATOR", "SECURITY", "POOL", "GYM", "COMMON"]),
  location: z.string().min(2),
  value: z.coerce.number().nonnegative(),
  condition: z.enum(["GOOD", "FAIR", "POOR"]),
});

export async function createAsset(input) {
  await assertRole("ADMIN");
  const data = assetSchema.parse(input);
  const asset = await prisma.asset.create({ data });
  revalidatePath("/assets");
  return { ...asset, value: Number(asset.value) };
}

const maintenanceSchema = z.object({
  assetId: z.string().min(1),
  note: z.string().min(2),
  cost: z.coerce.number().nonnegative(),
});

export async function logMaintenance(input) {
  await assertRole("ADMIN");
  const data = maintenanceSchema.parse(input);
  const log = await prisma.maintenanceLog.create({ data });
  revalidatePath("/assets");
  return { ...log, cost: Number(log.cost) };
}
