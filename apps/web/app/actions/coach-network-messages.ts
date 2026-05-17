"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

import {
  conversationTypeLabel,
  MARKETPLACE_MESSAGE_MAX_LENGTH,
  MARKETPLACE_MESSAGE_MIN_INTERVAL_MS,
  type MarketplaceConversationView,
  type MarketplaceMessageView,
} from "../../lib/coach-network/marketplace-messages";
import { createSupabaseAdminClient } from "../../lib/supabase-admin";

type ActionResult =
  | { ok: true; message: MarketplaceMessageView }
  | { ok: false; error: string };

function cleanBody(value: string) {
  return value.trim();
}

async function requireUserId() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("You must be signed in.");
  }
  return userId;
}

async function assertConversationParticipant(
  conversationId: string,
  userId: string,
) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("marketplace_conversation_participants")
    .select("id")
    .eq("conversation_id", conversationId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error("You are not a participant in this conversation.");
  }
}

export async function listMarketplaceConversationsForUser(): Promise<
  MarketplaceConversationView[]
> {
  const userId = await requireUserId();
  const supabase = createSupabaseAdminClient();

  const { data: memberships, error } = await supabase
    .from("marketplace_conversation_participants")
    .select("conversation_id")
    .eq("user_id", userId);

  if (error) {
    throw new Error(error.message);
  }

  const conversationIds = (memberships ?? []).map((row) => row.conversation_id);
  if (conversationIds.length === 0) {
    return [];
  }

  const { data: conversations, error: conversationsError } = await supabase
    .from("marketplace_conversations")
    .select("id, conversation_type, last_message_at")
    .in("id", conversationIds)
    .order("last_message_at", { ascending: false, nullsFirst: false });

  if (conversationsError) {
    throw new Error(conversationsError.message);
  }

  const rows = conversations ?? [];
  const previews = await Promise.all(
    rows.map(async (conversation) => {
      const { data: lastMessage } = await supabase
        .from("marketplace_messages")
        .select("body")
        .eq("conversation_id", conversation.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      return {
        id: conversation.id,
        conversationType: conversation.conversation_type,
        lastMessageAt: conversation.last_message_at,
        preview: lastMessage?.body ?? null,
        label: conversationTypeLabel(conversation.conversation_type),
      };
    }),
  );

  return previews;
}

export async function getMarketplaceConversationMessages(
  conversationId: string,
): Promise<MarketplaceMessageView[]> {
  const userId = await requireUserId();
  await assertConversationParticipant(conversationId, userId);

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("marketplace_messages")
    .select("id, conversation_id, sender_user_id, body, message_type, created_at")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    conversationId: row.conversation_id,
    senderUserId: row.sender_user_id,
    body: row.body,
    messageType: row.message_type,
    createdAt: row.created_at,
  }));
}

export async function sendMarketplaceMessage(
  conversationId: string,
  body: string,
): Promise<ActionResult> {
  try {
    const userId = await requireUserId();
    const trimmed = cleanBody(body);

    if (!trimmed) {
      return { ok: false, error: "Message cannot be empty." };
    }

    if (trimmed.length > MARKETPLACE_MESSAGE_MAX_LENGTH) {
      return {
        ok: false,
        error: `Message is too long (max ${MARKETPLACE_MESSAGE_MAX_LENGTH} characters).`,
      };
    }

    await assertConversationParticipant(conversationId, userId);
    const supabase = createSupabaseAdminClient();
    const now = new Date().toISOString();

    const { data: recent } = await supabase
      .from("marketplace_messages")
      .select("created_at")
      .eq("conversation_id", conversationId)
      .eq("sender_user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (recent?.created_at) {
      const elapsed = Date.now() - new Date(recent.created_at).getTime();
      if (elapsed < MARKETPLACE_MESSAGE_MIN_INTERVAL_MS) {
        return { ok: false, error: "Please wait a moment before sending again." };
      }
    }

    const { data: conversation } = await supabase
      .from("marketplace_conversations")
      .select("organization_id")
      .eq("id", conversationId)
      .maybeSingle();

    const { data: inserted, error: insertError } = await supabase
      .from("marketplace_messages")
      .insert({
        conversation_id: conversationId,
        organization_id: conversation?.organization_id ?? null,
        sender_user_id: userId,
        body: trimmed,
        message_type: "text",
      })
      .select("id, conversation_id, sender_user_id, body, message_type, created_at")
      .single();

    if (insertError || !inserted) {
      return { ok: false, error: insertError?.message ?? "Could not send message." };
    }

    await supabase
      .from("marketplace_conversations")
      .update({ last_message_at: now })
      .eq("id", conversationId);

    revalidatePath("/athlete/messages");
    revalidatePath(`/athlete/messages/${conversationId}`);
    revalidatePath("/coach-network/messages");
    revalidatePath(`/coach-network/messages/${conversationId}`);

    return {
      ok: true,
      message: {
        id: inserted.id,
        conversationId: inserted.conversation_id,
        senderUserId: inserted.sender_user_id,
        body: inserted.body,
        messageType: inserted.message_type,
        createdAt: inserted.created_at,
      },
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Could not send message.",
    };
  }
}
