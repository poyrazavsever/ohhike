import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { getAppBaseUrl, buildAppUrl } from "../../../../../lib/app-url";
import { getTeamEntitlement } from "../../../../../lib/billing/entitlements";
import { buildStravaAuthorizeUrl, signStravaState } from "../../../../../lib/strava";
import { createSupabaseAdminClient } from "../../../../../lib/supabase-admin";

export async function GET(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/login");
  }

  const url = new URL(request.url);
  const athleteId = url.searchParams.get("athleteId")?.trim();

  if (!athleteId) {
    return Response.json({ error: "athleteId is required." }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const { data: athlete } = await supabase
    .from("athletes")
    .select("id, organization_id, team_id")
    .eq("id", athleteId)
    .maybeSingle();

  if (!athlete) {
    return Response.json({ error: "Athlete not found." }, { status: 404 });
  }

  const { data: membership } = await supabase
    .from("organization_members")
    .select("id")
    .eq("organization_id", athlete.organization_id)
    .eq("user_id", userId)
    .eq("is_active", true)
    .maybeSingle();

  if (!membership) {
    return Response.json({ error: "Forbidden." }, { status: 403 });
  }

  const entitlement = await getTeamEntitlement(athlete.team_id);

  if (!entitlement.wearable_enabled) {
    return Response.json(
      { error: "Wearables are available on Pro and Pro Plus team plans." },
      { status: 403 },
    );
  }

  const state = signStravaState({
      athleteId: athlete.id,
      organizationId: athlete.organization_id,
      userId,
    });
  const redirectUri = buildAppUrl(
    await getAppBaseUrl(),
    "/api/wearables/strava/callback",
  );

  redirect(
    buildStravaAuthorizeUrl({
      redirectUri,
      state,
    }),
  );
}
