"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useRef } from "react";

import type { MarketplaceMessageView } from "../lib/coach-network/marketplace-messages";
import { createAuthenticatedBrowserSupabase } from "../lib/supabase-browser";

function mapRow(row: Record<string, unknown>): MarketplaceMessageView | null {
  if (typeof row.id !== "string" || typeof row.conversation_id !== "string") {
    return null;
  }

  return {
    id: row.id,
    conversationId: row.conversation_id,
    senderUserId: String(row.sender_user_id ?? ""),
    body: String(row.body ?? ""),
    messageType: String(row.message_type ?? "text"),
    createdAt:
      typeof row.created_at === "string" ? row.created_at : new Date().toISOString(),
  };
}

export function useMarketplaceConversationRealtime(
  conversationId: string,
  onMessage: (message: MarketplaceMessageView) => void,
) {
  const { getToken } = useAuth();
  const onMessageRef = useRef(onMessage);

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    if (!conversationId) {
      return;
    }

    let channel: ReturnType<
      Awaited<ReturnType<typeof createAuthenticatedBrowserSupabase>>["client"]["channel"]
    > | null = null;
    let cancelled = false;

    async function subscribe() {
      try {
        const { client } = await createAuthenticatedBrowserSupabase(() =>
          getToken({ template: "supabase" }),
        );

        if (cancelled) {
          return;
        }

        channel = client
          .channel(`marketplace-messages:${conversationId}`)
          .on(
            "postgres_changes",
            {
              event: "INSERT",
              schema: "public",
              table: "marketplace_messages",
              filter: `conversation_id=eq.${conversationId}`,
            },
            (payload) => {
              const mapped = mapRow(payload.new as Record<string, unknown>);
              if (mapped) {
                onMessageRef.current(mapped);
              }
            },
          )
          .subscribe();
      } catch {
        // Realtime optional — send still refreshes via server actions.
      }
    }

    void subscribe();

    return () => {
      cancelled = true;
      if (channel) {
        void channel.unsubscribe();
      }
    };
  }, [conversationId, getToken]);
}
