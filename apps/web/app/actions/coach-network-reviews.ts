"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

import {
  canAthleteReviewRelationship,
  parseReviewMetadata,
  ratingToReputationPoints,
  syncCoachProfileReviewAggregates,
} from "../../lib/coach-network/reviews";
import type { Json } from "../../lib/database.types";
import { createSupabaseAdminClient } from "../../lib/supabase-admin";

type ActionResult = { ok: true } | { ok: false; error: string };

function cleanString(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export async function listAthleteReviewOpportunities() {
  const { userId } = await auth();
  if (!userId) {
    return [];
  }

  const supabase = createSupabaseAdminClient();
  const { data: relationships, error } = await supabase
    .from("remote_coaching_relationships")
    .select(
      "id, status, payment_status, coach_profile_id, organization_id, created_at",
    )
    .eq("athlete_user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const rows = relationships ?? [];
  const profileIds = [...new Set(rows.map((r) => r.coach_profile_id))];
  const relationshipIds = rows.map((r) => r.id);

  const [{ data: profiles }, { data: reviews }] = await Promise.all([
    profileIds.length > 0
      ? supabase
          .from("coach_marketplace_profiles")
          .select("id, slug, display_name, photo_url")
          .in("id", profileIds)
      : { data: [] },
    relationshipIds.length > 0
      ? supabase
          .from("coach_reviews")
          .select("id, relationship_id, rating, created_at")
          .in("relationship_id", relationshipIds)
          .eq("athlete_user_id", userId)
      : { data: [] },
  ]);

  const profileById = new Map((profiles ?? []).map((p) => [p.id, p]));
  const reviewByRelationship = new Map(
    (reviews ?? []).map((r) => [r.relationship_id, r]),
  );

  return rows
    .filter((row) => canAthleteReviewRelationship(row))
    .map((row) => ({
      relationshipId: row.id,
      coachProfile: profileById.get(row.coach_profile_id) ?? null,
      existingReview: reviewByRelationship.get(row.id) ?? null,
    }));
}

export async function submitCoachReview(input: {
  relationshipId: string;
  rating: number;
  title?: string;
  body?: string;
  isPublic?: boolean;
}): Promise<ActionResult> {
  const { userId } = await auth();
  if (!userId) {
    return { ok: false, error: "You must be signed in." };
  }

  if (input.rating < 1 || input.rating > 5) {
    return { ok: false, error: "Rating must be between 1 and 5." };
  }

  try {
    const supabase = createSupabaseAdminClient();
    const { data: relationship, error: relationshipError } = await supabase
      .from("remote_coaching_relationships")
      .select("*")
      .eq("id", input.relationshipId)
      .eq("athlete_user_id", userId)
      .maybeSingle();

    if (relationshipError || !relationship) {
      return { ok: false, error: "Coaching relationship not found." };
    }

    if (!canAthleteReviewRelationship(relationship)) {
      return {
        ok: false,
        error: "You can review after payment is confirmed and coaching is active.",
      };
    }

    const { data: existing } = await supabase
      .from("coach_reviews")
      .select("id")
      .eq("relationship_id", relationship.id)
      .eq("athlete_user_id", userId)
      .maybeSingle();

    if (existing) {
      return { ok: false, error: "You already reviewed this coach." };
    }

    const isPublic = input.isPublic !== false;
    const now = new Date().toISOString();

    const { data: review, error: insertError } = await supabase
      .from("coach_reviews")
      .insert({
        relationship_id: relationship.id,
        coach_profile_id: relationship.coach_profile_id,
        organization_id: relationship.organization_id,
        athlete_user_id: userId,
        rating: input.rating,
        title: cleanString(input.title),
        body: cleanString(input.body),
        is_public: isPublic,
        moderated_at: isPublic ? now : null,
      })
      .select("id")
      .single();

    if (insertError || !review) {
      return { ok: false, error: insertError?.message ?? "Could not save review." };
    }

    await supabase.from("coach_reputation_events").insert({
      coach_profile_id: relationship.coach_profile_id,
      organization_id: relationship.organization_id,
      event_type: "review",
      points_delta: ratingToReputationPoints(input.rating),
      reference_id: review.id,
      metadata: { rating: input.rating } as Json,
    });

    if (isPublic) {
      await syncCoachProfileReviewAggregates(
        supabase,
        relationship.coach_profile_id,
      );
    }

    revalidatePath("/athlete/reviews");
    revalidatePath("/find-coach");
    revalidatePath(`/coach-network/coaches/${relationship.coach_profile_id}`);

    const { data: profile } = await supabase
      .from("coach_marketplace_profiles")
      .select("slug")
      .eq("id", relationship.coach_profile_id)
      .maybeSingle();

    if (profile?.slug) {
      revalidatePath(`/coach-network/coaches/${profile.slug}`);
    }

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Could not submit review.",
    };
  }
}

export async function reportCoachReview(input: {
  reviewId: string;
  reason?: string;
}): Promise<ActionResult> {
  const { userId } = await auth();
  if (!userId) {
    return { ok: false, error: "You must be signed in." };
  }

  try {
    const supabase = createSupabaseAdminClient();
    const { data: review, error } = await supabase
      .from("coach_reviews")
      .select("id, metadata, coach_profile_id, is_public")
      .eq("id", input.reviewId)
      .maybeSingle();

    if (error || !review) {
      return { ok: false, error: "Review not found." };
    }

    const metadata = parseReviewMetadata(review.metadata);
    if (metadata.reported) {
      return { ok: true };
    }

    const now = new Date().toISOString();
    const { error: updateError } = await supabase
      .from("coach_reviews")
      .update({
        metadata: {
          ...metadata,
          reported: true,
          reported_at: now,
          reported_by: userId,
          report_reason: cleanString(input.reason),
        } as Json,
        is_public: false,
        updated_at: now,
      })
      .eq("id", review.id);

    if (updateError) {
      return { ok: false, error: updateError.message };
    }

    await syncCoachProfileReviewAggregates(supabase, review.coach_profile_id);

    const { data: profile } = await supabase
      .from("coach_marketplace_profiles")
      .select("slug")
      .eq("id", review.coach_profile_id)
      .maybeSingle();

    if (profile?.slug) {
      revalidatePath(`/coach-network/coaches/${profile.slug}`);
    }

    revalidatePath("/find-coach");
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Could not report review.",
    };
  }
}
