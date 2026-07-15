"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { QrCode } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { formatCurrency, formatDate } from "@/lib/utils";
import { payBill } from "@/actions/bills";

export function BillsClient({ initialBills }) {
  const router = useRouter();
  const [payTarget, setPayTarget] = useState(null);
  const [paying, setPaying] = useState(false);

  const unpaidTotal = useMemo(
    () => initialBills.filter((b) => b.status === "UNPAID").reduce((sum, b) => sum + Number(b.amount), 0),
    [initialBills]
  );

  async function handlePay() {
    setPaying(true);
    try {
      await payBill(payTarget.id);
      toast.success("Payment confirmed");
      setPayTarget(null);
      router.refresh();
    } catch (err) {
      toast.error(err.message ?? "Payment failed");
    } finally {
      setPaying(false);
    }
  }

  return (
    <div>
      <PageHeader title="Bills" description="Water and electricity charges for your unit" />

      <Card className="mb-6 flex items-center justify-between bg-brand/5">
        <div>
          <p className="text-sm text-muted">Outstanding balance</p>
          <p className="mt-1 text-2xl font-semibold text-foreground">{formatCurrency(unpaidTotal)}</p>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {initialBills.map((bill) => (
          <Card key={bill.id}>
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium text-foreground">{bill.type}</p>
                <p className="text-xs text-muted">{bill.period}</p>
              </div>
              <StatusBadge status={bill.status} />
            </div>
            <p className="mt-3 text-xl font-semibold text-foreground">{formatCurrency(bill.amount)}</p>
            <p className="mt-1 text-xs text-muted">Due {formatDate(bill.dueDate)}</p>
            {bill.status === "UNPAID" ? (
              <Button size="sm" className="mt-3 w-full" onClick={() => setPayTarget(bill)}>
                <QrCode size={14} /> Pay Now
              </Button>
            ) : (
              <p className="mt-3 text-xs text-muted">Paid {formatDate(bill.paidAt)}</p>
            )}
          </Card>
        ))}
      </div>
      {initialBills.length === 0 && <p className="mt-6 text-center text-sm text-muted">No bills yet.</p>}

      <Modal open={!!payTarget} onOpenChange={(v) => !v && setPayTarget(null)} title="Scan to Pay">
        {payTarget && (
          <div className="flex flex-col items-center gap-4">
            <div className="flex size-48 items-center justify-center rounded-xl border-2 border-dashed border-border bg-border/10">
              <QrCode size={96} className="text-muted" />
            </div>
            <div className="text-center">
              <p className="text-sm text-muted">
                {payTarget.type} · {payTarget.period}
              </p>
              <p className="text-xl font-semibold text-foreground">{formatCurrency(payTarget.amount)}</p>
            </div>
            <Button onClick={handlePay} disabled={paying} className="w-full">
              {paying ? "Confirming..." : "Confirm Payment"}
            </Button>
            <p className="text-center text-xs text-muted">Simulated payment for demo purposes.</p>
          </div>
        )}
      </Modal>
    </div>
  );
}
