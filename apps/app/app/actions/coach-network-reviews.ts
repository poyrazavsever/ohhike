"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

import {
  parseRelationshipCoachMetadata,
  parseReviewMetadata,
  syncCoachProfileReviewAggregates,
} from "../../lib/coach-network/reviews";
import type { Json } from "../../lib/database.types";
import { writeWorkspaceAuditLog } from "../../lib/audit-log";
import { isCoachStaffRole } from "../../lib/org-roles";
import { createSupabaseAdminClient } from "../../lib/supabase-admin";
import { getCurrentWorkspace } from "../../lib/workspace";

type ActionResult = { ok: true } | { ok: false; error: string };

async function requireCoachStaff() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("You must be signed in.");
  }

  const workspace = await getCurrentWorkspace();
  if (!isCoachStaffRole(workspace.membership.role)) {
    throw new Error("Only coaching staff can manage reviews.");
  }

  return { userId, workspace };
}

function cleanString(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export async function listCoachReviewsForWorkspace() {
  const { workspace } = await requireCoachStaff();
  const supabase = createSupabaseAdminClient();

  const { data: reviews, error } = await supabase
    .from("coach_reviews")
    .select("*")
    .eq("organization_id", workspace.organization.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (reviews ?? []).map((review) => ({
    ...review,
    metadataParsed: parseReviewMetadata(review.metadata),
  }));
}

export async function moderateCoachReview(input: {
  reviewId: string;
  isPublic: boolean;
  clearReport?: boolean;
}): Promise<ActionResult> {
  try {
    const { userId, workspace } = await requireCoachStaff();
    const supabase = createSupabaseAdminClient();
    const now = new Date().toISOString();

    const { data: review, error } = await supabase
      .from("coach_reviews")
      .select("*")
      .eq("id", input.reviewId)
      .eq("organization_id", workspace.organization.id)
      .maybeSingle();

    if (error || !review) {
      return { ok: false, error: "Review not found." };
    }

    const metadata = parseReviewMetadata(review.metadata);
    const nextMetadata =
      input.clearReport && metadata.reported
        ? {
            reported: false,
            reported_at: undefined,
            reported_by: undefined,
            report_reason: undefined,
          }
        : metadata;

    const { error: updateError } = await supabase
      .from("coach_reviews")
      .update({
        is_public: input.isPublic,
        moderated_at: input.isPublic ? now : null,
        metadata: nextMetadata as Json,
        updated_at: now,
      })
      .eq("id", review.id);

    if (updateError) {
      return { ok: false, error: updateError.message };
    }

    await syncCoachProfileReviewAggregates(supabase, review.coach_profile_id);

    await writeWorkspaceAuditLog({
      organizationId: workspace.organization.id,
      userId,
      role: workspace.membership.role,
      action: `coach_network.review.moderated`,
      entityType: "coach_review",
      entityId: review.id,
    });

    revalidatePath("/coach-network/reviews");
    revalidatePath("/coach-network/profile");
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Could not moderate review.",
    };
  }
}

export async function setPrivateAthleteRating(input: {
  relationshipId: string;
  rating: number;
  note?: string;
}): Promise<ActionResult> {
  try {
    const { userId, workspace } = await requireCoachStaff();

    if (input.rating < 1 || input.rating > 5) {
      return { ok: false, error: "Rating must be between 1 and 5." };
    }

    const supabase = createSupabaseAdminClient();
    const { data: relationship, error } = await supabase
      .from("remote_coaching_relationships")
      .select("id, metadata")
      .eq("id", input.relationshipId)
      .eq("organization_id", workspace.organization.id)
      .maybeSingle();

    if (error || !relationship) {
      return { ok: false, error: "Relationship not found." };
    }

    const existing = parseRelationshipCoachMetadata(relationship.metadata);
    const now = new Date().toISOString();

    const { error: updateError } = await supabase
      .from("remote_coaching_relationships")
      .update({
        metadata: {
          ...existing,
          private_athlete_rating: input.rating,
          private_athlete_rating_note: cleanString(input.note),
          private_athlete_rated_at: now,
          private_athlete_rated_by: userId,
        } as Json,
        updated_at: now,
      })
      .eq("id", relationship.id);

    if (updateError) {
      return { ok: false, error: updateError.message };
    }

    revalidatePath(`/coach-network/remote-athletes/${relationship.id}`);
    revalidatePath("/coach-network/remote-athletes");
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error ? error.message : "Could not save private rating.",
    };
  }
}

export async function reportCoachReviewFromCoach(input: {
  reviewId: string;
  reason?: string;
}): Promise<ActionResult> {
  try {
    const { userId, workspace } = await requireCoachStaff();
    const supabase = createSupabaseAdminClient();
    const now = new Date().toISOString();

    const { data: review, error } = await supabase
      .from("coach_reviews")
      .select("id, metadata, coach_profile_id")
      .eq("id", input.reviewId)
      .eq("organization_id", workspace.organization.id)
      .maybeSingle();

    if (error || !review) {
      return { ok: false, error: "Review not found." };
    }

    const metadata = parseReviewMetadata(review.metadata);
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

    revalidatePath("/coach-network/reviews");
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Could not report review.",
    };
  }
}
