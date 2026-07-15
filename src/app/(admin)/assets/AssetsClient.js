"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { formatCurrency, formatDate } from "@/lib/utils";
import { createAsset, logMaintenance } from "@/actions/assets";
import { Wrench } from "lucide-react";

const CATEGORIES = ["ELEVATOR", "GENERATOR", "SECURITY", "POOL", "GYM", "COMMON"];
const CONDITIONS = ["GOOD", "FAIR", "POOR"];
const CONDITION_TONE = { GOOD: "success", FAIR: "warn", POOR: "danger" };

export function AssetsClient({ initialAssets }) {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const [logAsset, setLogAsset] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [assetForm, setAssetForm] = useState({
    serial: "",
    name: "",
    category: CATEGORIES[0],
    location: "",
    value: "",
    condition: CONDITIONS[0],
  });
  const [logForm, setLogForm] = useState({ note: "", cost: "" });

  async function handleCreateAsset(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createAsset(assetForm);
      toast.success("Asset added");
      setCreateOpen(false);
      setAssetForm({ serial: "", name: "", category: CATEGORIES[0], location: "", value: "", condition: CONDITIONS[0] });
      router.refresh();
    } catch (err) {
      toast.error(err.message ?? "Failed to add asset");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleLogMaintenance(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await logMaintenance({ assetId: logAsset.id, note: logForm.note, cost: logForm.cost });
      toast.success("Maintenance logged");
      setLogAsset(null);
      setLogForm({ note: "", cost: "" });
      router.refresh();
    } catch (err) {
      toast.error(err.message ?? "Failed to log maintenance");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Assets"
        description="Building equipment and maintenance history"
        actions={<Button onClick={() => setCreateOpen(true)}>Add Asset</Button>}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {initialAssets.map((asset) => (
          <Card key={asset.id}>
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium text-foreground">{asset.name}</p>
                <p className="text-xs text-muted">
                  {asset.serial} · {asset.location}
                </p>
              </div>
              <Badge tone={CONDITION_TONE[asset.condition] ?? "neutral"}>{asset.condition}</Badge>
            </div>
            <div className="mt-3 flex items-center justify-between text-sm">
              <Badge tone="brand">{asset.category}</Badge>
              <span className="font-medium text-foreground">{formatCurrency(asset.value)}</span>
            </div>

            {asset.maintenanceLog.length > 0 && (
              <div className="mt-3 space-y-1.5 border-t border-border pt-3">
                {asset.maintenanceLog.slice(0, 2).map((log) => (
                  <div key={log.id} className="text-xs text-muted">
                    <span className="text-foreground">{formatDate(log.servicedAt)}</span> — {log.note} (
                    {formatCurrency(log.cost)})
                  </div>
                ))}
              </div>
            )}

            <Button
              size="sm"
              variant="secondary"
              className="mt-3 w-full"
              onClick={() => setLogAsset(asset)}
            >
              <Wrench size={14} /> Log Maintenance
            </Button>
          </Card>
        ))}
      </div>

      <Modal open={createOpen} onOpenChange={setCreateOpen} title="Add Asset">
        <form onSubmit={handleCreateAsset} className="flex flex-col gap-3">
          <Field label="Name">
            <Input required value={assetForm.name} onChange={(e) => setAssetForm({ ...assetForm, name: e.target.value })} />
          </Field>
          <Field label="Serial">
            <Input required value={assetForm.serial} onChange={(e) => setAssetForm({ ...assetForm, serial: e.target.value })} />
          </Field>
          <Field label="Location">
            <Input required value={assetForm.location} onChange={(e) => setAssetForm({ ...assetForm, location: e.target.value })} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Category">
              <Select value={assetForm.category} onChange={(e) => setAssetForm({ ...assetForm, category: e.target.value })}>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Condition">
              <Select value={assetForm.condition} onChange={(e) => setAssetForm({ ...assetForm, condition: e.target.value })}>
                {CONDITIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <Field label="Value (THB)">
            <Input
              type="number"
              min="0"
              required
              value={assetForm.value}
              onChange={(e) => setAssetForm({ ...assetForm, value: e.target.value })}
            />
          </Field>
          <Button type="submit" disabled={submitting} className="mt-2">
            {submitting ? "Saving..." : "Add Asset"}
          </Button>
        </form>
      </Modal>

      <Modal open={!!logAsset} onOpenChange={(v) => !v && setLogAsset(null)} title={`Log Maintenance — ${logAsset?.name ?? ""}`}>
        <form onSubmit={handleLogMaintenance} className="flex flex-col gap-3">
          <Field label="Note">
            <Textarea
              required
              rows={3}
              value={logForm.note}
              onChange={(e) => setLogForm({ ...logForm, note: e.target.value })}
            />
          </Field>
          <Field label="Cost (THB)">
            <Input
              type="number"
              min="0"
              required
              value={logForm.cost}
              onChange={(e) => setLogForm({ ...logForm, cost: e.target.value })}
            />
          </Field>
          <Button type="submit" disabled={submitting} className="mt-2">
            {submitting ? "Saving..." : "Save Log"}
          </Button>
        </form>
      </Modal>
    </div>
  );
}
