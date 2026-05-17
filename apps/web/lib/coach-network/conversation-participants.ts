import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "../database.types";

export type MarketplaceParticipantRole = "athlete" | "coach";

export type ConversationParticipantInput = {
  userId: string;
  role: MarketplaceParticipantRole;
};

/**
 * Idempotent participant rows for a thread (unique on conversation_id + user_id).
 */
export async function ensureConversationParticipants(
  supabase: SupabaseClient<Database>,
  conversationId: string,
  participants: ConversationParticipantInput[],
) {
  const byUserId = new Map<string, ConversationParticipantInput>();

  for (const participant of participants) {
    if (!participant.userId) {
      continue;
    }
    byUserId.set(participant.userId, participant);
  }

  const rows = [...byUserId.entries()].map(([userId, participant]) => ({
    conversation_id: conversationId,
    user_id: userId,
    participant_role: participant.role,
  }));

  if (rows.length === 0) {
    throw new Error("Conversation participants are missing.");
  }

  if (rows.length === 1) {
    throw new Error(
      "You cannot start a coaching conversation with yourself. Use a different account to apply, or browse coaches with another athlete profile.",
    );
  }

  const { error } = await supabase
    .from("marketplace_conversation_participants")
    .upsert(rows, { onConflict: "conversation_id,user_id" });

  if (error) {
    throw new Error(error.message);
  }
}
