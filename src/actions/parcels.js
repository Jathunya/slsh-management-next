"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { assertRole } from "@/lib/auth";
import { generateParcelId } from "@/lib/pid";
import { threadFor } from "@/lib/thread";
import { revalidatePath } from "next/cache";

const parcelSchema = z
  .object({
    tracking: z.string().min(4),
    carrier: z.enum(["KERRY", "FLASH", "JT", "THAI_POST"]),
    unitId: z.string().min(1),
    recipientId: z.string().min(1),
    type: z.enum(["BOX", "WRAP", "DOCUMENT"]),
    size: z.enum(["S", "M", "L", "XL"]),
  })
  .refine((v) => !(v.type === "DOCUMENT" && v.size === "XL"), {
    message: "Documents cannot be Extra Large",
    path: ["size"],
  });

export async function createParcel(input) {
  const session = await assertRole("ADMIN");
  const data = parcelSchema.parse(input);

  const pid = await generateParcelId(prisma);
  const parcel = await prisma.parcel.create({ data: { ...data, pid } });

  const threadId = await threadFor(prisma, data.unitId);
  await prisma.message.create({
    data: {
      threadId,
      senderId: session.user.id,
      body: `Your parcel ${pid} has arrived and is pending pickup.`,
    },
  });
  await prisma.notification.create({
    data: {
      userId: data.recipientId,
      kind: "PARCEL_ARRIVED",
      body: `Your parcel ${pid} has arrived and is pending pickup.`,
    },
  });

  revalidatePath("/parcels");
  revalidatePath("/my-parcels");
  revalidatePath("/messages");
  return parcel;
}

export async function getPendingParcelCount() {
  await assertRole("ADMIN");
  return prisma.parcel.count({ where: { status: "PENDING" } });
}

export async function checkOutParcel(parcelId) {
  await assertRole("ADMIN");
  const parcel = await prisma.parcel.update({
    where: { id: parcelId },
    data: { status: "DELIVERED", checkOutAt: new Date() },
  });
  revalidatePath("/parcels");
  revalidatePath("/my-parcels");
  return parcel;
}
