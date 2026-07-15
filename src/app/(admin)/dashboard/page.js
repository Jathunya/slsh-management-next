import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatCard, Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { Package, Wallet, Users, Wrench } from "lucide-react";

export default async function DashboardPage() {
  const [pendingParcels, unpaidBills, residentCount, assetCount, recentParcels, recentBills] =
    await Promise.all([
      prisma.parcel.count({ where: { status: "PENDING" } }),
      prisma.bill.aggregate({ where: { status: "UNPAID" }, _sum: { amount: true }, _count: true }),
      prisma.user.count({ where: { role: "RESIDENT" } }),
      prisma.asset.count(),
      prisma.parcel.findMany({
        include: { unit: { select: { number: true } }, recipient: { select: { name: true } } },
        orderBy: { checkInAt: "desc" },
        take: 5,
      }),
      prisma.bill.findMany({
        where: { status: "UNPAID" },
        include: { unit: { select: { number: true } } },
        orderBy: { dueDate: "asc" },
        take: 5,
      }),
    ]);

  return (
    <div>
      <PageHeader title="Dashboard" description="Building overview at a glance" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Pending Parcels" value={pendingParcels} icon={Package} />
        <StatCard
          label="Unpaid Bills"
          value={formatCurrency(unpaidBills._sum.amount ?? 0)}
          hint={`${unpaidBills._count} bill(s)`}
          icon={Wallet}
        />
        <StatCard label="Residents" value={residentCount} icon={Users} />
        <StatCard label="Assets Tracked" value={assetCount} icon={Wrench} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="mb-3 text-sm font-semibold text-foreground">Recent Parcel Activity</h2>
          <div className="flex flex-col divide-y divide-border">
            {recentParcels.length === 0 && <p className="py-6 text-center text-sm text-muted">No parcels yet.</p>}
            {recentParcels.map((p) => (
              <div key={p.id} className="flex items-center justify-between py-2.5 text-sm">
                <div>
                  <p className="font-medium text-foreground">
                    {p.pid} · Unit {p.unit.number}
                  </p>
                  <p className="text-xs text-muted">
                    {p.recipient.name} · {formatDateTime(p.checkInAt)}
                  </p>
                </div>
                <StatusBadge status={p.status} />
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="mb-3 text-sm font-semibold text-foreground">Bills Awaiting Payment</h2>
          <div className="flex flex-col divide-y divide-border">
            {recentBills.length === 0 && <p className="py-6 text-center text-sm text-muted">All bills settled.</p>}
            {recentBills.map((b) => (
              <div key={b.id} className="flex items-center justify-between py-2.5 text-sm">
                <div>
                  <p className="font-medium text-foreground">
                    Unit {b.unit.number} · {b.type}
                  </p>
                  <p className="text-xs text-muted">
                    {b.period} · due {formatDateTime(b.dueDate)}
                  </p>
                </div>
                <span className="font-medium text-foreground">{formatCurrency(b.amount)}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
