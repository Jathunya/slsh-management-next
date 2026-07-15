"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Table, Thead, Th, Tbody, Td, EmptyState } from "@/components/ui/Table";
import { Modal } from "@/components/ui/Modal";
import { Field, Input, Select } from "@/components/ui/Field";
import { createUnit, createResident } from "@/actions/residents";

export function ResidentsClient({ units, residents }) {
  const router = useRouter();
  const [unitModalOpen, setUnitModalOpen] = useState(false);
  const [residentModalOpen, setResidentModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [unitForm, setUnitForm] = useState({ number: "", floor: "", occupancy: "OWNER" });
  const [residentForm, setResidentForm] = useState({
    name: "",
    email: "",
    phone: "",
    unitId: units[0]?.id ?? "",
    password: "",
  });

  async function handleCreateUnit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createUnit(unitForm);
      toast.success("Unit added");
      setUnitModalOpen(false);
      setUnitForm({ number: "", floor: "", occupancy: "OWNER" });
      router.refresh();
    } catch (err) {
      toast.error(err.message ?? "Failed to add unit");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCreateResident(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createResident(residentForm);
      toast.success("Resident added");
      setResidentModalOpen(false);
      setResidentForm({ name: "", email: "", phone: "", unitId: units[0]?.id ?? "", password: "" });
      router.refresh();
    } catch (err) {
      toast.error(err.message ?? "Failed to add resident");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Residents"
        description="Units and resident accounts"
        actions={
          <>
            <Button variant="secondary" onClick={() => setUnitModalOpen(true)}>
              Add Unit
            </Button>
            <Button onClick={() => setResidentModalOpen(true)}>Add Resident</Button>
          </>
        }
      />

      <Table>
        <Thead>
          <tr>
            <Th>Name</Th>
            <Th>Unit</Th>
            <Th>Email</Th>
            <Th>Phone</Th>
          </tr>
        </Thead>
        <Tbody>
          {residents.map((r) => (
            <tr key={r.id}>
              <Td className="font-medium text-foreground">{r.name}</Td>
              <Td>
                <Badge tone="brand">{r.unit?.number ?? "—"}</Badge>
              </Td>
              <Td>{r.email}</Td>
              <Td>{r.phone ?? "—"}</Td>
            </tr>
          ))}
        </Tbody>
      </Table>
      {residents.length === 0 && <EmptyState title="No residents yet" />}

      <Modal open={unitModalOpen} onOpenChange={setUnitModalOpen} title="Add Unit">
        <form onSubmit={handleCreateUnit} className="flex flex-col gap-3">
          <Field label="Unit number">
            <Input required value={unitForm.number} onChange={(e) => setUnitForm({ ...unitForm, number: e.target.value })} />
          </Field>
          <Field label="Floor">
            <Input
              type="number"
              required
              value={unitForm.floor}
              onChange={(e) => setUnitForm({ ...unitForm, floor: e.target.value })}
            />
          </Field>
          <Field label="Occupancy">
            <Select value={unitForm.occupancy} onChange={(e) => setUnitForm({ ...unitForm, occupancy: e.target.value })}>
              <option value="OWNER">Owner</option>
              <option value="TENANT">Tenant</option>
            </Select>
          </Field>
          <Button type="submit" disabled={submitting} className="mt-2">
            {submitting ? "Saving..." : "Add Unit"}
          </Button>
        </form>
      </Modal>

      <Modal open={residentModalOpen} onOpenChange={setResidentModalOpen} title="Add Resident">
        <form onSubmit={handleCreateResident} className="flex flex-col gap-3">
          <Field label="Name">
            <Input
              required
              value={residentForm.name}
              onChange={(e) => setResidentForm({ ...residentForm, name: e.target.value })}
            />
          </Field>
          <Field label="Email">
            <Input
              type="email"
              required
              value={residentForm.email}
              onChange={(e) => setResidentForm({ ...residentForm, email: e.target.value })}
            />
          </Field>
          <Field label="Phone">
            <Input
              value={residentForm.phone}
              onChange={(e) => setResidentForm({ ...residentForm, phone: e.target.value })}
            />
          </Field>
          <Field label="Unit">
            <Select
              value={residentForm.unitId}
              onChange={(e) => setResidentForm({ ...residentForm, unitId: e.target.value })}
            >
              {units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.number}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Temporary password">
            <Input
              type="text"
              required
              minLength={6}
              value={residentForm.password}
              onChange={(e) => setResidentForm({ ...residentForm, password: e.target.value })}
            />
          </Field>
          <Button type="submit" disabled={submitting} className="mt-2">
            {submitting ? "Saving..." : "Add Resident"}
          </Button>
        </form>
      </Modal>
    </div>
  );
}
