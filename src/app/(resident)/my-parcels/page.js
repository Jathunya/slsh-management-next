import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/PageHeader";
import { Table, Thead, Th, Tbody, Td, EmptyState } from "@/components/ui/Table";
import { StatusBadge, Badge } from "@/components/ui/Badge";
import { formatDateTime } from "@/lib/utils";

export default async function MyParcelsPage() {
  const session = await auth();
  const parcels = await prisma.parcel.findMany({
    where: { recipientId: session.user.id },
    orderBy: { checkInAt: "desc" },
  });

  return (
    <div>
      <PageHeader title="My Parcels" description="Deliveries addressed to you" />

      <Table>
        <Thead>
          <tr>
            <Th>PID</Th>
            <Th>Carrier</Th>
            <Th>Type / Size</Th>
            <Th>Status</Th>
            <Th>Checked In</Th>
            <Th>Checked Out</Th>
          </tr>
        </Thead>
        <Tbody>
          {parcels.map((p) => (
            <tr key={p.id}>
              <Td className="font-medium text-foreground">{p.pid}</Td>
              <Td>{p.carrier}</Td>
              <Td>
                <Badge tone="neutral">
                  {p.type} / {p.size}
                </Badge>
              </Td>
              <Td>
                <StatusBadge status={p.status} />
              </Td>
              <Td>{formatDateTime(p.checkInAt)}</Td>
              <Td>{formatDateTime(p.checkOutAt)}</Td>
            </tr>
          ))}
        </Tbody>
      </Table>
      {parcels.length === 0 && (
        <EmptyState title="No parcels yet" description="You'll see deliveries here once checked in by the front desk." />
      )}
    </div>
  );
}
