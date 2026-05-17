import type { SportType } from "../database.types";
import { getCoachReputationScore, parseReviewMetadata } from "./reviews";
import { createSupabaseAdminClient } from "../supabase-admin";
import type {
  PublicCoachCard,
  PublicCoachListFilters,
  PublicCoachProfile,
} from "./types";

type CoachProfileRow = {
  id: string;
  slug: string;
  display_name: string;
  headline: string | null;
  bio: string | null;
  intro_video_url: string | null;
  training_philosophy: string | null;
  featured_result: string | null;
  photo_url: string | null;
  specialties: string[] | null;
  sports: SportType[] | null;
  coaching_modes: string[] | null;
  languages: string[] | null;
  location_country: string | null;
  location_city: string | null;
  years_experience: number | null;
  pricing_display: string | null;
  response_time_avg_hours: number | null;
  average_rating: number | null;
  review_count: number;
  is_accepting_clients: boolean;
  created_at: string | null;
};

function mapCoachCard(row: CoachProfileRow): PublicCoachCard {
  return {
    id: row.id,
    slug: row.slug,
    displayName: row.display_name,
    headline: row.headline,
    photoUrl: row.photo_url,
    sports: row.sports ?? [],
    coachingModes: row.coaching_modes ?? [],
    pricingDisplay: row.pricing_display,
    locationCity: row.location_city,
    locationCountry: row.location_country,
    averageRating: row.average_rating,
    reviewCount: row.review_count ?? 0,
    isAcceptingClients: row.is_accepting_clients,
  };
}

export async function listPublicCoaches(
  filters: PublicCoachListFilters = {},
): Promise<PublicCoachCard[]> {
  const supabase = createSupabaseAdminClient();
  let query = supabase
    .from("coach_marketplace_profiles")
    .select(
      "id, slug, display_name, headline, bio, photo_url, sports, coaching_modes, pricing_display, location_country, location_city, average_rating, review_count, is_accepting_clients, created_at",
    )
    .eq("is_public", true);

  if (filters.sport) {
    query = query.contains("sports", [filters.sport]);
  }

  if (filters.remoteOnly) {
    query = query.contains("coaching_modes", ["remote"]);
  }

  const search = filters.q?.trim();
  if (search) {
    const pattern = `%${search.replace(/[%_]/g, "")}%`;
    query = query.or(
      `display_name.ilike.${pattern},headline.ilike.${pattern},bio.ilike.${pattern}`,
    );
  }

  const sort = filters.sort ?? "rating";
  if (sort === "newest") {
    query = query.order("created_at", { ascending: false });
  } else if (sort === "name") {
    query = query.order("display_name", { ascending: true });
  } else {
    query = query
      .order("average_rating", { ascending: false, nullsFirst: false })
      .order("review_count", { ascending: false });
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => mapCoachCard(row as CoachProfileRow));
}

export async function getPublicCoachProfileForApply(coachProfileId: string) {
  const supabase = createSupabaseAdminClient();
  const { data: profile, error } = await supabase
    .from("coach_marketplace_profiles")
    .select(
      "id, slug, display_name, headline, photo_url, is_public, is_accepting_clients",
    )
    .eq("id", coachProfileId)
    .eq("is_public", true)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!profile) {
    return null;
  }

  const { data: packages } = await supabase
    .from("coaching_packages")
    .select("id, title, description, duration_weeks, price_cents, currency")
    .eq("coach_profile_id", profile.id)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  return {
    id: profile.id,
    slug: profile.slug,
    displayName: profile.display_name,
    headline: profile.headline ?? null,
    photoUrl: profile.photo_url,
    isAcceptingClients: profile.is_accepting_clients,
    packages: (packages ?? []).map((pkg) => ({
      id: pkg.id,
      title: pkg.title,
      description: pkg.description,
      durationWeeks: pkg.duration_weeks,
      priceCents: pkg.price_cents,
      currency: pkg.currency,
    })),
  };
}

export async function getPublicCoachBySlug(
  slug: string,
): Promise<PublicCoachProfile | null> {
  const supabase = createSupabaseAdminClient();
  const { data: profile, error } = await supabase
    .from("coach_marketplace_profiles")
    .select(
      "id, slug, display_name, headline, bio, intro_video_url, training_philosophy, featured_result, photo_url, specialties, sports, coaching_modes, languages, location_country, location_city, years_experience, pricing_display, response_time_avg_hours, average_rating, review_count, is_accepting_clients, created_at",
    )
    .eq("slug", slug)
    .eq("is_public", true)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!profile) {
    return null;
  }

  const row = profile as CoachProfileRow & {
    bio: string | null;
    intro_video_url: string | null;
    training_philosophy: string | null;
    featured_result: string | null;
    specialties: string[] | null;
    languages: string[] | null;
    years_experience: number | null;
    response_time_avg_hours: number | null;
  };

  const { data: packages, error: packagesError } = await supabase
    .from("coaching_packages")
    .select("id, title, description, duration_weeks, price_cents, currency")
    .eq("coach_profile_id", row.id)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (packagesError) {
    throw new Error(packagesError.message);
  }

  const [{ data: reviewRows }, reputationScore] = await Promise.all([
    supabase
      .from("coach_reviews")
      .select("id, rating, title, body, created_at, athlete_user_id, metadata")
      .eq("coach_profile_id", row.id)
      .eq("is_public", true)
      .not("moderated_at", "is", null)
      .order("created_at", { ascending: false })
      .limit(12),
    getCoachReputationScore(supabase, row.id),
  ]);

  const visibleReviews = (reviewRows ?? []).filter(
    (review) => !parseReviewMetadata(review.metadata).reported,
  );

  const athleteUserIds = [
    ...new Set(visibleReviews.map((review) => review.athlete_user_id)),
  ];

  const { data: athletes } =
    athleteUserIds.length > 0
      ? await supabase
          .from("users")
          .select("id, display_name, email")
          .in("id", athleteUserIds)
      : { data: [] };

  const userById = new Map((athletes ?? []).map((user) => [user.id, user]));

  return {
    ...mapCoachCard(row),
    bio: row.bio,
    introVideoUrl: row.intro_video_url,
    trainingPhilosophy: row.training_philosophy,
    featuredResult: row.featured_result,
    specialties: row.specialties ?? [],
    languages: row.languages ?? [],
    yearsExperience: row.years_experience,
    responseTimeAvgHours: row.response_time_avg_hours,
    reputationScore,
    reviews: visibleReviews.map((review) => {
      const user = userById.get(review.athlete_user_id);
      return {
        id: review.id,
        rating: review.rating,
        title: review.title,
        body: review.body,
        createdAt: review.created_at,
        athleteDisplayName:
          user?.display_name ?? user?.email?.split("@")[0] ?? "Athlete",
      };
    }),
    packages: (packages ?? []).map((pkg) => ({
      id: pkg.id,
      title: pkg.title,
      description: pkg.description,
      durationWeeks: pkg.duration_weeks,
      priceCents: pkg.price_cents,
      currency: pkg.currency,
    })),
  };
}
