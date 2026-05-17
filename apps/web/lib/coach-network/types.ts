import type { SportType } from "../database.types";

export type PublicCoachSort = "rating" | "newest" | "name";

export type PublicCoachListFilters = {
  q?: string;
  sport?: SportType;
  remoteOnly?: boolean;
  sort?: PublicCoachSort;
};

export type PublicCoachCard = {
  id: string;
  slug: string;
  displayName: string;
  headline: string | null;
  photoUrl: string | null;
  sports: SportType[];
  coachingModes: string[];
  pricingDisplay: string | null;
  locationCity: string | null;
  locationCountry: string | null;
  averageRating: number | null;
  reviewCount: number;
  isAcceptingClients: boolean;
};

export type PublicCoachPackage = {
  id: string;
  title: string;
  description: string | null;
  durationWeeks: number | null;
  priceCents: number | null;
  currency: string;
};

export type PublicCoachReview = {
  id: string;
  rating: number;
  title: string | null;
  body: string | null;
  createdAt: string | null;
  athleteDisplayName: string;
};

export type PublicCoachProfile = PublicCoachCard & {
  bio: string | null;
  specialties: string[];
  languages: string[];
  yearsExperience: number | null;
  responseTimeAvgHours: number | null;
  reputationScore: number;
  packages: PublicCoachPackage[];
  reviews: PublicCoachReview[];
};
