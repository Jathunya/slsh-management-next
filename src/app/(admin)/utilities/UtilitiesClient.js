"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/Badge";
import { Table, Thead, Th, Tbody, Td, EmptyState } from "@/components/ui/Table";
import { Modal } from "@/components/ui/Modal";
import { Field, Input, Select } from "@/components/ui/Field";
import { formatCurrency, formatDate } from "@/lib/utils";
import { createBill } from "@/actions/bills";

const TABS = [
  { key: "ALL", label: "All" },
  { key: "UNPAID", label: "Unpaid" },
  { key: "PAID", label: "Paid" },
];

export function UtilitiesClient({ initialBills, units }) {
  const router = useRouter();
  const [tab, setTab] = useState("ALL");
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const now = new Date();
  const [form, setForm] = useState({
    unitId: units[0]?.id ?? "",
    type: "WATER",
    period: now.toLocaleString("en-US", { month: "long", year: "numeric" }),
    amount: "",
    dueDate: new Date(now.getFullYear(), now.getMonth(), 28).toISOString().slice(0, 10),
  });

  const filtered = useMemo(
    () => initialBills.filter((b) => tab === "ALL" || b.status === tab),
    [initialBills, tab]
  );

  async function handleCreate(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createBill(form);
      toast.success("Bill created");
      setModalOpen(false);
      setForm((f) => ({ ...f, amount: "" }));
      router.refresh();
    } catch (err) {
      toast.error(err.message ?? "Failed to create bill");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Utilities"
        description="Building-wide bill monitor"
        actions={<Button onClick={() => setModalOpen(true)}>Create Bill</Button>}
      />

      <div className="mb-4 flex gap-1 rounded-lg border border-border bg-card p-1 w-fit">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium ${
              tab === t.key ? "bg-brand text-brand-foreground" : "text-foreground/70 hover:bg-border/40"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <Table>
        <Thead>
          <tr>
            <Th>Unit</Th>
            <Th>Type</Th>
            <Th>Period</Th>
            <Th>Amount</Th>
            <Th>Due</Th>
            <Th>Status</Th>
          </tr>
        </Thead>
        <Tbody>
          {filtered.map((b) => (
            <tr key={b.id}>
              <Td className="font-medium text-foreground">{b.unit.number}</Td>
              <Td>{b.type}</Td>
              <Td>{b.period}</Td>
              <Td>{formatCurrency(b.amount)}</Td>
              <Td>{formatDate(b.dueDate)}</Td>
              <Td>
                <StatusBadge status={b.status} />
              </Td>
            </tr>
          ))}
        </Tbody>
      </Table>
      {filtered.length === 0 && <EmptyState title="No bills found" />}

      <Modal open={modalOpen} onOpenChange={setModalOpen} title="Create Bill">
        <form onSubmit={handleCreate} className="flex flex-col gap-3">
          <Field label="Unit">
            <Select value={form.unitId} onChange={(e) => setForm({ ...form, unitId: e.target.value })}>
              {units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.number}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Type">
            <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option value="WATER">Water</option>
              <option value="ELECTRIC">Electric</option>
            </Select>
          </Field>
          <Field label="Period">
            <Input required value={form.period} onChange={(e) => setForm({ ...form, period: e.target.value })} />
          </Field>
          <Field label="Amount (THB)">
            <Input
              type="number"
              min="0"
              step="0.01"
              required
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
            />
          </Field>
          <Field label="Due date">
            <Input
              type="date"
              required
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
            />
          </Field>
          <Button type="submit" disabled={submitting} className="mt-2">
            {submitting ? "Creating..." : "Create Bill"}
          </Button>
        </form>
      </Modal>
    </div>
  );
}
