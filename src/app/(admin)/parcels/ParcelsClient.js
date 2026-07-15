"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { StatusBadge, Badge } from "@/components/ui/Badge";
import { Table, Thead, Th, Tbody, Td, EmptyState } from "@/components/ui/Table";
import { Modal } from "@/components/ui/Modal";
import { Field, Input, Select } from "@/components/ui/Field";
import { formatDateTime } from "@/lib/utils";
import { createParcel, checkOutParcel } from "@/actions/parcels";

const CARRIERS = ["KERRY", "FLASH", "JT", "THAI_POST"];
const TYPES = ["BOX", "WRAP", "DOCUMENT"];
const SIZES = ["S", "M", "L", "XL"];
const TABS = [
  { key: "ALL", label: "All" },
  { key: "PENDING", label: "Pending" },
  { key: "DELIVERED", label: "Delivered" },
];

export function ParcelsClient({ initialParcels, units, residents }) {
  const router = useRouter();
  const [tab, setTab] = useState("ALL");
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    tracking: "",
    carrier: CARRIERS[0],
    unitId: units[0]?.id ?? "",
    recipientId: "",
    type: TYPES[0],
    size: SIZES[0],
  });

  const unitResidents = useMemo(
    () => residents.filter((r) => r.unitId === form.unitId),
    [residents, form.unitId]
  );

  const filtered = useMemo(() => {
    return initialParcels.filter((p) => {
      if (tab !== "ALL" && p.status !== tab) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          p.pid.toLowerCase().includes(q) ||
          p.tracking.toLowerCase().includes(q) ||
          p.unit.number.toLowerCase().includes(q) ||
          p.recipient.name.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [initialParcels, tab, search]);

  async function handleCreate(e) {
    e.preventDefault();
    if (form.type === "DOCUMENT" && form.size === "XL") {
      toast.error("Documents cannot be Extra Large");
      return;
    }
    if (!form.recipientId) {
      toast.error("Select a recipient");
      return;
    }
    setSubmitting(true);
    try {
      await createParcel(form);
      toast.success("Parcel checked in");
      setModalOpen(false);
      setForm((f) => ({ ...f, tracking: "", recipientId: "" }));
      router.refresh();
    } catch (err) {
      toast.error(err.message ?? "Failed to check in parcel");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCheckOut(parcelId) {
    try {
      await checkOutParcel(parcelId);
      toast.success("Parcel checked out");
      router.refresh();
    } catch (err) {
      toast.error(err.message ?? "Failed to check out parcel");
    }
  }

  return (
    <div>
      <PageHeader
        title="Parcels"
        description="Check-in and track resident deliveries"
        actions={<Button onClick={() => setModalOpen(true)}>Check In Parcel</Button>}
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1 rounded-lg border border-border bg-card p-1">
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
        <Input
          placeholder="Search PID, tracking, unit, recipient..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sm:w-72"
        />
      </div>

      <Table>
        <Thead>
          <tr>
            <Th>PID</Th>
            <Th>Unit</Th>
            <Th>Recipient</Th>
            <Th>Carrier</Th>
            <Th>Type / Size</Th>
            <Th>Status</Th>
            <Th>Checked In</Th>
            <Th />
          </tr>
        </Thead>
        <Tbody>
          {filtered.map((p) => (
            <tr key={p.id}>
              <Td>
                <Link href={`/parcels/${p.id}`} className="font-medium text-brand hover:underline">
                  {p.pid}
                </Link>
              </Td>
              <Td>{p.unit.number}</Td>
              <Td>{p.recipient.name}</Td>
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
              <Td>
                {p.status === "PENDING" && (
                  <Button size="sm" variant="success" onClick={() => handleCheckOut(p.id)}>
                    Check Out
                  </Button>
                )}
              </Td>
            </tr>
          ))}
        </Tbody>
      </Table>
      {filtered.length === 0 && <EmptyState title="No parcels found" description="Try a different filter or search." />}

      <Modal open={modalOpen} onOpenChange={setModalOpen} title="Check In Parcel">
        <form onSubmit={handleCreate} className="flex flex-col gap-3">
          <Field label="Tracking number">
            <Input
              required
              minLength={4}
              value={form.tracking}
              onChange={(e) => setForm({ ...form, tracking: e.target.value })}
            />
          </Field>
          <Field label="Carrier">
            <Select value={form.carrier} onChange={(e) => setForm({ ...form, carrier: e.target.value })}>
              {CARRIERS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Unit">
            <Select
              value={form.unitId}
              onChange={(e) => setForm({ ...form, unitId: e.target.value, recipientId: "" })}
            >
              {units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.number}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Recipient">
            <Select
              required
              value={form.recipientId}
              onChange={(e) => setForm({ ...form, recipientId: e.target.value })}
            >
              <option value="">Select resident...</option>
              {unitResidents.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Type">
              <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                {TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Size">
              <Select value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })}>
                {SIZES.filter((s) => !(form.type === "DOCUMENT" && s === "XL")).map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <Button type="submit" disabled={submitting} className="mt-2">
            {submitting ? "Checking in..." : "Check In"}
          </Button>
        </form>
      </Modal>
    </div>
  );
}
