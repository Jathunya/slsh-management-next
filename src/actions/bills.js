"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { assertRole, requireSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

const billSchema = z.object({
  unitId: z.string().min(1),
  type: z.enum(["WATER", "ELECTRIC"]),
  period: z.string().min(1),
  amount: z.coerce.number().positive(),
  dueDate: z.coerce.date(),
});

export async function createBill(input) {
  await assertRole("ADMIN");
  const data = billSchema.parse(input);

  const bill = await prisma.bill.create({ data });

  const residents = await prisma.user.findMany({
    where: { unitId: data.unitId, role: "RESIDENT" },
  });
  if (residents.length > 0) {
    await prisma.notification.createMany({
      data: residents.map((u) => ({
        userId: u.id,
        kind: "BILL_CREATED",
        body: `Your ${data.period} ${data.type} bill is ready.`,
      })),
    });
  }

  revalidatePath("/utilities");
  revalidatePath("/bills");
  return { ...bill, amount: Number(bill.amount) };
}

export async function payBill(billId) {
  const session = await requireSession();
  const bill = await prisma.bill.findUnique({ where: { id: billId } });
  if (!bill) throw new Error("Bill not found");
  if (session.user.role !== "ADMIN" && session.user.unitId !== bill.unitId) {
    throw new Error("Unauthorized");
  }
  if (bill.status === "PAID") throw new Error("Bill already paid");

  const paidAt = new Date();
  const [updated] = await prisma.$transaction([
    prisma.bill.update({ where: { id: billId }, data: { status: "PAID", paidAt } }),
    prisma.payment.create({
      data: { billId, amount: bill.amount, method: "QR", paidAt },
    }),
  ]);

  revalidatePath("/utilities");
  revalidatePath("/bills");
  return { ...updated, amount: Number(updated.amount) };
}
