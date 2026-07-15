import { prisma } from "@/lib/prisma";
import { ParcelsClient } from "./ParcelsClient";

export default async function ParcelsPage() {
  const [parcels, units, residents] = await Promise.all([
    prisma.parcel.findMany({
      include: { unit: { select: { number: true } }, recipient: { select: { name: true } } },
      orderBy: { checkInAt: "desc" },
    }),
    prisma.unit.findMany({ orderBy: { number: "asc" } }),
    prisma.user.findMany({ where: { role: "RESIDENT" }, orderBy: { name: "asc" } }),
  ]);

  return <ParcelsClient initialParcels={parcels} units={units} residents={residents} />;
}
