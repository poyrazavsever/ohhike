"use server";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import type { SportType } from "../../../../lib/database.types";
import { createSupabaseAdminClient } from "../../../../lib/supabase-admin";

export type AthleteOnboardingInput = {
  displayName: string;
  goals: string;
  sportInterests: SportType[];
  timezone?: string;
};

export async function completeAthleteOnboardingAction(
  input: AthleteOnboardingInput,
) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/login?redirect_url=/athlete/onboarding");
  }

  const displayName = input.displayName.trim();
  const goals = input.goals.trim();

  if (!displayName || !goals) {
    throw new Error("Display name and goals are required.");
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("athlete_marketplace_profiles").upsert(
    {
      user_id: userId,
      display_name: displayName,
      goals,
      sport_interests: input.sportInterests,
      timezone: input.timezone?.trim() || null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );

  if (error) {
    throw new Error(error.message);
  }

  redirect("/find-coach");
}
