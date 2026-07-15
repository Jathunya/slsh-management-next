import { cn } from "@/lib/utils";

export function Field({ label, error, children, className }) {
  return (
    <label className={cn("block", className)}>
      {label && <span className="mb-1 block text-sm font-medium text-foreground">{label}</span>}
      {children}
      {error && <span className="mt-1 block text-xs text-danger">{error}</span>}
    </label>
  );
}

export function Input({ className, ...props }) {
  return <input className={cn("field", className)} {...props} />;
}

export function Select({ className, children, ...props }) {
  return (
    <select className={cn("field", className)} {...props}>
      {children}
    </select>
  );
}

export function Textarea({ className, ...props }) {
  return <textarea className={cn("field", className)} {...props} />;
}
