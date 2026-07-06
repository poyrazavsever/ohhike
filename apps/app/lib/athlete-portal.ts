// @ts-nocheck
import "server-only";

import { auth } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  computeProgramAdherence,
  getTodayProgramView,
} from "./coach-network/program-assignments";
import type { Tables } from "./db.types";
import { isAthleteRole } from "./org-roles";
import {
  isAthletePortalPath,
  isCoachWorkspacePath,
  pathnameMatchesPrefix,
  COACH_ATHLETE_INSIGHT_PATHS,
} from "./portal-routes";
import { createDbAdminClient } from "./db-admin";
import {
  ACTIVE_ORGANIZATION_COOKIE,
  getCurrentWorkspace,
  type CurrentWorkspace,
} from "./workspace";

type AthleteRow = Tables<"athletes">;

type AthleteMetadata = {
  profile_completed?: boolean;
  profile_completed_at?: string;
};

export function getAthleteMetadata(
  athlete: Pick<AthleteRow, "metadata">,
): AthleteMetadata {
  if (!athlete.metadata || typeof athlete.metadata !== "object") {
    return {};
  }
  return athlete.metadata as AthleteMetadata;
}

export function isAthleteProfileComplete(
  athlete: Pick<AthleteRow, "metadata">,
): boolean {
  return getAthleteMetadata(athlete).profile_completed === true;
}

export async function getLinkedAthleteForUser(
  userId: string,
  organizationId: string,
): Promise<AthleteRow | null> {
  const db = createDbAdminClient();

  const { data, error } = await db
    .from("athletes")
    .select("*")
    .eq("organization_id", organizationId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export type AthletePortalContext = {
  workspace: CurrentWorkspace;
  athlete: AthleteRow;
  teamName: string | null;
};

export async function getAthletePortalContext(): Promise<AthletePortalContext> {
  const workspace = await getCurrentWorkspace();

  if (!isAthleteRole(workspace.membership.role)) {
    redirect("/dashboard");
  }

  const { userId } = await auth();
  if (!userId) {
    redirect("/login");
  }

  const athlete = await getLinkedAthleteForUser(
    userId,
    workspace.organization.id,
  );

  if (!athlete) {
    redirect("/onboarding");
  }

  const db = createDbAdminClient();
  const { data: team } = await db
    .from("teams")
    .select("name")
    .eq("id", athlete.team_id)
    .maybeSingle();

  return {
    workspace,
    athlete,
    teamName: team?.name ?? null,
  };
}

export async function requireAthletePortalAccess(pathname: string) {
  const { userId } = await auth();
  if (!userId) {
    return;
  }

  const cookieStore = await cookies();
  const organizationId = cookieStore.get(ACTIVE_ORGANIZATION_COOKIE)?.value;
  const db = createDbAdminClient();

  const { data: memberships } = await db
    .from("organization_members")
    .select("organization_id, role")
    .eq("user_id", userId)
    .eq("is_active", true);

  const membership =
    memberships?.find((row) => row.organization_id === organizationId) ??
    memberships?.[0];

  if (!membership) {
    return;
  }

  if (!isAthleteRole(membership.role)) {
    if (isAthletePortalPath(pathname)) {
      redirect("/dashboard");
    }
    return;
  }

  if (
    isCoachWorkspacePath(pathname) ||
    pathnameMatchesPrefix(pathname, COACH_ATHLETE_INSIGHT_PATHS)
  ) {
    redirect("/athlete/home");
  }

  const athlete = await getLinkedAthleteForUser(
    userId,
    membership.organization_id,
  );

  if (!athlete) {
    if (!pathname.startsWith("/athlete/onboarding")) {
      redirect("/athlete/onboarding");
    }
    return;
  }

  const profileComplete = isAthleteProfileComplete(athlete);

  if (!profileComplete && !pathname.startsWith("/athlete/onboarding")) {
    redirect("/athlete/onboarding");
  }

  if (
    profileComplete &&
    (pathname.startsWith("/athlete/onboarding") ||
      pathname === "/dashboard" ||
      pathname === "/")
  ) {
    redirect("/athlete/home");
  }
}

export async function getAthleteOnboardingPageData(): Promise<{
  workspace: CurrentWorkspace;
  athlete: AthleteRow | null;
  teamName: string | null;
}> {
  const workspace = await getCurrentWorkspace();

  if (!isAthleteRole(workspace.membership.role)) {
    redirect("/dashboard");
  }

  const { userId } = await auth();
  if (!userId) {
    redirect("/login");
  }

  const athlete = await getLinkedAthleteForUser(
    userId,
    workspace.organization.id,
  );

  let teamName: string | null = null;
  if (athlete) {
    const db = createDbAdminClient();
    const { data: team } = await db
      .from("teams")
      .select("name")
      .eq("id", athlete.team_id)
      .maybeSingle();
    teamName = team?.name ?? null;
  }

  return { workspace, athlete, teamName };
}

export async function getAthleteHomeData(): Promise<{
  portal: AthletePortalContext;
  latestCheckin: Tables<"wellness_checkins"> | null;
  latestNutrition: Tables<"nutrition_logs"> | null;
  upcomingSessions: Array<{
    id: string;
    title: string;
    scheduled_at: string | null;
    type: string;
    teamName: string | null;
  }>;
  sevenDayLoad: number;
  todayProgram: {
    assignmentId: string;
    title: string;
    focus: string | null;
    completedToday: boolean;
    inWindow: boolean;
    adherencePercent: number | null;
    completedDays: number;
    totalDays: number;
  } | null;
}> {
  const portal = await getAthletePortalContext();
  const db = createDbAdminClient();
  const since = new Date();
  since.setDate(since.getDate() - 7);

  const [
    { data: checkins },
    { data: nutritionLogs },
    { data: sessions },
    { data: recentAttendance },
    activeProgramResult,
  ] = await Promise.all([
    db
      .from("wellness_checkins")
      .select("*")
      .eq("athlete_id", portal.athlete.id)
      .order("checkin_date", { ascending: false })
      .limit(1),
    db
      .from("nutrition_logs")
      .select("*")
      .eq("athlete_id", portal.athlete.id)
      .order("log_date", { ascending: false })
      .limit(1),
    db
      .from("sessions")
      .select("id, title, scheduled_at, type, team_id")
      .eq("team_id", portal.athlete.team_id)
      .gte("scheduled_at", new Date().toISOString())
      .order("scheduled_at", { ascending: true })
      .limit(5),
    db
      .from("session_attendance")
      .select("minutes_played, rpe, created_at")
      .eq("athlete_id", portal.athlete.id)
      .gte("created_at", since.toISOString()),
    db
      .from("coaching_program_assignments")
      .select("*")
      .eq("athlete_id", portal.athlete.id)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const activeProgram = activeProgramResult.data;

  const todayProgram = activeProgram
    ? (() => {
        const today = getTodayProgramView(activeProgram);
        const adherence = computeProgramAdherence(activeProgram);
        return {
          assignmentId: activeProgram.id,
          title: activeProgram.title,
          focus: today.focus,
          completedToday: today.completedToday,
          inWindow: today.inWindow,
          adherencePercent: adherence.percent,
          completedDays: adherence.completedDays,
          totalDays: adherence.totalDays,
        };
      })()
    : null;

  const recentLoad = (recentAttendance ?? []).reduce(
    (total, entry) => total + (entry.minutes_played ?? 0) * (entry.rpe ?? 0),
    0,
  );

  return {
    portal,
    latestCheckin: checkins?.[0] ?? null,
    latestNutrition: nutritionLogs?.[0] ?? null,
    upcomingSessions: (sessions ?? []).map((session) => ({
      id: session.id,
      title: session.title,
      scheduled_at: session.scheduled_at,
      type: session.type,
      teamName: portal.teamName,
    })),
    sevenDayLoad: recentLoad,
    todayProgram,
  };
}

export async function getAthletePersonalTrainingsData(): Promise<{
  portal: AthletePortalContext;
  trainings: Tables<"personal_trainings">[];
}> {
  const portal = await getAthletePortalContext();
  const db = createDbAdminClient();

  const { data: trainings, error } = await db
    .from("personal_trainings")
    .select("*")
    .eq("athlete_id", portal.athlete.id)
    .order("started_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(30);

  if (error) {
    throw new Error(error.message);
  }

  return {
    portal,
    trainings: trainings ?? [],
  };
}

