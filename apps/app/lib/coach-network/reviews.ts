import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database, Json } from "../database.types";

export type ReviewMetadata = {
  reported?: boolean;
  reported_at?: string;
  reported_by?: string;
  report_reason?: string;
};

export type RelationshipCoachMetadata = {
  private_athlete_rating?: number;
  private_athlete_rating_note?: string;
  private_athlete_rated_at?: string;
  private_athlete_rated_by?: string;
};

export function parseReviewMetadata(value: Json | null): ReviewMetadata {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }
  const record = value as Record<string, unknown>;
  return {
    reported: record.reported === true,
    reported_at:
      typeof record.reported_at === "string" ? record.reported_at : undefined,
    reported_by:
      typeof record.reported_by === "string" ? record.reported_by : undefined,
    report_reason:
      typeof record.report_reason === "string" ? record.report_reason : undefined,
  };
}

export function parseRelationshipCoachMetadata(
  value: Json | null,
): RelationshipCoachMetadata {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }
  const record = value as Record<string, unknown>;
  return {
    private_athlete_rating:
      typeof record.private_athlete_rating === "number"
        ? record.private_athlete_rating
        : undefined,
    private_athlete_rating_note:
      typeof record.private_athlete_rating_note === "string"
        ? record.private_athlete_rating_note
        : undefined,
    private_athlete_rated_at:
      typeof record.private_athlete_rated_at === "string"
        ? record.private_athlete_rated_at
        : undefined,
    private_athlete_rated_by:
      typeof record.private_athlete_rated_by === "string"
        ? record.private_athlete_rated_by
        : undefined,
  };
}

export function ratingToReputationPoints(rating: number) {
  return (rating - 3) * 10;
}

export function canAthleteReviewRelationship(relationship: {
  status: string;
  payment_status: string;
}) {
  const statusOk =
    relationship.status === "active" || relationship.status === "completed";
  const paymentOk = relationship.payment_status !== "pending_manual";
  return statusOk && paymentOk;
}

export async function syncCoachProfileReviewAggregates(
  supabase: SupabaseClient<Database>,
  coachProfileId: string,
) {
  const { data: reviews, error } = await supabase
    .from("coach_reviews")
    .select("rating, metadata")
    .eq("coach_profile_id", coachProfileId)
    .eq("is_public", true)
    .not("moderated_at", "is", null);

  if (error) {
    throw new Error(error.message);
  }

  const visible = (reviews ?? []).filter((row) => !parseReviewMetadata(row.metadata).reported);
  const count = visible.length;
  const average =
    count > 0
      ? Math.round(
          (visible.reduce((sum, row) => sum + row.rating, 0) / count) * 100,
        ) / 100
      : null;

  const { error: updateError } = await supabase
    .from("coach_marketplace_profiles")
    .update({
      average_rating: average,
      review_count: count,
      updated_at: new Date().toISOString(),
    })
    .eq("id", coachProfileId);

  if (updateError) {
    throw new Error(updateError.message);
  }

  return { average, count };
}

export async function getCoachReputationScore(
  supabase: SupabaseClient<Database>,
  coachProfileId: string,
) {
  const { data, error } = await supabase
    .from("coach_reputation_events")
    .select("points_delta")
    .eq("coach_profile_id", coachProfileId);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).reduce((sum, row) => sum + row.points_delta, 0);
}
