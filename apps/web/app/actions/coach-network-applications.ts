"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import type { CreateCoachNetworkApplicationInput } from "../../lib/coach-network/application-types";
import { ensureConversationParticipants } from "../../lib/coach-network/conversation-participants";
import { ensureSupabaseUser } from "../../lib/ensure-supabase-user";
import { createSupabaseAdminClient } from "../../lib/supabase-admin";

type ActionResult =
  | { ok: true; applicationId: string }
  | { ok: false; error: string };

const activeStatuses = ["draft", "submitted", "under_review"] as const;

export async function createCoachNetworkApplication(
  input: CreateCoachNetworkApplicationInput,
): Promise<ActionResult> {
  const { userId } = await auth();

  if (!userId) {
    return { ok: false, error: "You must be signed in to apply." };
  }

  const message = input.athleteMessage.trim();
  if (!message) {
    return { ok: false, error: "Please tell the coach why you want to work with them." };
  }

  const { consents } = input.formData;
  if (
    !consents.shareProfile ||
    !consents.shareGoals ||
    !consents.shareContact ||
    !consents.acceptedTerms
  ) {
    return { ok: false, error: "All consent checkboxes are required." };
  }

  const supabase = createSupabaseAdminClient();

  const { data: coachProfile, error: coachError } = await supabase
    .from("coach_marketplace_profiles")
    .select("id, organization_id, coach_user_id, display_name, is_public, is_accepting_clients")
    .eq("id", input.coachProfileId)
    .maybeSingle();

  if (coachError) {
    return { ok: false, error: coachError.message };
  }

  if (!coachProfile?.is_public) {
    return { ok: false, error: "This coach profile is not available." };
  }

  if (!coachProfile.is_accepting_clients) {
    return { ok: false, error: "This coach is not accepting new clients." };
  }

  if (coachProfile.coach_user_id === userId) {
    return {
      ok: false,
      error: "You cannot apply to your own coaching profile. Sign in as an athlete test account or choose another coach.",
    };
  }

  await ensureSupabaseUser(userId);
  await ensureSupabaseUser(coachProfile.coach_user_id);

  const { data: existingApplication } = await supabase
    .from("coach_network_applications")
    .select("id, status, conversation_id")
    .eq("athlete_user_id", userId)
    .eq("coach_profile_id", coachProfile.id)
    .in("status", [...activeStatuses])
    .maybeSingle();

  if (existingApplication && existingApplication.status !== "draft") {
    return {
      ok: false,
      error: "You already have an active application with this coach.",
    };
  }

  const { data: athleteProfile } = await supabase
    .from("athlete_marketplace_profiles")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  let conversationId = existingApplication?.conversation_id ?? null;

  if (!conversationId) {
    const { data: conversation, error: conversationError } = await supabase
      .from("marketplace_conversations")
      .insert({
        conversation_type: "application",
        organization_id: coachProfile.organization_id,
      })
      .select("id")
      .single();

    if (conversationError || !conversation) {
      return {
        ok: false,
        error: conversationError?.message ?? "Could not start conversation.",
      };
    }

    conversationId = conversation.id;
  }

  try {
    await ensureConversationParticipants(supabase, conversationId, [
      { userId, role: "athlete" },
      { userId: coachProfile.coach_user_id, role: "coach" },
    ]);
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Could not add conversation participants.",
    };
  }

  const now = new Date().toISOString();

  if (existingApplication?.status === "draft") {
    const { data: updated, error: updateError } = await supabase
      .from("coach_network_applications")
      .update({
        athlete_marketplace_profile_id: athleteProfile?.id ?? null,
        package_id: input.packageId ?? input.formData.preferredPackageId ?? null,
        conversation_id: conversationId,
        status: "submitted",
        athlete_message: message,
        form_data: input.formData,
        submitted_at: now,
        metadata: {
          coachDisplayName: coachProfile.display_name,
        },
      })
      .eq("id", existingApplication.id)
      .select("id")
      .single();

    if (updateError || !updated) {
      return {
        ok: false,
        error: updateError?.message ?? "Could not update application.",
      };
    }

    await supabase
      .from("marketplace_conversations")
      .update({
        context_id: updated.id,
        last_message_at: now,
      })
      .eq("id", conversationId);

    await supabase.from("marketplace_messages").insert({
      conversation_id: conversationId,
      organization_id: coachProfile.organization_id,
      sender_user_id: userId,
      body: message,
      message_type: "text",
      metadata: { applicationId: updated.id },
    });

    revalidatePath("/athlete/applications");
    revalidatePath("/find-coach");

    return { ok: true, applicationId: updated.id };
  }

  const { data: application, error: applicationError } = await supabase
    .from("coach_network_applications")
    .insert({
      athlete_user_id: userId,
      athlete_marketplace_profile_id: athleteProfile?.id ?? null,
      coach_profile_id: coachProfile.id,
      organization_id: coachProfile.organization_id,
      package_id: input.packageId ?? input.formData.preferredPackageId ?? null,
      conversation_id: conversationId,
      status: "submitted",
      athlete_message: message,
      form_data: input.formData,
      submitted_at: now,
      metadata: {
        coachDisplayName: coachProfile.display_name,
      },
    })
    .select("id")
    .single();

  if (applicationError || !application) {
    return {
      ok: false,
      error: applicationError?.message ?? "Could not create application.",
    };
  }

  await supabase
    .from("marketplace_conversations")
    .update({
      context_id: application.id,
      last_message_at: now,
    })
    .eq("id", conversationId);

  await supabase.from("marketplace_messages").insert({
    conversation_id: conversationId,
    organization_id: coachProfile.organization_id,
    sender_user_id: userId,
    body: message,
    message_type: "text",
    metadata: { applicationId: application.id },
  });

  revalidatePath("/athlete/applications");
  revalidatePath("/find-coach");

  return { ok: true, applicationId: application.id };
}

export async function createCoachNetworkApplicationAndRedirect(
  input: CreateCoachNetworkApplicationInput,
) {
  const result = await createCoachNetworkApplication(input);

  if (!result.ok) {
    return result;
  }

  redirect(`/athlete/applications?submitted=${result.applicationId}`);
}

export async function listAthleteApplications() {
  const { userId } = await auth();

  if (!userId) {
    return [];
  }

  const supabase = createSupabaseAdminClient();
  const { data: applications, error } = await supabase
    .from("coach_network_applications")
    .select(
      "id, status, athlete_message, coach_response, submitted_at, created_at, coach_profile_id",
    )
    .eq("athlete_user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const rows = applications ?? [];
  const coachIds = [...new Set(rows.map((row) => row.coach_profile_id))];

  const { data: coaches } =
    coachIds.length > 0
      ? await supabase
          .from("coach_marketplace_profiles")
          .select("id, slug, display_name, photo_url")
          .in("id", coachIds)
      : { data: [] };

  const coachById = new Map((coaches ?? []).map((coach) => [coach.id, coach]));

  return rows.map((row) => ({
    id: row.id,
    status: row.status,
    athlete_message: row.athlete_message,
    coach_response: row.coach_response,
    submitted_at: row.submitted_at,
    created_at: row.created_at,
    coach_profile: coachById.get(row.coach_profile_id) ?? null,
  }));
}
