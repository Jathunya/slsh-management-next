import { prisma } from "@/lib/prisma";
import { UtilitiesClient } from "./UtilitiesClient";

export default async function UtilitiesPage() {
  const [bills, units] = await Promise.all([
    prisma.bill.findMany({
      include: { unit: { select: { number: true } } },
      orderBy: { dueDate: "desc" },
    }),
    prisma.unit.findMany({ orderBy: { number: "asc" } }),
  ]);

  const serializedBills = bills.map((b) => ({ ...b, amount: Number(b.amount) }));

  return <UtilitiesClient initialBills={serializedBills} units={units} />;
}
