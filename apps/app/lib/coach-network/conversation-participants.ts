import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "../database.types";

export type MarketplaceParticipantRole = "athlete" | "coach";

export type ConversationParticipantInput = {
  userId: string;
  role: MarketplaceParticipantRole;
};

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
      "This conversation needs two different participants (athlete and coach).",
    );
  }

  const { error } = await supabase
    .from("marketplace_conversation_participants")
    .upsert(rows, { onConflict: "conversation_id,user_id" });

  if (error) {
    throw new Error(error.message);
  }
}
