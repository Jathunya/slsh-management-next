"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { getPendingParcelCount } from "@/actions/parcels";
import { getUnreadThreadCount } from "@/actions/messages";
import { HouseHeartIcon } from "@/components/shared/HouseHeartIcon";

const NAV = {
  ADMIN: [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/parcels", label: "Parcels", badgeKey: "parcels" },
    { href: "/assets", label: "Assets" },
    { href: "/residents", label: "Residents" },
    { href: "/utilities", label: "Utilities" },
    { href: "/messages", label: "Messages", badgeKey: "messages" },
  ],
  RESIDENT: [
    { href: "/my-parcels", label: "My Parcels" },
    { href: "/bills", label: "Bills" },
    { href: "/profile", label: "Profile" },
  ],
};

export function SidebarNav({ role, variant = "light" }) {
  const pathname = usePathname();
  const items = NAV[role] ?? [];
  const dark = variant === "dark";
  const isAdmin = role === "ADMIN";

  const { data: pendingParcels = 0 } = useQuery({
    queryKey: ["pendingParcelCount"],
    queryFn: getPendingParcelCount,
    enabled: isAdmin,
    refetchInterval: 10000,
  });
  const { data: unreadThreads = 0 } = useQuery({
    queryKey: ["unreadThreadCount"],
    queryFn: getUnreadThreadCount,
    enabled: isAdmin,
    refetchInterval: 10000,
  });

  const badgeCounts = { parcels: pendingParcels, messages: unreadThreads };

  return (
    <nav className="flex flex-col gap-1">
      {items.map((item) => {
        const active = pathname?.startsWith(item.href);
        const count = item.badgeKey ? badgeCounts[item.badgeKey] : 0;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              dark
                ? active
                  ? "bg-sidebar-active text-sidebar-active-foreground"
                  : "text-sidebar-foreground hover:bg-white/5 hover:text-white"
                : active
                  ? "bg-brand text-brand-foreground"
                  : "text-foreground/80 hover:bg-border/40"
            )}
          >
            <span>{item.label}</span>
            {count > 0 && (
              <span className="flex min-w-5 items-center justify-center rounded-full bg-notification px-1.5 py-0.5 text-[11px] font-semibold text-white">
                {count}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

export function Sidebar({ role }) {
  return (
    <aside className="hidden w-60 shrink-0 border-r border-sidebar-border bg-sidebar px-4 py-6 md:block">
      <div className="mb-8 flex items-center gap-2.5 px-2">
        <div className="flex size-9 items-center justify-center rounded-xl bg-brand text-brand-foreground">
          <HouseHeartIcon size={18} />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-semibold tracking-wide text-white">SLSH</span>
          <span className="text-xs text-sidebar-foreground">Mailroom console</span>
        </div>
      </div>
      <SidebarNav role={role} variant="dark" />
    </aside>
  );
}
