import { cn } from "@/lib/utils";

export function Table({ className, children }) {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-border">
      <table className={cn("w-full border-collapse text-sm", className)}>{children}</table>
    </div>
  );
}

export function Thead({ children }) {
  return <thead className="border-b border-border bg-border/20 text-left text-xs uppercase tracking-wide text-muted">{children}</thead>;
}

export function Th({ className, children }) {
  return <th className={cn("px-4 py-3 font-medium", className)}>{children}</th>;
}

export function Tbody({ children }) {
  return <tbody className="divide-y divide-border">{children}</tbody>;
}

export function Td({ className, children }) {
  return <td className={cn("px-4 py-3 align-middle", className)}>{children}</td>;
}

export function EmptyState({ title, description }) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 px-4 py-12 text-center">
      <p className="text-sm font-medium text-foreground">{title}</p>
      {description && <p className="text-sm text-muted">{description}</p>}
    </div>
  );
}
