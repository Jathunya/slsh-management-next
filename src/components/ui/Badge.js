import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", {
  variants: {
    tone: {
      neutral: "bg-border/60 text-foreground",
      brand: "bg-brand/10 text-brand",
      success: "bg-success/10 text-success",
      warn: "bg-warn/10 text-warn",
      danger: "bg-danger/10 text-danger",
    },
  },
  defaultVariants: { tone: "neutral" },
});

export function Badge({ className, tone, ...props }) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}

const STATUS_TONE = {
  PENDING: "warn",
  DELIVERED: "success",
  UNPAID: "danger",
  PAID: "success",
};

const STATUS_LABEL = {
  PENDING: "Pending",
  DELIVERED: "Delivered",
  UNPAID: "Unpaid",
  PAID: "Paid",
};

export function StatusBadge({ status, className }) {
  return (
    <Badge tone={STATUS_TONE[status] ?? "neutral"} className={className}>
      {STATUS_LABEL[status] ?? status}
    </Badge>
  );
}
