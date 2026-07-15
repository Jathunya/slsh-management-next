"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/PageHeader";
import { listThreads, getThreadMessages, sendMessage } from "@/actions/messages";
import { cn, formatDateTime } from "@/lib/utils";

export function MessagesClient({ initialThreads }) {
  const [selectedUnitId, setSelectedUnitId] = useState(initialThreads[0]?.unitId ?? null);
  const [draft, setDraft] = useState("");
  const queryClient = useQueryClient();
  const scrollRef = useRef(null);

  const { data: threads = initialThreads } = useQuery({
    queryKey: ["threads"],
    queryFn: listThreads,
    initialData: initialThreads,
    refetchInterval: 5000,
  });

  const selectedThread = threads.find((t) => t.unitId === selectedUnitId);

  const { data: messages = [] } = useQuery({
    queryKey: ["threadMessages", selectedThread?.id],
    queryFn: () => getThreadMessages(selectedThread.id),
    enabled: !!selectedThread,
    refetchInterval: 4000,
  });

  const send = useMutation({
    mutationFn: () => sendMessage({ unitId: selectedUnitId, body: draft.trim() }),
    onSuccess: () => {
      setDraft("");
      queryClient.invalidateQueries({ queryKey: ["threadMessages", selectedThread?.id] });
      queryClient.invalidateQueries({ queryKey: ["threads"] });
    },
    onError: () => toast.error("Message failed to send"),
  });

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages.length]);

  return (
    <div>
      <PageHeader title="Messages" description="Resident conversations by unit" />

      <div className="flex h-[calc(100vh-13rem)] overflow-hidden rounded-xl border border-border">
        <div className="w-64 shrink-0 overflow-y-auto scrollbar-thin border-r border-border bg-card">
          {threads.map((t) => {
            const lastMessage = t.messages[0];
            return (
              <button
                key={t.id}
                onClick={() => setSelectedUnitId(t.unitId)}
                className={cn(
                  "block w-full border-b border-border px-4 py-3 text-left",
                  selectedUnitId === t.unitId ? "bg-brand/10" : "hover:bg-border/30"
                )}
              >
                <p className="text-sm font-medium text-foreground">Unit {t.unit.number}</p>
                <p className="mt-0.5 truncate text-xs text-muted">{lastMessage?.body ?? "No messages yet"}</p>
              </button>
            );
          })}
          {threads.length === 0 && <p className="p-4 text-sm text-muted">No conversations yet.</p>}
        </div>

        <div className="flex flex-1 flex-col bg-background">
          {selectedThread ? (
            <>
              <div className="border-b border-border bg-card px-4 py-3">
                <p className="text-sm font-semibold text-foreground">Unit {selectedThread.unit.number}</p>
              </div>
              <div ref={scrollRef} className="flex-1 space-y-2 overflow-y-auto scrollbar-thin px-4 py-4">
                {messages.map((m) => {
                  const isAdmin = m.sender.role === "ADMIN";
                  return (
                    <div key={m.id} className={cn("flex flex-col", isAdmin ? "items-end" : "items-start")}>
                      <div
                        className={cn(
                          "max-w-[70%] rounded-lg px-3 py-2 text-sm",
                          isAdmin ? "bg-brand text-brand-foreground" : "bg-card border border-border text-foreground"
                        )}
                      >
                        {m.body}
                      </div>
                      <span className="mt-0.5 text-[10px] text-muted">{formatDateTime(m.createdAt)}</span>
                    </div>
                  );
                })}
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (draft.trim()) send.mutate();
                }}
                className="flex items-center gap-2 border-t border-border bg-card p-3"
              >
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Reply to resident..."
                  className="field h-10"
                />
                <button
                  type="submit"
                  disabled={send.isPending}
                  className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand text-brand-foreground disabled:opacity-50"
                >
                  <Send size={16} />
                </button>
              </form>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center text-sm text-muted">
              Select a conversation
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
