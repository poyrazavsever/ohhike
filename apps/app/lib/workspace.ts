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
type TrainingBlock = Tables<"training_blocks">;
type WellnessCheckin = Tables<"wellness_checkins">;
type NutritionLog = Tables<"nutrition_logs">;
type PersonalTraining = Tables<"personal_trainings">;
type Drill = Tables<"drills">;
type WearableConnection = Tables<"wearable_connections">;
type AiReport = Tables<"ai_reports">;
type AthleteObservation = Tables<"athlete_observations">;
type TeamPattern = Tables<"team_patterns">;

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
  trainingBlocks: TrainingBlock[];
};

export type ReadinessCheckinWithAthlete = WellnessCheckin & {
  athleteName: string;
  teamName: string | null;
};

export type NutritionLogWithAthlete = NutritionLog & {
  athleteName: string;
  teamName: string | null;
};

export type PersonalTrainingWithAthlete = PersonalTraining & {
  athleteName: string;
  teamName: string | null;
};

export type LoadRecoveryTeamSummary = {
  teamId: string;
  teamName: string;
  totalLoad: number;
  attendanceCount: number;
  averageRpe: number | null;
};

export type LoadRecoveryAthleteSummary = {
  athleteId: string;
  athleteName: string;
  teamName: string | null;
  totalLoad: number;
  averageReadiness: number | null;
  latestFatigue: number | null;
  painReports: number;
};

export type AthleteDashboardSummary = {
  athleteId: string;
  athleteName: string;
  teamName: string | null;
  status: Athlete["status"] | null;
  position: string | null;
  latestReadiness: number | null;
  latestFatigue: number | null;
  latestHydration: number | null;
  latestMealQuality: number | null;
  sevenDayLoad: number;
  attendanceCount: number;
};

export type CalendarSession = Session & {
  teamName: string | null;
};

export type TrainingPlannerSession = Session & {
  teamName: string | null;
  trainingBlocks: TrainingBlock[];
};

export type DrillWithUsage = Drill & {
  usageCount: number;
};

export type WearableConnectionWithAthlete = WearableConnection & {
  athleteName: string;
  teamName: string | null;
};

export type AiReportWithMeta = AiReport & {
  teamName: string | null;
  athleteName: string | null;
  sessionTitle: string | null;
};

export type AthleteObservationWithMeta = AthleteObservation & {
  athleteName: string;
  teamName: string | null;
};

export type TeamPatternWithMeta = TeamPattern & {
  teamName: string | null;
};

export type ReportsCenterAiReport = AiReport & {
  teamName: string | null;
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

  const { data: trainingBlocks, error: trainingBlocksError } =
    sessionIds.length > 0
      ? await supabase
          .from("training_blocks")
          .select("*")
          .in("session_id", sessionIds)
          .order("order_index", { ascending: true })
      : { data: [], error: null };

  if (attendanceError) {
    throw new Error(attendanceError.message);
  }

  if (trainingBlocksError) {
    throw new Error(trainingBlocksError.message);
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
        trainingBlocks:
          trainingBlocks?.filter((block) => block.session_id === session.id) ??
          [],
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

export async function getSessionDetailData(sessionId: string): Promise<{
  workspace: CurrentWorkspace;
  session: SessionWithMeta;
  teams: AthleteTeamOption[];
  athletes: Array<Pick<Athlete, "id" | "team_id" | "first_name" | "last_name" | "number">>;
  latestAiReport: Pick<
    Tables<"ai_reports">,
    "id" | "title" | "summary" | "confidence_score" | "model_provider" | "created_at"
  > | null;
} | null> {
  const workspace = await getCurrentWorkspace();
  const supabase = createSupabaseAdminClient();
  const organizationId = workspace.organization.id;

  const { data: session, error: sessionError } = await supabase
    .from("sessions")
    .select("*")
    .eq("id", sessionId)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (sessionError) {
    throw new Error(sessionError.message);
  }

  if (!session) {
    return null;
  }

  const [
    { data: teams, error: teamsError },
    { data: athletes, error: athletesError },
    { data: attendance, error: attendanceError },
    { data: trainingBlocks, error: trainingBlocksError },
    { data: latestAiReport, error: aiReportError },
  ] = await Promise.all([
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
    supabase.from("session_attendance").select("*").eq("session_id", session.id),
    supabase
      .from("training_blocks")
      .select("*")
      .eq("session_id", session.id)
      .order("order_index", { ascending: true }),
    supabase
      .from("ai_reports")
      .select("id, title, summary, confidence_score, model_provider, created_at")
      .eq("session_id", session.id)
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  if (teamsError) {
    throw new Error(teamsError.message);
  }

  if (athletesError) {
    throw new Error(athletesError.message);
  }

  if (attendanceError) {
    throw new Error(attendanceError.message);
  }

  if (trainingBlocksError) {
    throw new Error(trainingBlocksError.message);
  }

  if (aiReportError) {
    throw new Error(aiReportError.message);
  }

  const sessionWithMeta: SessionWithMeta = {
    ...session,
    teamName: teams?.find((team) => team.id === session.team_id)?.name ?? null,
    attendanceCount: attendance?.length ?? 0,
    attendance: attendance ?? [],
    trainingBlocks: trainingBlocks ?? [],
  };

  return {
    workspace,
    session: sessionWithMeta,
    teams: teams ?? [],
    athletes: athletes ?? [],
    latestAiReport: latestAiReport ?? null,
  };
}

export async function getReadinessData(): Promise<{
  workspace: CurrentWorkspace;
  checkins: ReadinessCheckinWithAthlete[];
  athletes: Array<Pick<Athlete, "id" | "team_id" | "first_name" | "last_name" | "number">>;
  teams: AthleteTeamOption[];
}> {
  const workspace = await getCurrentWorkspace();
  const supabase = createSupabaseAdminClient();
  const organizationId = workspace.organization.id;

  const [
    { data: checkins, error: checkinsError },
    { data: athletes, error: athletesError },
    { data: teams, error: teamsError },
  ] = await Promise.all([
    supabase
      .from("wellness_checkins")
      .select("*")
      .eq("organization_id", organizationId)
      .order("checkin_date", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("athletes")
      .select("id, team_id, first_name, last_name, number")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: true }),
    supabase
      .from("teams")
      .select("id, name, sport_type")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: true }),
  ]);

  if (checkinsError) {
    throw new Error(checkinsError.message);
  }

  if (athletesError) {
    throw new Error(athletesError.message);
  }

  if (teamsError) {
    throw new Error(teamsError.message);
  }

  return {
    workspace,
    checkins: (checkins ?? []).map((checkin) => {
      const athlete = athletes?.find(
        (currentAthlete) => currentAthlete.id === checkin.athlete_id,
      );
      const team = teams?.find((currentTeam) => currentTeam.id === checkin.team_id);
      const athleteName = [
        athlete?.number ? `#${athlete.number}` : null,
        athlete?.first_name,
        athlete?.last_name,
      ]
        .filter(Boolean)
        .join(" ");

      return {
        ...checkin,
        athleteName: athleteName || "Unknown athlete",
        teamName: team?.name ?? null,
      };
    }),
    athletes: athletes ?? [],
    teams: teams ?? [],
  };
}

export async function getNutritionData(): Promise<{
  workspace: CurrentWorkspace;
  logs: NutritionLogWithAthlete[];
  athletes: Array<Pick<Athlete, "id" | "team_id" | "first_name" | "last_name" | "number">>;
  teams: AthleteTeamOption[];
}> {
  const workspace = await getCurrentWorkspace();
  const supabase = createSupabaseAdminClient();
  const organizationId = workspace.organization.id;

  const [
    { data: logs, error: logsError },
    { data: athletes, error: athletesError },
    { data: teams, error: teamsError },
  ] = await Promise.all([
    supabase
      .from("nutrition_logs")
      .select("*")
      .eq("organization_id", organizationId)
      .order("log_date", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("athletes")
      .select("id, team_id, first_name, last_name, number")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: true }),
    supabase
      .from("teams")
      .select("id, name, sport_type")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: true }),
  ]);

  if (logsError) {
    throw new Error(logsError.message);
  }

  if (athletesError) {
    throw new Error(athletesError.message);
  }

  if (teamsError) {
    throw new Error(teamsError.message);
  }

  return {
    workspace,
    logs: (logs ?? []).map((log) => {
      const athlete = athletes?.find(
        (currentAthlete) => currentAthlete.id === log.athlete_id,
      );
      const team = teams?.find((currentTeam) => currentTeam.id === log.team_id);
      const athleteName = [
        athlete?.number ? `#${athlete.number}` : null,
        athlete?.first_name,
        athlete?.last_name,
      ]
        .filter(Boolean)
        .join(" ");

      return {
        ...log,
        athleteName: athleteName || "Unknown athlete",
        teamName: team?.name ?? null,
      };
    }),
    athletes: athletes ?? [],
    teams: teams ?? [],
  };
}

export async function getPersonalTrainingsData(): Promise<{
  workspace: CurrentWorkspace;
  trainings: PersonalTrainingWithAthlete[];
  athletes: Array<Pick<Athlete, "id" | "team_id" | "first_name" | "last_name" | "number">>;
  teams: AthleteTeamOption[];
}> {
  const workspace = await getCurrentWorkspace();
  const supabase = createSupabaseAdminClient();
  const organizationId = workspace.organization.id;

  const [
    { data: trainings, error: trainingsError },
    { data: athletes, error: athletesError },
    { data: teams, error: teamsError },
  ] = await Promise.all([
    supabase
      .from("personal_trainings")
      .select("*")
      .eq("organization_id", organizationId)
      .order("started_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false })
      .limit(60),
    supabase
      .from("athletes")
      .select("id, team_id, first_name, last_name, number")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: true }),
    supabase
      .from("teams")
      .select("id, name, sport_type")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: true }),
  ]);

  if (trainingsError) {
    throw new Error(trainingsError.message);
  }

  if (athletesError) {
    throw new Error(athletesError.message);
  }

  if (teamsError) {
    throw new Error(teamsError.message);
  }

  return {
    workspace,
    trainings: (trainings ?? []).map((training) => {
      const athlete = athletes?.find(
        (currentAthlete) => currentAthlete.id === training.athlete_id,
      );
      const team = teams?.find((currentTeam) => currentTeam.id === training.team_id);
      const athleteName = [
        athlete?.number ? `#${athlete.number}` : null,
        athlete?.first_name,
        athlete?.last_name,
      ]
        .filter(Boolean)
        .join(" ");

      return {
        ...training,
        athleteName: athleteName || "Unknown athlete",
        teamName: team?.name ?? null,
      };
    }),
    athletes: athletes ?? [],
    teams: teams ?? [],
  };
}

export async function getLoadRecoveryData(): Promise<{
  workspace: CurrentWorkspace;
  teamSummaries: LoadRecoveryTeamSummary[];
  athleteSummaries: LoadRecoveryAthleteSummary[];
  totals: {
    sessions: number;
    attendanceEntries: number;
    totalLoad: number;
    averageReadiness: number | null;
  };
}> {
  const workspace = await getCurrentWorkspace();
  const supabase = createSupabaseAdminClient();
  const organizationId = workspace.organization.id;
  const since = new Date();
  since.setDate(since.getDate() - 7);

  const [
    { data: sessions, error: sessionsError },
    { data: athletes, error: athletesError },
    { data: teams, error: teamsError },
    { data: checkins, error: checkinsError },
  ] = await Promise.all([
    supabase
      .from("sessions")
      .select("*")
      .eq("organization_id", organizationId)
      .gte("scheduled_at", since.toISOString())
      .order("scheduled_at", { ascending: false }),
    supabase
      .from("athletes")
      .select("id, team_id, first_name, last_name, number")
      .eq("organization_id", organizationId),
    supabase
      .from("teams")
      .select("id, name, sport_type")
      .eq("organization_id", organizationId),
    supabase
      .from("wellness_checkins")
      .select("*")
      .eq("organization_id", organizationId)
      .gte("checkin_date", since.toISOString().slice(0, 10))
      .order("checkin_date", { ascending: false }),
  ]);

  if (sessionsError) {
    throw new Error(sessionsError.message);
  }

  if (athletesError) {
    throw new Error(athletesError.message);
  }

  if (teamsError) {
    throw new Error(teamsError.message);
  }

  if (checkinsError) {
    throw new Error(checkinsError.message);
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

  const teamSummaries =
    teams?.map((team) => {
      const teamSessionIds =
        sessions
          ?.filter((session) => session.team_id === team.id)
          .map((session) => session.id) ?? [];
      const teamAttendance =
        attendance?.filter((entry) => teamSessionIds.includes(entry.session_id)) ??
        [];
      const rpeValues = teamAttendance
        .map((entry) => entry.rpe)
        .filter((rpe): rpe is number => rpe !== null);
      const totalLoad = teamAttendance.reduce(
        (total, entry) =>
          total + (entry.minutes_played ?? 0) * (entry.rpe ?? 0),
        0,
      );

      return {
        teamId: team.id,
        teamName: team.name,
        totalLoad,
        attendanceCount: teamAttendance.length,
        averageRpe:
          rpeValues.length > 0
            ? Math.round(
                rpeValues.reduce((total, rpe) => total + rpe, 0) /
                  rpeValues.length,
              )
            : null,
      };
    }) ?? [];

  const athleteSummaries =
    athletes?.map((athlete) => {
      const athleteAttendance =
        attendance?.filter((entry) => entry.athlete_id === athlete.id) ?? [];
      const athleteCheckins =
        checkins?.filter((checkin) => checkin.athlete_id === athlete.id) ?? [];
      const readinessValues = athleteCheckins
        .map((checkin) => checkin.readiness_score)
        .filter((score): score is number => score !== null);
      const totalLoad = athleteAttendance.reduce(
        (total, entry) =>
          total + (entry.minutes_played ?? 0) * (entry.rpe ?? 0),
        0,
      );
      const team = teams?.find((currentTeam) => currentTeam.id === athlete.team_id);
      const athleteName = [
        athlete.number ? `#${athlete.number}` : null,
        athlete.first_name,
        athlete.last_name,
      ]
        .filter(Boolean)
        .join(" ");

      return {
        athleteId: athlete.id,
        athleteName,
        teamName: team?.name ?? null,
        totalLoad,
        averageReadiness:
          readinessValues.length > 0
            ? Math.round(
                readinessValues.reduce((total, score) => total + score, 0) /
                  readinessValues.length,
              )
            : null,
        latestFatigue: athleteCheckins[0]?.fatigue ?? null,
        painReports: athleteCheckins.filter((checkin) => checkin.pain_area).length,
      };
    }) ?? [];

  const readinessValues =
    checkins
      ?.map((checkin) => checkin.readiness_score)
      .filter((score): score is number => score !== null) ?? [];
  const totalLoad = teamSummaries.reduce(
    (total, summary) => total + summary.totalLoad,
    0,
  );

  return {
    workspace,
    teamSummaries,
    athleteSummaries: athleteSummaries.sort(
      (first, second) => second.totalLoad - first.totalLoad,
    ),
    totals: {
      sessions: sessions?.length ?? 0,
      attendanceEntries: attendance?.length ?? 0,
      totalLoad,
      averageReadiness:
        readinessValues.length > 0
          ? Math.round(
              readinessValues.reduce((total, score) => total + score, 0) /
                readinessValues.length,
            )
          : null,
    },
  };
}

export async function getAthleteDashboardData(): Promise<{
  workspace: CurrentWorkspace;
  summaries: AthleteDashboardSummary[];
  totals: {
    athletes: number;
    activeAthletes: number;
    averageReadiness: number | null;
    totalLoad: number;
  };
}> {
  const workspace = await getCurrentWorkspace();
  const supabase = createSupabaseAdminClient();
  const organizationId = workspace.organization.id;
  const since = new Date();
  since.setDate(since.getDate() - 7);

  const [
    { data: athletes, error: athletesError },
    { data: teams, error: teamsError },
    { data: sessions, error: sessionsError },
    { data: checkins, error: checkinsError },
    { data: nutritionLogs, error: nutritionError },
  ] = await Promise.all([
    supabase
      .from("athletes")
      .select("*")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: true }),
    supabase
      .from("teams")
      .select("id, name, sport_type")
      .eq("organization_id", organizationId),
    supabase
      .from("sessions")
      .select("*")
      .eq("organization_id", organizationId)
      .gte("scheduled_at", since.toISOString()),
    supabase
      .from("wellness_checkins")
      .select("*")
      .eq("organization_id", organizationId)
      .gte("checkin_date", since.toISOString().slice(0, 10))
      .order("checkin_date", { ascending: false }),
    supabase
      .from("nutrition_logs")
      .select("*")
      .eq("organization_id", organizationId)
      .gte("log_date", since.toISOString().slice(0, 10))
      .order("log_date", { ascending: false }),
  ]);

  if (athletesError) {
    throw new Error(athletesError.message);
  }

  if (teamsError) {
    throw new Error(teamsError.message);
  }

  if (sessionsError) {
    throw new Error(sessionsError.message);
  }

  if (checkinsError) {
    throw new Error(checkinsError.message);
  }

  if (nutritionError) {
    throw new Error(nutritionError.message);
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

  const summaries =
    athletes?.map((athlete) => {
      const team = teams?.find((currentTeam) => currentTeam.id === athlete.team_id);
      const athleteCheckins =
        checkins?.filter((checkin) => checkin.athlete_id === athlete.id) ?? [];
      const athleteNutritionLogs =
        nutritionLogs?.filter((log) => log.athlete_id === athlete.id) ?? [];
      const athleteAttendance =
        attendance?.filter((entry) => entry.athlete_id === athlete.id) ?? [];
      const latestCheckin = athleteCheckins[0];
      const latestNutrition = athleteNutritionLogs[0];
      const sevenDayLoad = athleteAttendance.reduce(
        (total, entry) =>
          total + (entry.minutes_played ?? 0) * (entry.rpe ?? 0),
        0,
      );
      const athleteName = [
        athlete.number ? `#${athlete.number}` : null,
        athlete.first_name,
        athlete.last_name,
      ]
        .filter(Boolean)
        .join(" ");

      return {
        athleteId: athlete.id,
        athleteName,
        teamName: team?.name ?? null,
        status: athlete.status,
        position: athlete.position,
        latestReadiness: latestCheckin?.readiness_score ?? null,
        latestFatigue: latestCheckin?.fatigue ?? null,
        latestHydration: latestNutrition?.hydration_score ?? null,
        latestMealQuality: latestNutrition?.meal_quality ?? null,
        sevenDayLoad,
        attendanceCount: athleteAttendance.length,
      };
    }) ?? [];

  const readinessValues = summaries
    .map((summary) => summary.latestReadiness)
    .filter((score): score is number => score !== null);

  return {
    workspace,
    summaries,
    totals: {
      athletes: summaries.length,
      activeAthletes: summaries.filter((summary) => summary.status === "active")
        .length,
      averageReadiness:
        readinessValues.length > 0
          ? Math.round(
              readinessValues.reduce((total, score) => total + score, 0) /
                readinessValues.length,
            )
          : null,
      totalLoad: summaries.reduce(
        (total, summary) => total + summary.sevenDayLoad,
        0,
      ),
    },
  };
}

export async function getCalendarData(): Promise<{
  workspace: CurrentWorkspace;
  sessions: CalendarSession[];
}> {
  const workspace = await getCurrentWorkspace();
  const supabase = createSupabaseAdminClient();
  const organizationId = workspace.organization.id;

  const [
    { data: sessions, error: sessionsError },
    { data: teams, error: teamsError },
  ] = await Promise.all([
    supabase
      .from("sessions")
      .select("*")
      .eq("organization_id", organizationId)
      .order("scheduled_at", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: false })
      .limit(100),
    supabase
      .from("teams")
      .select("id, name, sport_type")
      .eq("organization_id", organizationId),
  ]);

  if (sessionsError) {
    throw new Error(sessionsError.message);
  }

  if (teamsError) {
    throw new Error(teamsError.message);
  }

  return {
    workspace,
    sessions:
      sessions?.map((session) => ({
        ...session,
        teamName:
          teams?.find((team) => team.id === session.team_id)?.name ?? null,
      })) ?? [],
  };
}

export async function getTrainingPlannerData(): Promise<{
  workspace: CurrentWorkspace;
  sessions: TrainingPlannerSession[];
  totals: {
    sessions: number;
    blocks: number;
    plannedMinutes: number;
    completedBlocks: number;
  };
}> {
  const workspace = await getCurrentWorkspace();
  const supabase = createSupabaseAdminClient();
  const organizationId = workspace.organization.id;

  const [
    { data: sessions, error: sessionsError },
    { data: teams, error: teamsError },
  ] = await Promise.all([
    supabase
      .from("sessions")
      .select("*")
      .eq("organization_id", organizationId)
      .order("scheduled_at", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("teams")
      .select("id, name, sport_type")
      .eq("organization_id", organizationId),
  ]);

  if (sessionsError) {
    throw new Error(sessionsError.message);
  }

  if (teamsError) {
    throw new Error(teamsError.message);
  }

  const sessionIds = (sessions ?? []).map((session) => session.id);
  const { data: trainingBlocks, error: blocksError } =
    sessionIds.length > 0
      ? await supabase
          .from("training_blocks")
          .select("*")
          .in("session_id", sessionIds)
          .order("order_index", { ascending: true })
      : { data: [], error: null };

  if (blocksError) {
    throw new Error(blocksError.message);
  }

  const plannerSessions =
    sessions?.map((session) => ({
      ...session,
      teamName: teams?.find((team) => team.id === session.team_id)?.name ?? null,
      trainingBlocks:
        trainingBlocks?.filter((block) => block.session_id === session.id) ?? [],
    })) ?? [];

  return {
    workspace,
    sessions: plannerSessions,
    totals: {
      sessions: plannerSessions.length,
      blocks: trainingBlocks?.length ?? 0,
      plannedMinutes:
        trainingBlocks?.reduce(
          (total, block) => total + (block.planned_duration_min ?? 0),
          0,
        ) ?? 0,
      completedBlocks:
        trainingBlocks?.filter((block) => block.completed).length ?? 0,
    },
  };
}

export async function getDrillsData(): Promise<{
  workspace: CurrentWorkspace;
  drills: DrillWithUsage[];
  totals: {
    drills: number;
    systemDrills: number;
    customDrills: number;
  };
}> {
  const workspace = await getCurrentWorkspace();
  const supabase = createSupabaseAdminClient();
  const organizationId = workspace.organization.id;

  const [{ data: drills, error: drillsError }, { data: trainingBlocks }] =
    await Promise.all([
      supabase
        .from("drills")
        .select("*")
        .or(`organization_id.eq.${organizationId},is_system_drill.eq.true`)
        .order("created_at", { ascending: false }),
      supabase.from("training_blocks").select("drill_id").not("drill_id", "is", null),
    ]);

  if (drillsError) {
    throw new Error(drillsError.message);
  }

  const drillsWithUsage =
    drills?.map((drill) => ({
      ...drill,
      usageCount:
        trainingBlocks?.filter((block) => block.drill_id === drill.id).length ??
        0,
    })) ?? [];

  return {
    workspace,
    drills: drillsWithUsage,
    totals: {
      drills: drillsWithUsage.length,
      systemDrills: drillsWithUsage.filter((drill) => drill.is_system_drill)
        .length,
      customDrills: drillsWithUsage.filter((drill) => !drill.is_system_drill)
        .length,
    },
  };
}

export async function getWearablesData(): Promise<{
  workspace: CurrentWorkspace;
  connections: WearableConnectionWithAthlete[];
  athletes: Array<Pick<Athlete, "id" | "team_id" | "first_name" | "last_name" | "number">>;
  totals: {
    connections: number;
    activeConnections: number;
    summaries: number;
    activities: number;
  };
}> {
  const workspace = await getCurrentWorkspace();
  const supabase = createSupabaseAdminClient();
  const organizationId = workspace.organization.id;

  const [
    { data: connections, error: connectionsError },
    { data: athletes, error: athletesError },
    { data: teams, error: teamsError },
    { count: summariesCount, error: summariesError },
    { count: activitiesCount, error: activitiesError },
  ] = await Promise.all([
    supabase
      .from("wearable_connections")
      .select("*")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false }),
    supabase
      .from("athletes")
      .select("id, team_id, first_name, last_name, number")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: true }),
    supabase
      .from("teams")
      .select("id, name, sport_type")
      .eq("organization_id", organizationId),
    supabase
      .from("wearable_daily_summaries")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", organizationId),
    supabase
      .from("wearable_activities")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", organizationId),
  ]);

  if (connectionsError) {
    throw new Error(connectionsError.message);
  }

  if (athletesError) {
    throw new Error(athletesError.message);
  }

  if (teamsError) {
    throw new Error(teamsError.message);
  }

  if (summariesError) {
    throw new Error(summariesError.message);
  }

  if (activitiesError) {
    throw new Error(activitiesError.message);
  }

  return {
    workspace,
    connections:
      connections?.map((connection) => {
        const athlete = athletes?.find(
          (currentAthlete) => currentAthlete.id === connection.athlete_id,
        );
        const team = teams?.find((currentTeam) => currentTeam.id === athlete?.team_id);
        const athleteName = [
          athlete?.number ? `#${athlete.number}` : null,
          athlete?.first_name,
          athlete?.last_name,
        ]
          .filter(Boolean)
          .join(" ");

        return {
          ...connection,
          athleteName: athleteName || "Unknown athlete",
          teamName: team?.name ?? null,
        };
      }) ?? [],
    athletes: athletes ?? [],
    totals: {
      connections: connections?.length ?? 0,
      activeConnections:
        connections?.filter((connection) => connection.is_active).length ?? 0,
      summaries: summariesCount ?? 0,
      activities: activitiesCount ?? 0,
    },
  };
}

export async function getAiReportsData(): Promise<{
  workspace: CurrentWorkspace;
  reports: AiReportWithMeta[];
  teams: AthleteTeamOption[];
  athletes: Array<Pick<Athlete, "id" | "team_id" | "first_name" | "last_name" | "number">>;
  sessions: Array<Pick<Session, "id" | "team_id" | "title">>;
  totals: {
    reports: number;
    sessionReports: number;
    athleteReports: number;
    teamReports: number;
  };
}> {
  const workspace = await getCurrentWorkspace();
  const supabase = createSupabaseAdminClient();
  const organizationId = workspace.organization.id;

  const [
    { data: reports, error: reportsError },
    { data: teams, error: teamsError },
    { data: athletes, error: athletesError },
    { data: sessions, error: sessionsError },
  ] = await Promise.all([
    supabase
      .from("ai_reports")
      .select("*")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("teams")
      .select("id, name, sport_type")
      .eq("organization_id", organizationId),
    supabase
      .from("athletes")
      .select("id, team_id, first_name, last_name, number")
      .eq("organization_id", organizationId),
    supabase
      .from("sessions")
      .select("id, team_id, title")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false })
      .limit(100),
  ]);

  if (reportsError) {
    throw new Error(reportsError.message);
  }

  if (teamsError) {
    throw new Error(teamsError.message);
  }

  if (athletesError) {
    throw new Error(athletesError.message);
  }

  if (sessionsError) {
    throw new Error(sessionsError.message);
  }

  const reportsWithMeta =
    reports?.map((report) => {
      const team = teams?.find((currentTeam) => currentTeam.id === report.team_id);
      const athlete = athletes?.find(
        (currentAthlete) => currentAthlete.id === report.athlete_id,
      );
      const session = sessions?.find(
        (currentSession) => currentSession.id === report.session_id,
      );
      const athleteName = [
        athlete?.number ? `#${athlete.number}` : null,
        athlete?.first_name,
        athlete?.last_name,
      ]
        .filter(Boolean)
        .join(" ");

      return {
        ...report,
        teamName: team?.name ?? null,
        athleteName: athleteName || null,
        sessionTitle: session?.title ?? null,
      };
    }) ?? [];

  return {
    workspace,
    reports: reportsWithMeta,
    teams: teams ?? [],
    athletes: athletes ?? [],
    sessions: sessions ?? [],
    totals: {
      reports: reportsWithMeta.length,
      sessionReports: reportsWithMeta.filter((report) => report.session_id)
        .length,
      athleteReports: reportsWithMeta.filter((report) => report.athlete_id)
        .length,
      teamReports: reportsWithMeta.filter((report) => report.team_id).length,
    },
  };
}

export async function getTeamMemoryData(): Promise<{
  workspace: CurrentWorkspace;
  observations: AthleteObservationWithMeta[];
  patterns: TeamPatternWithMeta[];
  teams: AthleteTeamOption[];
  athletes: Array<Pick<Athlete, "id" | "team_id" | "first_name" | "last_name" | "number">>;
  totals: {
    observations: number;
    patterns: number;
    unresolvedObservations: number;
    activePatterns: number;
  };
}> {
  const workspace = await getCurrentWorkspace();
  const supabase = createSupabaseAdminClient();
  const organizationId = workspace.organization.id;

  const [
    { data: observations, error: observationsError },
    { data: patterns, error: patternsError },
    { data: teams, error: teamsError },
    { data: athletes, error: athletesError },
  ] = await Promise.all([
    supabase
      .from("athlete_observations")
      .select("*")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("team_patterns")
      .select("*")
      .eq("organization_id", organizationId)
      .order("last_seen_at", { ascending: false }),
    supabase
      .from("teams")
      .select("id, name, sport_type")
      .eq("organization_id", organizationId),
    supabase
      .from("athletes")
      .select("id, team_id, first_name, last_name, number")
      .eq("organization_id", organizationId),
  ]);

  if (observationsError) {
    throw new Error(observationsError.message);
  }

  if (patternsError) {
    throw new Error(patternsError.message);
  }

  if (teamsError) {
    throw new Error(teamsError.message);
  }

  if (athletesError) {
    throw new Error(athletesError.message);
  }

  const observationsWithMeta =
    observations?.map((observation) => {
      const athlete = athletes?.find(
        (currentAthlete) => currentAthlete.id === observation.athlete_id,
      );
      const team = teams?.find((currentTeam) => currentTeam.id === observation.team_id);
      const athleteName = [
        athlete?.number ? `#${athlete.number}` : null,
        athlete?.first_name,
        athlete?.last_name,
      ]
        .filter(Boolean)
        .join(" ");

      return {
        ...observation,
        athleteName: athleteName || "Unknown athlete",
        teamName: team?.name ?? null,
      };
    }) ?? [];

  const patternsWithMeta =
    patterns?.map((pattern) => ({
      ...pattern,
      teamName: teams?.find((team) => team.id === pattern.team_id)?.name ?? null,
    })) ?? [];

  return {
    workspace,
    observations: observationsWithMeta,
    patterns: patternsWithMeta,
    teams: teams ?? [],
    athletes: athletes ?? [],
    totals: {
      observations: observationsWithMeta.length,
      patterns: patternsWithMeta.length,
      unresolvedObservations: observationsWithMeta.filter(
        (observation) => !observation.is_resolved,
      ).length,
      activePatterns: patternsWithMeta.filter(
        (pattern) => pattern.status === "active",
      ).length,
    },
  };
}

export async function getReportsData(): Promise<{
  workspace: CurrentWorkspace;
  aiReports: ReportsCenterAiReport[];
  totals: {
    aiReports: number;
    sessions: number;
    readinessCheckins: number;
    nutritionLogs: number;
    wearableActivities: number;
  };
}> {
  const workspace = await getCurrentWorkspace();
  const supabase = createSupabaseAdminClient();
  const organizationId = workspace.organization.id;

  const [
    { data: aiReports, error: aiReportsError },
    { data: teams, error: teamsError },
    { count: sessionsCount, error: sessionsError },
    { count: readinessCount, error: readinessError },
    { count: nutritionCount, error: nutritionError },
    { count: wearableActivitiesCount, error: wearableActivitiesError },
  ] = await Promise.all([
    supabase
      .from("ai_reports")
      .select("*")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("teams")
      .select("id, name, sport_type")
      .eq("organization_id", organizationId),
    supabase
      .from("sessions")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", organizationId),
    supabase
      .from("wellness_checkins")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", organizationId),
    supabase
      .from("nutrition_logs")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", organizationId),
    supabase
      .from("wearable_activities")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", organizationId),
  ]);

  if (aiReportsError) {
    throw new Error(aiReportsError.message);
  }

  if (teamsError) {
    throw new Error(teamsError.message);
  }

  if (sessionsError) {
    throw new Error(sessionsError.message);
  }

  if (readinessError) {
    throw new Error(readinessError.message);
  }

  if (nutritionError) {
    throw new Error(nutritionError.message);
  }

  if (wearableActivitiesError) {
    throw new Error(wearableActivitiesError.message);
  }

  return {
    workspace,
    aiReports:
      aiReports?.map((report) => ({
        ...report,
        teamName:
          teams?.find((team) => team.id === report.team_id)?.name ?? null,
      })) ?? [],
    totals: {
      aiReports: aiReports?.length ?? 0,
      sessions: sessionsCount ?? 0,
      readinessCheckins: readinessCount ?? 0,
      nutritionLogs: nutritionCount ?? 0,
      wearableActivities: wearableActivitiesCount ?? 0,
    },
  };
}
