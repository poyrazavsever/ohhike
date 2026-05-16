import "server-only";

import { auth } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import type { Tables } from "./database.types";
import { isAthleteRole } from "./org-roles";
import {
  isAthletePortalPath,
  isCoachWorkspacePath,
  pathnameMatchesPrefix,
  COACH_ATHLETE_INSIGHT_PATHS,
} from "./portal-routes";
import { createSupabaseAdminClient } from "./supabase-admin";
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
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
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

  const supabase = createSupabaseAdminClient();
  const { data: team } = await supabase
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
  const supabase = createSupabaseAdminClient();

  const { data: memberships } = await supabase
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
    const supabase = createSupabaseAdminClient();
    const { data: team } = await supabase
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
}> {
  const portal = await getAthletePortalContext();
  const supabase = createSupabaseAdminClient();
  const since = new Date();
  since.setDate(since.getDate() - 7);

  const [{ data: checkins }, { data: nutritionLogs }, { data: sessions }, { data: recentAttendance }] =
    await Promise.all([
    supabase
      .from("wellness_checkins")
      .select("*")
      .eq("athlete_id", portal.athlete.id)
      .order("checkin_date", { ascending: false })
      .limit(1),
    supabase
      .from("nutrition_logs")
      .select("*")
      .eq("athlete_id", portal.athlete.id)
      .order("log_date", { ascending: false })
      .limit(1),
    supabase
      .from("sessions")
      .select("id, title, scheduled_at, type, team_id")
      .eq("team_id", portal.athlete.team_id)
      .gte("scheduled_at", new Date().toISOString())
      .order("scheduled_at", { ascending: true })
      .limit(5),
    supabase
      .from("session_attendance")
      .select("minutes_played, rpe, created_at")
      .eq("athlete_id", portal.athlete.id)
      .gte("created_at", since.toISOString()),
  ]);

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
  };
}
