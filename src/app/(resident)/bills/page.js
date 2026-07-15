import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BillsClient } from "./BillsClient";

export default async function BillsPage() {
  const session = await auth();
  const bills = await prisma.bill.findMany({
    where: { unitId: session.user.unitId },
    orderBy: { dueDate: "desc" },
  });

  const serializedBills = bills.map((b) => ({ ...b, amount: Number(b.amount) }));

  return <BillsClient initialBills={serializedBills} />;
}
