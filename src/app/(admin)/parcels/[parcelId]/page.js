import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { StatusBadge, Badge } from "@/components/ui/Badge";
import { formatDateTime } from "@/lib/utils";

export default async function ParcelDetailPage({ params }) {
  const { parcelId } = await params;
  const parcel = await prisma.parcel.findUnique({
    where: { id: parcelId },
    include: { unit: true, recipient: true },
  });

  if (!parcel) notFound();

  return (
    <div>
      <PageHeader title={`Parcel ${parcel.pid}`} description="Check-in / check-out detail" />

      <Card className="max-w-xl">
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-muted">Status</dt>
            <dd className="mt-1">
              <StatusBadge status={parcel.status} />
            </dd>
          </div>
          <div>
            <dt className="text-muted">Type / Size</dt>
            <dd className="mt-1">
              <Badge tone="neutral">
                {parcel.type} / {parcel.size}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-muted">Carrier</dt>
            <dd className="mt-1 font-medium text-foreground">{parcel.carrier}</dd>
          </div>
          <div>
            <dt className="text-muted">Tracking No.</dt>
            <dd className="mt-1 font-medium text-foreground">{parcel.tracking}</dd>
          </div>
          <div>
            <dt className="text-muted">Unit</dt>
            <dd className="mt-1 font-medium text-foreground">{parcel.unit.number}</dd>
          </div>
          <div>
            <dt className="text-muted">Recipient</dt>
            <dd className="mt-1 font-medium text-foreground">{parcel.recipient.name}</dd>
          </div>
          <div>
            <dt className="text-muted">Checked In</dt>
            <dd className="mt-1 font-medium text-foreground">{formatDateTime(parcel.checkInAt)}</dd>
          </div>
          <div>
            <dt className="text-muted">Checked Out</dt>
            <dd className="mt-1 font-medium text-foreground">{formatDateTime(parcel.checkOutAt)}</dd>
          </div>
        </dl>
      </Card>

      <Link href="/parcels" className="mt-4 inline-block text-sm text-brand hover:underline">
        ← Back to parcels
      </Link>
    </div>
  );
}
