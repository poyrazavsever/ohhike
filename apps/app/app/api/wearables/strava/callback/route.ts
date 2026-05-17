import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { getAppBaseUrl, buildAppUrl } from "../../../../../lib/app-url";
import {
  exchangeStravaCode,
  encryptStravaSecret,
  verifyStravaState,
} from "../../../../../lib/strava";
import { createSupabaseAdminClient } from "../../../../../lib/supabase-admin";

type StravaState = {
  athleteId: string;
  organizationId: string;
  userId: string;
};

export async function GET(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/login");
  }

  const url = new URL(request.url);
  const code = url.searchParams.get("code")?.trim();
  const encodedState = url.searchParams.get("state")?.trim();
  const acceptedScopes = url.searchParams.get("scope")?.split(",") ?? [];

  if (!code || !encodedState) {
    redirect("/wearables?strava=missing");
  }

  if (!acceptedScopes.includes("activity:read")) {
    redirect("/wearables?strava=missing-scope");
  }

  const state = verifyStravaState<StravaState>(encodedState);

  if (!state) {
    redirect("/wearables?strava=invalid-state");
  }

  if (state.userId !== userId) {
    redirect("/wearables?strava=invalid-user");
  }

  const token = await exchangeStravaCode(code);
  const supabase = createSupabaseAdminClient();
  const { data: athlete } = await supabase
    .from("athletes")
    .select("id, organization_id")
    .eq("id", state.athleteId)
    .eq("organization_id", state.organizationId)
    .maybeSingle();

  if (!athlete) {
    redirect("/wearables?strava=athlete-missing");
  }

  await supabase.from("wearable_connections").upsert(
    {
      organization_id: state.organizationId,
      athlete_id: state.athleteId,
      user_id: userId,
      provider: "strava",
      provider_user_id: String(token.athlete.id),
      access_token_encrypted: encryptStravaSecret(token.access_token),
      refresh_token_encrypted: encryptStravaSecret(token.refresh_token),
      token_expires_at: new Date(token.expires_at * 1000).toISOString(),
      scopes: ["read", "activity:read"],
      is_active: true,
      sync_error: null,
    },
    {
      onConflict: "athlete_id,provider",
    },
  );

  redirect(buildAppUrl(await getAppBaseUrl(), "/wearables?strava=connected"));
}
