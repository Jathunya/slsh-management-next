import { prisma } from "@/lib/prisma";
import { AssetsClient } from "./AssetsClient";

export default async function AssetsPage() {
  const assets = await prisma.asset.findMany({
    include: { maintenanceLog: { orderBy: { servicedAt: "desc" } } },
    orderBy: { name: "asc" },
  });

  const serializedAssets = assets.map((a) => ({
    ...a,
    value: Number(a.value),
    maintenanceLog: a.maintenanceLog.map((log) => ({ ...log, cost: Number(log.cost) })),
  }));

  return <AssetsClient initialAssets={serializedAssets} />;
}
