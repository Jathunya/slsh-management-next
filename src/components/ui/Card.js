import { cn } from "@/lib/utils";

export function Card({ className, children }) {
  return <div className={cn("rounded-xl border border-border bg-card p-5 shadow-sm", className)}>{children}</div>;
}

export function Stack({ className, gap = "gap-4", children }) {
  return <div className={cn("flex flex-col", gap, className)}>{children}</div>;
}

export function StatCard({ label, value, hint, icon: Icon }) {
  return (
    <Card className="flex items-center justify-between">
      <div>
        <p className="text-sm text-muted">{label}</p>
        <p className="mt-1 text-2xl font-semibold text-foreground">{value}</p>
        {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
      </div>
      {Icon && (
        <div className="flex size-11 items-center justify-center rounded-lg bg-brand/10 text-brand">
          <Icon size={20} />
        </div>
      )}
    </Card>
  );
}
