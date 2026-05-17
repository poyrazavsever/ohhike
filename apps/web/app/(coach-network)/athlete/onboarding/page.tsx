import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { createSupabaseAdminClient } from "../../../../lib/supabase-admin";
import { AthleteOnboardingForm } from "./_components/athlete-onboarding-form";

export default async function AthleteOnboardingPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/login?redirect_url=/athlete/onboarding");
  }

  try {
    const supabase = createSupabaseAdminClient();
    const { data: profile } = await supabase
      .from("athlete_marketplace_profiles")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    if (profile) {
      redirect("/find-coach");
    }
  } catch {
    // Missing Supabase env: form submit will surface the error.
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-5 md:px-8">
      <AthleteOnboardingForm />
    </main>
  );
}
