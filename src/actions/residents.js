"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { assertRole } from "@/lib/auth";
import { revalidatePath } from "next/cache";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const unitSchema = z.object({
  number: z.string().min(1),
  floor: z.coerce.number().int(),
  occupancy: z.enum(["OWNER", "TENANT"]),
});

export async function createUnit(input) {
  await assertRole("ADMIN");
  const data = unitSchema.parse(input);
  const unit = await prisma.unit.create({ data });
  revalidatePath("/residents");
  return unit;
}

const residentSchema = z.object({
  name: z.string().min(2),
  email: z.string().regex(emailRegex, "Invalid email"),
  phone: z.string().optional(),
  unitId: z.string().min(1),
  password: z.string().min(6),
});

export async function createResident(input) {
  await assertRole("ADMIN");
  const data = residentSchema.parse(input);
  const passwordHash = await bcrypt.hash(data.password, 10);
  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone,
      unitId: data.unitId,
      passwordHash,
      role: "RESIDENT",
    },
  });
  revalidatePath("/residents");
  return user;
}
