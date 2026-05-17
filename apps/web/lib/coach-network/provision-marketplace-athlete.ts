import { createSupabaseAdminClient } from "../supabase-admin";

export async function provisionMarketplaceAthlete(input: {
  organizationId: string;
  athleteUserId: string;
  displayName: string;
  email: string | null;
}) {
  const supabase = createSupabaseAdminClient();

  const { data: existing } = await supabase
    .from("athletes")
    .select("id, team_id")
    .eq("organization_id", input.organizationId)
    .eq("user_id", input.athleteUserId)
    .maybeSingle();

  if (existing) {
    return existing;
  }

  const { data: team, error: teamError } = await supabase
    .from("teams")
    .select("id")
    .eq("organization_id", input.organizationId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (teamError || !team) {
    throw new Error("Coach organization has no team to attach remote athletes.");
  }

  const nameParts = input.displayName.trim().split(/\s+/).filter(Boolean);
  const firstName = nameParts[0] ?? "Athlete";
  const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : null;

  const { data: athlete, error } = await supabase
    .from("athletes")
    .insert({
      organization_id: input.organizationId,
      team_id: team.id,
      user_id: input.athleteUserId,
      marketplace_user_id: input.athleteUserId,
      first_name: firstName,
      last_name: lastName,
      display_name: input.displayName.trim(),
      email: input.email,
      status: "active",
      source: "marketplace",
    })
    .select("id, team_id")
    .single();

  if (error || !athlete) {
    throw new Error(error?.message ?? "Could not create marketplace athlete.");
  }

  return athlete;
}
