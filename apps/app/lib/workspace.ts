import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import type { Tables } from "./database.types";
import { createSupabaseAdminClient } from "./supabase-admin";

type Organization = Tables<"organizations">;
type OrganizationMember = Tables<"organization_members">;
type Team = Tables<"teams">;
type Athlete = Tables<"athletes">;
type TeamEntitlement = Tables<"team_billing_entitlements">;

export type CurrentWorkspace = {
  organization: Organization;
  membership: OrganizationMember;
};

export type TeamWithEntitlement = Team & {
  entitlement: TeamEntitlement | null;
  athleteCount: number;
};

export type AthleteWithTeamName = Athlete & {
  teamName: string | null;
};

export async function getCurrentWorkspace(): Promise<CurrentWorkspace> {
  const { userId } = await auth();

  if (!userId) {
    redirect("/login");
  }

  const supabase = createSupabaseAdminClient();

  const { data: membership, error: membershipError } = await supabase
    .from("organization_members")
    .select("*")
    .eq("user_id", userId)
    .eq("is_active", true)
    .order("joined_at", { ascending: true })
    .limit(1)
    .single();

  if (membershipError || !membership) {
    redirect("/onboarding");
  }

  const { data: organization, error: organizationError } = await supabase
    .from("organizations")
    .select("*")
    .eq("id", membership.organization_id)
    .single();

  if (organizationError || !organization) {
    throw new Error(
      organizationError?.message ?? "Failed to load active organization.",
    );
  }

  return {
    organization,
    membership,
  };
}

export async function getDashboardData() {
  const workspace = await getCurrentWorkspace();
  const supabase = createSupabaseAdminClient();
  const organizationId = workspace.organization.id;

  const [teamsResult, athletesCountResult, entitlementsResult] =
    await Promise.all([
      supabase
        .from("teams")
        .select("*")
        .eq("organization_id", organizationId)
        .order("created_at", { ascending: true }),
      supabase
        .from("athletes")
        .select("id", { count: "exact", head: true })
        .eq("organization_id", organizationId),
      supabase
        .from("team_billing_entitlements")
        .select("*")
        .eq("organization_id", organizationId),
    ]);

  if (teamsResult.error) {
    throw new Error(teamsResult.error.message);
  }

  if (athletesCountResult.error) {
    throw new Error(athletesCountResult.error.message);
  }

  if (entitlementsResult.error) {
    throw new Error(entitlementsResult.error.message);
  }

  return {
    ...workspace,
    teams: teamsResult.data ?? [],
    athleteCount: athletesCountResult.count ?? 0,
    entitlements: entitlementsResult.data ?? [],
  };
}

export async function getTeamsData(): Promise<{
  workspace: CurrentWorkspace;
  teams: TeamWithEntitlement[];
}> {
  const workspace = await getCurrentWorkspace();
  const supabase = createSupabaseAdminClient();
  const organizationId = workspace.organization.id;

  const [{ data: teams, error: teamsError }, { data: entitlements }] =
    await Promise.all([
      supabase
        .from("teams")
        .select("*")
        .eq("organization_id", organizationId)
        .order("created_at", { ascending: true }),
      supabase
        .from("team_billing_entitlements")
        .select("*")
        .eq("organization_id", organizationId),
    ]);

  if (teamsError) {
    throw new Error(teamsError.message);
  }

  const teamsWithCounts = await Promise.all(
    (teams ?? []).map(async (team) => {
      const { count, error } = await supabase
        .from("athletes")
        .select("id", { count: "exact", head: true })
        .eq("team_id", team.id);

      if (error) {
        throw new Error(error.message);
      }

      return {
        ...team,
        entitlement:
          entitlements?.find((entitlement) => entitlement.team_id === team.id) ??
          null,
        athleteCount: count ?? 0,
      };
    }),
  );

  return {
    workspace,
    teams: teamsWithCounts,
  };
}

export async function getAthletesData(): Promise<{
  workspace: CurrentWorkspace;
  athletes: AthleteWithTeamName[];
}> {
  const workspace = await getCurrentWorkspace();
  const supabase = createSupabaseAdminClient();
  const organizationId = workspace.organization.id;

  const [{ data: athletes, error: athletesError }, { data: teams }] =
    await Promise.all([
      supabase
        .from("athletes")
        .select("*")
        .eq("organization_id", organizationId)
        .order("created_at", { ascending: true }),
      supabase
        .from("teams")
        .select("id, name")
        .eq("organization_id", organizationId),
    ]);

  if (athletesError) {
    throw new Error(athletesError.message);
  }

  return {
    workspace,
    athletes: (athletes ?? []).map((athlete) => ({
      ...athlete,
      teamName: teams?.find((team) => team.id === athlete.team_id)?.name ?? null,
    })),
  };
}
