"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export function Modal({ open, onOpenChange, title, description, children, className }) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in" />
        <Dialog.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-card p-6 shadow-xl focus:outline-none",
            className
          )}
        >
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              {title && <Dialog.Title className="text-lg font-semibold text-foreground">{title}</Dialog.Title>}
              {description && (
                <Dialog.Description className="mt-1 text-sm text-muted">{description}</Dialog.Description>
              )}
            </div>
            <Dialog.Close className="rounded-md p-1 text-muted hover:bg-border/50 hover:text-foreground">
              <X size={18} />
            </Dialog.Close>
          </div>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function Drawer({ open, onOpenChange, title, children, side = "right", className }) {
  const sideClass = side === "right" ? "right-0 top-0 h-full" : "left-0 top-0 h-full w-72";
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm" />
        <Dialog.Content
          className={cn(
            "fixed z-50 w-[92vw] max-w-sm border-l border-border bg-card p-6 shadow-xl focus:outline-none",
            sideClass,
            className
          )}
        >
          <div className="mb-4 flex items-center justify-between">
            {title && <Dialog.Title className="text-lg font-semibold text-foreground">{title}</Dialog.Title>}
            <Dialog.Close className="rounded-md p-1 text-muted hover:bg-border/50 hover:text-foreground">
              <X size={18} />
            </Dialog.Close>
          </div>
          <div className="h-[calc(100%-3rem)] overflow-y-auto scrollbar-thin">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
