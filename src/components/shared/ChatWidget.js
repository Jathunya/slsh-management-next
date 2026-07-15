"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MessageCircle, Send, X } from "lucide-react";
import { toast } from "sonner";
import { getMyThread, sendMessage } from "@/actions/messages";
import { formatDateTime, cn } from "@/lib/utils";

export function ChatWidget({ unitId }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const queryClient = useQueryClient();
  const scrollRef = useRef(null);

  const { data } = useQuery({
    queryKey: ["myThread"],
    queryFn: getMyThread,
    refetchInterval: open ? 4000 : false,
  });

  const messages = data?.messages ?? [];

  const send = useMutation({
    mutationFn: () => sendMessage({ unitId, body: draft.trim() }),
    onSuccess: () => {
      setDraft("");
      queryClient.invalidateQueries({ queryKey: ["myThread"] });
    },
    onError: () => toast.error("Message failed to send"),
  });

  useEffect(() => {
    if (open && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [open, messages.length]);

  if (!unitId) return null;

  return (
    <div className="fixed bottom-5 right-5 z-40">
      {open && (
        <div className="mb-3 flex h-96 w-80 flex-col rounded-xl border border-border bg-card shadow-xl">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <p className="text-sm font-semibold text-foreground">Building Office</p>
            <button onClick={() => setOpen(false)} className="text-muted hover:text-foreground">
              <X size={16} />
            </button>
          </div>
          <div ref={scrollRef} className="flex-1 space-y-2 overflow-y-auto scrollbar-thin px-3 py-3">
            {messages.length === 0 && (
              <p className="mt-8 text-center text-sm text-muted">Say hello to the building office.</p>
            )}
            {messages.map((m) => {
              const isAdmin = m.sender.role === "ADMIN";
              return (
                <div key={m.id} className={cn("flex flex-col", isAdmin ? "items-start" : "items-end")}>
                  <div
                    className={cn(
                      "max-w-[80%] rounded-lg px-3 py-2 text-sm",
                      isAdmin ? "bg-border/40 text-foreground" : "bg-brand text-brand-foreground"
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
            className="flex items-center gap-2 border-t border-border p-3"
          >
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Type a message..."
              className="field h-9 py-1.5"
            />
            <button
              type="submit"
              disabled={send.isPending}
              className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand text-brand-foreground disabled:opacity-50"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex size-12 items-center justify-center rounded-full bg-brand text-brand-foreground shadow-lg hover:bg-brand/90"
      >
        {open ? <X size={20} /> : <MessageCircle size={20} />}
      </button>
    </div>
  );
}
