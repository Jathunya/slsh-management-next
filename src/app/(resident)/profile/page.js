import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";

export default async function ProfilePage() {
  const session = await auth();
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { unit: { include: { vehicles: true } } },
  });

  return (
    <div>
      <PageHeader title="Profile" description="Your account and unit details" />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <div className="flex items-center gap-4">
            <div className="flex size-14 items-center justify-center rounded-full bg-brand/10 text-lg font-semibold text-brand">
              {user.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)}
            </div>
            <div>
              <p className="font-semibold text-foreground">{user.name}</p>
              <p className="text-sm text-muted">{user.email}</p>
            </div>
          </div>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">Phone</dt>
              <dd className="font-medium text-foreground">{user.phone ?? "—"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Role</dt>
              <dd className="font-medium text-foreground">Resident</dd>
            </div>
          </dl>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <p className="font-semibold text-foreground">Unit {user.unit?.number}</p>
            {user.unit && <Badge tone="brand">{user.unit.occupancy}</Badge>}
          </div>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">Floor</dt>
              <dd className="font-medium text-foreground">{user.unit?.floor ?? "—"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Contract Start</dt>
              <dd className="font-medium text-foreground">{formatDate(user.unit?.contractStart)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Contract End</dt>
              <dd className="font-medium text-foreground">{formatDate(user.unit?.contractEnd)}</dd>
            </div>
            {user.unit?.vehicles?.length > 0 && (
              <div className="flex justify-between">
                <dt className="text-muted">Vehicle Plate</dt>
                <dd className="font-medium text-foreground">{user.unit.vehicles[0].plate}</dd>
              </div>
            )}
          </dl>
        </Card>
      </div>
    </div>
  );
}
