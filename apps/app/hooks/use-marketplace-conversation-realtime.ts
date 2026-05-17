"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useRef, useState } from "react";

import type { MarketplaceMessageView } from "../lib/coach-network/marketplace-messages";
import { createAuthenticatedBrowserSupabase } from "../lib/supabase-browser";

export type MarketplaceRealtimeStatus =
  | "idle"
  | "connecting"
  | "subscribed"
  | "error"
  | "unavailable";

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
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const onMessageRef = useRef(onMessage);
  const [status, setStatus] = useState<MarketplaceRealtimeStatus>("idle");
  const [statusDetail, setStatusDetail] = useState<string | null>(null);

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    if (!conversationId) {
      setStatus("idle");
      setStatusDetail(null);
      return;
    }

    if (!isLoaded) {
      setStatus("connecting");
      return;
    }

    if (!isSignedIn) {
      setStatus("unavailable");
      setStatusDetail("Sign in to receive live messages.");
      return;
    }

    let channel: ReturnType<
      Awaited<ReturnType<typeof createAuthenticatedBrowserSupabase>>["client"]["channel"]
    > | null = null;
    let cancelled = false;

    async function subscribe() {
      setStatus("connecting");
      setStatusDetail(null);

      try {
        const { client, token } = await createAuthenticatedBrowserSupabase(() =>
          getToken({ template: "supabase" }),
        );

        if (cancelled) {
          return;
        }

        if (!token) {
          setStatus("error");
          setStatusDetail(
            'Missing Clerk JWT. Add a "supabase" JWT template (see docs/supabase/CN7-realtime-setup.md).',
          );
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
          .subscribe((subscribeStatus, err) => {
            if (cancelled) {
              return;
            }

            if (subscribeStatus === "SUBSCRIBED") {
              setStatus("subscribed");
              setStatusDetail(null);
              return;
            }

            if (
              subscribeStatus === "CHANNEL_ERROR" ||
              subscribeStatus === "TIMED_OUT"
            ) {
              setStatus("error");
              setStatusDetail(
                err?.message ??
                  "Realtime channel error. Run docs/supabase/013_marketplace_messages_realtime.sql and check Supabase publication.",
              );
            }
          });
      } catch (error) {
        if (!cancelled) {
          setStatus("error");
          setStatusDetail(
            error instanceof Error
              ? error.message
              : "Could not connect to Supabase Realtime.",
          );
        }
      }
    }

    void subscribe();

    return () => {
      cancelled = true;
      if (channel) {
        void channel.unsubscribe();
      }
    };
  }, [conversationId, getToken, isLoaded, isSignedIn]);

  return { status, statusDetail };
}
