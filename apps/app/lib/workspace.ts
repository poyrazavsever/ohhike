import { auth } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import type { Tables } from "./database.types";
import { createSupabaseAdminClient } from "./supabase-admin";

type Organization = Tables<"organizations">;
type OrganizationMember = Tables<"organization_members">;
type Team = Tables<"teams">;
type Athlete = Tables<"athletes">;
type TeamEntitlement = Tables<"team_billing_entitlements">;
type Session = Tables<"sessions">;
type SessionAttendance = Tables<"session_attendance">;

export const ACTIVE_ORGANIZATION_COOKIE = "ohhike_active_org_id";

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

export type AthleteTeamOption = Pick<Team, "id" | "name" | "sport_type">;

export type SessionWithMeta = Session & {
  teamName: string | null;
  attendanceCount: number;
  attendance: SessionAttendance[];
};

export type WorkspaceShellData = {
  organizationId: string;
  organizationName: string;
  teamName: string | null;
  plan: TeamEntitlement["plan"] | null;
  role: OrganizationMember["role"];
  canCreateOrganization: boolean;
  organizations: Array<{
    id: string;
    name: string;
    role: OrganizationMember["role"];
    isActive: boolean;
  }>;
};

export async function getCurrentWorkspace(): Promise<CurrentWorkspace> {
  const { userId } = await auth();

  if (!userId) {
    redirect("/login");
  }

  const supabase = createSupabaseAdminClient();
  const cookieStore = await cookies();
  const activeOrganizationId = cookieStore.get(ACTIVE_ORGANIZATION_COOKIE)?.value;

  const { data: memberships, error: membershipError } = await supabase
    .from("organization_members")
    .select("*")
    .eq("user_id", userId)
    .eq("is_active", true)
    .order("joined_at", { ascending: true });

  if (membershipError || !memberships?.length) {
    redirect("/onboarding");
  }

  const membership =
    memberships.find(
      (currentMembership) =>
        currentMembership.organization_id === activeOrganizationId,
    ) ?? memberships[0];

  if (!membership) {
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

export async function getWorkspaceShellData(): Promise<WorkspaceShellData> {
  const workspace = await getCurrentWorkspace();
  const supabase = createSupabaseAdminClient();
  const { userId } = await auth();

  const { data: team, error: teamError } = await supabase
    .from("teams")
    .select("*")
    .eq("organization_id", workspace.organization.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (teamError) {
    throw new Error(teamError.message);
  }

  const { data: entitlement, error: entitlementError } = team
    ? await supabase
        .from("team_billing_entitlements")
        .select("*")
        .eq("team_id", team.id)
        .maybeSingle()
    : { data: null, error: null };

  if (entitlementError) {
    throw new Error(entitlementError.message);
  }

  const plan = entitlement?.plan ?? "basic_team";
  const { data: memberships, error: membershipsError } = await supabase
    .from("organization_members")
    .select("*")
    .eq("user_id", userId ?? "")
    .eq("is_active", true)
    .order("joined_at", { ascending: true });

  if (membershipsError) {
    throw new Error(membershipsError.message);
  }

  const organizationIds =
    memberships?.map((membership) => membership.organization_id) ?? [];

  const { data: organizations, error: organizationsError } =
    organizationIds.length > 0
      ? await supabase
          .from("organizations")
          .select("id, name")
          .in("id", organizationIds)
      : { data: [], error: null };

  if (organizationsError) {
    throw new Error(organizationsError.message);
  }

  return {
    organizationId: workspace.organization.id,
    organizationName: workspace.organization.name,
    teamName: team?.name ?? null,
    plan,
    role: workspace.membership.role,
    canCreateOrganization: plan === "pro_team" || plan === "pro_plus_team",
    organizations:
      memberships?.map((membership) => {
        const organization = organizations?.find(
          (currentOrganization) =>
            currentOrganization.id === membership.organization_id,
        );

        return {
          id: membership.organization_id,
          name: organization?.name ?? "Untitled organization",
          role: membership.role,
          isActive: membership.organization_id === workspace.organization.id,
        };
      }) ?? [],
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
  teams: AthleteTeamOption[];
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
        .select("id, name, sport_type")
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
    teams: teams ?? [],
  };
}

export async function getSessionsData(): Promise<{
  workspace: CurrentWorkspace;
  sessions: SessionWithMeta[];
  teams: AthleteTeamOption[];
  athletes: Array<Pick<Athlete, "id" | "team_id" | "first_name" | "last_name" | "number">>;
}> {
  const workspace = await getCurrentWorkspace();
  const supabase = createSupabaseAdminClient();
  const organizationId = workspace.organization.id;

  const [
    { data: sessions, error: sessionsError },
    { data: teams, error: teamsError },
    { data: athletes, error: athletesError },
  ] = await Promise.all([
    supabase
      .from("sessions")
      .select("*")
      .eq("organization_id", organizationId)
      .order("scheduled_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false }),
    supabase
      .from("teams")
      .select("id, name, sport_type")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: true }),
    supabase
      .from("athletes")
      .select("id, team_id, first_name, last_name, number")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: true }),
  ]);

  if (sessionsError) {
    throw new Error(sessionsError.message);
  }

  if (teamsError) {
    throw new Error(teamsError.message);
  }

  if (athletesError) {
    throw new Error(athletesError.message);
  }

  const sessionIds = (sessions ?? []).map((session) => session.id);
  const { data: attendance, error: attendanceError } =
    sessionIds.length > 0
      ? await supabase
          .from("session_attendance")
          .select("*")
          .in("session_id", sessionIds)
      : { data: [], error: null };

  if (attendanceError) {
    throw new Error(attendanceError.message);
  }

  const sessionsWithMeta = await Promise.all(
    (sessions ?? []).map(async (session) => {
      const { count, error } = await supabase
        .from("session_attendance")
        .select("id", { count: "exact", head: true })
        .eq("session_id", session.id);

      if (error) {
        throw new Error(error.message);
      }

      return {
        ...session,
        teamName: teams?.find((team) => team.id === session.team_id)?.name ?? null,
        attendanceCount: count ?? 0,
        attendance:
          attendance?.filter((entry) => entry.session_id === session.id) ?? [],
      };
    }),
  );

  return {
    workspace,
    sessions: sessionsWithMeta,
    teams: teams ?? [],
    athletes: athletes ?? [],
  };
}
