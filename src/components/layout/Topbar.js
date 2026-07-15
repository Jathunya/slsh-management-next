"use client";

import { useState } from "react";
import { Menu, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { Drawer } from "@/components/ui/Modal";
import { SidebarNav } from "@/components/layout/Sidebar";
import { NotificationBell } from "@/components/layout/NotificationBell";

export function Topbar({ role, userName }) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          className="flex size-9 items-center justify-center rounded-lg text-foreground hover:bg-border/40 md:hidden"
          onClick={() => setDrawerOpen(true)}
        >
          <Menu size={20} />
        </button>
        <span className="text-sm font-medium text-foreground">{userName}</span>
      </div>

      <div className="flex items-center gap-2">
        <NotificationBell />
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-border/40"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">Sign out</span>
        </button>
      </div>

      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen} title="Menu" side="left">
        <SidebarNav role={role} />
      </Drawer>
    </header>
  );
}
