"use client";

import { useState } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Bell } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMyNotifications, markAllNotificationsRead } from "@/actions/notifications";
import { formatDateTime } from "@/lib/utils";

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications"],
    queryFn: getMyNotifications,
    refetchInterval: 5000,
  });

  const markRead = useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <DropdownMenu.Root
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next && unreadCount > 0) markRead.mutate();
      }}
    >
      <DropdownMenu.Trigger asChild>
        <button className="relative flex size-9 items-center justify-center rounded-lg text-foreground hover:bg-border/40">
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute right-1.5 top-1.5 flex size-2 rounded-full bg-danger" />
          )}
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="z-50 w-80 max-h-96 overflow-y-auto scrollbar-thin rounded-xl border border-border bg-card p-2 shadow-xl"
        >
          <p className="px-2 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted">Notifications</p>
          {notifications.length === 0 && (
            <p className="px-2 py-4 text-center text-sm text-muted">You&apos;re all caught up.</p>
          )}
          {notifications.map((n) => (
            <div key={n.id} className="rounded-lg px-2 py-2 text-sm hover:bg-border/30">
              <p className="text-foreground">{n.body}</p>
              <p className="mt-0.5 text-xs text-muted">{formatDateTime(n.createdAt)}</p>
            </div>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
