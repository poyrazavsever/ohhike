"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import type { CreateCoachNetworkApplicationInput } from "../../lib/coach-network/application-types";
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

  await ensureSupabaseUser(userId);

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

  const { data: existing } = await supabase
    .from("coach_network_applications")
    .select("id")
    .eq("athlete_user_id", userId)
    .eq("coach_profile_id", coachProfile.id)
    .in("status", [...activeStatuses])
    .maybeSingle();

  if (existing) {
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

  const participants = [
    {
      conversation_id: conversation.id,
      user_id: userId,
      participant_role: "athlete" as const,
    },
    {
      conversation_id: conversation.id,
      user_id: coachProfile.coach_user_id,
      participant_role: "coach" as const,
    },
  ];

  const { error: participantsError } = await supabase
    .from("marketplace_conversation_participants")
    .insert(participants);

  if (participantsError) {
    return { ok: false, error: participantsError.message };
  }

  const now = new Date().toISOString();
  const { data: application, error: applicationError } = await supabase
    .from("coach_network_applications")
    .insert({
      athlete_user_id: userId,
      athlete_marketplace_profile_id: athleteProfile?.id ?? null,
      coach_profile_id: coachProfile.id,
      organization_id: coachProfile.organization_id,
      package_id: input.packageId ?? input.formData.preferredPackageId ?? null,
      conversation_id: conversation.id,
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
    .eq("id", conversation.id);

  await supabase.from("marketplace_messages").insert({
    conversation_id: conversation.id,
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
