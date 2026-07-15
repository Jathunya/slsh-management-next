import { prisma } from "@/lib/prisma";
import { ResidentsClient } from "./ResidentsClient";

export default async function ResidentsPage() {
  const [units, residents] = await Promise.all([
    prisma.unit.findMany({ orderBy: { number: "asc" } }),
    prisma.user.findMany({
      where: { role: "RESIDENT" },
      include: { unit: { select: { number: true } } },
      orderBy: { name: "asc" },
    }),
  ]);

  return <ResidentsClient units={units} residents={residents} />;
}
