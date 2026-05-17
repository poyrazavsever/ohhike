"use client";

import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState, useTransition } from "react";

import { sendMarketplaceMessage } from "../../../actions/coach-network-messages";
import { useMarketplaceConversationRealtime } from "../../../../hooks/use-marketplace-conversation-realtime";
import {
  MARKETPLACE_MESSAGE_MAX_LENGTH,
  type MarketplaceMessageView,
} from "../../../../lib/coach-network/marketplace-messages";

function fieldClassName() {
  return "mt-2 w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm font-medium outline-none focus:border-primary focus:ring-2 focus:ring-primary/15";
}

export function ConversationThread({
  conversationId,
  initialMessages,
  backHref,
}: {
  conversationId: string;
  initialMessages: MarketplaceMessageView[];
  backHref: string;
}) {
  const router = useRouter();
  const { userId } = useAuth();
  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const mergeMessage = useCallback((incoming: MarketplaceMessageView) => {
    setMessages((current) => {
      if (current.some((message) => message.id === incoming.id)) {
        return current;
      }
      return [...current, incoming];
    });
  }, []);

  useMarketplaceConversationRealtime(conversationId, mergeMessage);

  const sortedMessages = useMemo(
    () =>
      [...messages].sort((a, b) => {
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return aTime - bTime;
      }),
    [messages],
  );

  function submit() {
    setError(null);
    startTransition(async () => {
      const result = await sendMarketplaceMessage(conversationId, draft);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setDraft("");
      router.refresh();
    });
  }

  return (
    <>
      <Link
        href={backHref}
        className="mb-4 inline-block text-sm font-semibold text-primary hover:text-primary-hover"
      >
        ← Messages
      </Link>

      <div className="flex min-h-[28rem] flex-col rounded-3xl border border-border bg-card">
        <div className="flex-1 space-y-3 overflow-y-auto p-5">
          {sortedMessages.length === 0 ? (
            <p className="text-sm text-muted-foreground">No messages yet. Say hello.</p>
          ) : (
            sortedMessages.map((message) => {
              const isMine = message.senderUserId === userId;
              const isSystem = message.messageType === "system";

              return (
                <div
                  key={message.id}
                  className={
                    isSystem
                      ? "mx-auto max-w-md rounded-xl bg-muted px-3 py-2 text-center text-xs text-muted-foreground"
                      : isMine
                        ? "ml-8 rounded-2xl bg-primary-soft px-4 py-3 text-sm"
                        : "mr-8 rounded-2xl bg-muted px-4 py-3 text-sm"
                  }
                >
                  <p className="whitespace-pre-wrap">{message.body}</p>
                </div>
              );
            })
          )}
        </div>

        <div className="border-t border-border p-4">
          <textarea
            className={`${fieldClassName()} min-h-20`}
            value={draft}
            maxLength={MARKETPLACE_MESSAGE_MAX_LENGTH}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Write a message…"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
          />
          <div className="mt-2 flex items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              {draft.length}/{MARKETPLACE_MESSAGE_MAX_LENGTH}
            </p>
            <button
              type="button"
              disabled={isPending || !draft.trim()}
              onClick={submit}
              className="rounded-full bg-primary px-4 py-2 text-xs font-extrabold text-white disabled:opacity-60"
            >
              {isPending ? "Sending…" : "Send"}
            </button>
          </div>
          {error ? <p className="mt-2 text-sm text-destructive">{error}</p> : null}
        </div>
      </div>
    </>
  );
}
