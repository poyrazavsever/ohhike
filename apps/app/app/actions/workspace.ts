"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { cookies, headers } from "next/headers";
import { randomBytes } from "node:crypto";

import type {
  AiReportType,
  OrganizationRole,
  OrganizationType,
  SessionStatus,
  SessionType,
  SportType,
  WearableProvider,
} from "../../lib/database.types";
import {
  isDrillEquipmentValue,
  isOptionalDrillCategory,
  isOptionalDrillDifficulty,
  isOptionalMemorySeverity,
  isOptionalObservationCategory,
  isOptionalAbsenceReason,
  isOptionalBodyPainArea,
  isOptionalSessionFocusArea,
  isTeamPatternType,
} from "../../lib/coach-vocabulary";
import {
  getAthleteMetadata,
  getLinkedAthleteForUser,
  isAthleteProfileComplete,
} from "../../lib/athlete-portal";
import { isAthleteRole, isCoachStaffRole } from "../../lib/org-roles";
import { createSupabaseAdminClient } from "../../lib/supabase-admin";
import { ACTIVE_ORGANIZATION_COOKIE, getCurrentWorkspace } from "../../lib/workspace";

const organizationTypes = [
  "club",
  "academy",
  "individual_coach",
  "school_team",
  "university_team",
  "performance_center",
  "other",
] as const satisfies readonly OrganizationType[];

const sportTypes = [
  "football",
  "basketball",
  "volleyball",
  "handball",
  "running",
  "fitness",
  "tennis",
  "swimming",
  "martial_arts",
  "esports",
  "other",
] as const satisfies readonly SportType[];

const sessionTypes = [
  "team_training",
  "personal_training",
  "match",
  "friendly_match",
  "recovery",
  "test_day",
  "analysis_meeting",
  "nutrition_session",
  "education_session",
  "other",
] as const satisfies readonly SessionType[];

const sessionStatuses = [
  "draft",
  "planned",
  "in_progress",
  "completed",
  "cancelled",
  "analyzing",
  "analysis_completed",
  "analysis_failed",
] as const satisfies readonly SessionStatus[];

const wearableProviders = [
  "strava",
  "garmin",
  "apple_health",
  "health_connect",
  "polar",
  "fitbit",
  "manual",
  "csv_import",
  "other",
] as const satisfies readonly WearableProvider[];

const aiReportTypes = [
  "session_analysis",
  "match_analysis",
  "training_analysis",
  "player_development",
  "weekly_team_report",
  "load_report",
  "readiness_report",
  "nutrition_report",
  "scout_report",
] as const satisfies readonly AiReportType[];

export type WorkspaceActionResult =
  | {
      ok: true;
      /** Present when creating an athlete profile claim link. */
      claimUrl?: string;
      /** Present after switching the active organization. */
      redirectTo?: string;
    }
  | {
      ok: false;
      error: string;
    };

const organizationStaffRoles: OrganizationRole[] = [
  "owner",
  "admin",
  "head_coach",
  "assistant_coach",
  "analyst",
  "physiotherapist",
  "nutritionist",
];

export type UpdateOrganizationInput = {
  name: string;
  type: OrganizationType;
  city?: string;
  country?: string;
};

export type CreateOrganizationInput = {
  organization: {
    name: string;
    type: OrganizationType;
    city?: string;
    country?: string;
  };
  team: {
    name: string;
    sportType: SportType;
    ageGroup?: string;
    level?: string;
    weeklyTrainingCount?: string;
  };
};

export type CreateTeamInput = {
  name: string;
  sportType: SportType;
  ageGroup?: string;
  level?: string;
  seasonGoal?: string;
  weeklyTrainingCount?: string;
};

export type UpdateTeamInput = CreateTeamInput & {
  teamId: string;
};

export type CreateAthleteInput = {
  teamId: string;
  firstName: string;
  lastName?: string;
  email?: string;
  number?: string;
  position?: string;
  dominantSide?: string;
};

export type UpdateAthleteInput = CreateAthleteInput & {
  athleteId: string;
};

export type CompleteAthletePortalProfileInput = {
  firstName: string;
  lastName?: string;
  phone?: string;
  position?: string;
  dominantSide?: string;
};

export type CreateSessionInput = {
  teamId: string;
  title: string;
  type: SessionType;
  status?: SessionStatus;
  scheduledAt?: string;
  location?: string;
  opponent?: string;
  plannedDurationMin?: string;
  plannedIntensity?: string;
  focusArea?: string;
  coachNotes?: string;
  athleteIds: string[];
};

export type UpdateSessionInput = CreateSessionInput & {
  sessionId: string;
};

export type SessionAttendanceInput = {
  athleteId: string;
  included: boolean;
  attended: boolean;
  absenceReason?: string;
  minutesPlayed?: string;
  rpe?: string;
  coachNote?: string;
  painReported: boolean;
  painArea?: string;
};

export type UpdateSessionAttendanceInput = {
  sessionId: string;
  entries: SessionAttendanceInput[];
};

export type TrainingBlockInput = {
  id?: string;
  title: string;
  description?: string;
  orderIndex: string;
  plannedDurationMin?: string;
  actualDurationMin?: string;
  intensity?: string;
  completed: boolean;
  notes?: string;
};

export type UpdateSessionTrainingBlocksInput = {
  sessionId: string;
  blocks: TrainingBlockInput[];
};

export type UpsertReadinessCheckinInput = {
  athleteId: string;
  checkinDate: string;
  sleepQuality?: string;
  sleepHours?: string;
  fatigue?: string;
  muscleSoreness?: string;
  stress?: string;
  mood?: string;
  painArea?: string;
  notes?: string;
};

export type UpsertNutritionLogInput = {
  athleteId: string;
  logDate: string;
  hydrationScore?: string;
  mealQuality?: string;
  proteinServings?: string;
  carbsTiming?: string;
  supplements?: string;
  notes?: string;
};

export type CreateDrillInput = {
  title: string;
  sportType: SportType;
  category?: string;
  description?: string;
  objective?: string;
  durationMin?: string;
  difficulty?: string;
  playerCountMin?: string;
  playerCountMax?: string;
  areaSetup?: string;
  equipment?: string;
  instructions?: string;
  coachingPoints?: string;
  tags?: string;
};

export type CreateWearableConnectionInput = {
  athleteId: string;
  provider: WearableProvider;
  providerUserId?: string;
  scopes?: string;
};

export type CreateAiReportInput = {
  title: string;
  reportType: AiReportType;
  teamId?: string;
  athleteId?: string;
  sessionId?: string;
  summary?: string;
};

export type CreateAthleteObservationInput = {
  teamId: string;
  athleteId: string;
  title?: string;
  category?: string;
  severity?: string;
  observation: string;
  recommendation?: string;
};

export type CreateTeamPatternInput = {
  teamId: string;
  patternType: string;
  title: string;
  description?: string;
  severity?: string;
};

function cleanString(value: string | undefined) {
  const cleaned = value?.trim();
  return cleaned ? cleaned : null;
}

function isOrganizationType(value: string): value is OrganizationType {
  return organizationTypes.includes(value as OrganizationType);
}

function isSportType(value: string): value is SportType {
  return sportTypes.includes(value as SportType);
}

function isSessionType(value: string): value is SessionType {
  return sessionTypes.includes(value as SessionType);
}

function isSessionStatus(value: string): value is SessionStatus {
  return sessionStatuses.includes(value as SessionStatus);
}

function isWearableProvider(value: string): value is WearableProvider {
  return wearableProviders.includes(value as WearableProvider);
}

function isAiReportType(value: string): value is AiReportType {
  return aiReportTypes.includes(value as AiReportType);
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

function parsePositiveInteger(value: string | undefined) {
  const cleaned = cleanString(value);

  if (!cleaned) {
    return null;
  }

  const parsed = Number.parseInt(cleaned, 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function parseOptionalSessionIntensity(
  value: string | undefined,
):
  | { ok: true; value: number | null }
  | { ok: false; error: string } {
  const cleaned = value?.trim();
  if (!cleaned) {
    return { ok: true, value: null };
  }
  const parsed = parsePositiveInteger(value);
  if (parsed === null || parsed < 1 || parsed > 99) {
    return {
      ok: false,
      error: "Planned intensity must be a whole number from 1 to 99.",
    };
  }
  return { ok: true, value: parsed };
}

function parsePositiveNumber(value: string | undefined) {
  const cleaned = cleanString(value);

  if (!cleaned) {
    return null;
  }

  const parsed = Number.parseFloat(cleaned);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function parseScore(value: string | undefined) {
  const parsed = parsePositiveInteger(value);
  return parsed !== null && parsed >= 1 && parsed <= 10 ? parsed : null;
}

function parseOptionalRpe(
  value: string | undefined,
):
  | { ok: true; value: number | null }
  | { ok: false; error: string } {
  const cleaned = value?.trim();
  if (!cleaned) {
    return { ok: true, value: null };
  }
  const parsed = parseScore(value);
  if (parsed === null) {
    return {
      ok: false,
      error: "RPE must be a whole number from 1 to 10.",
    };
  }
  return { ok: true, value: parsed };
}

function calculateReadinessScore(input: UpsertReadinessCheckinInput) {
  const positiveScores = [
    parseScore(input.sleepQuality),
    parseScore(input.mood),
  ].filter((score): score is number => score !== null);
  const negativeScores = [
    parseScore(input.fatigue),
    parseScore(input.muscleSoreness),
    parseScore(input.stress),
  ].filter((score): score is number => score !== null);

  if (positiveScores.length === 0 && negativeScores.length === 0) {
    return null;
  }

  const positiveAverage =
    positiveScores.length > 0
      ? positiveScores.reduce((total, score) => total + score, 0) /
        positiveScores.length
      : 5;
  const negativeAverage =
    negativeScores.length > 0
      ? negativeScores.reduce((total, score) => total + score, 0) /
        negativeScores.length
      : 5;

  return Math.round(((positiveAverage + (11 - negativeAverage)) / 20) * 100);
}

function parseTags(value: string | undefined) {
  const cleaned = cleanString(value);

  if (!cleaned) {
    return [];
  }

  return cleaned
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 12);
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function parseDateTime(value: string | undefined) {
  const cleaned = cleanString(value);

  if (!cleaned) {
    return null;
  }

  const date = new Date(cleaned);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

async function canCurrentWorkspaceCreateOrganization() {
  const { organization } = await getCurrentWorkspace();
  const supabase = createSupabaseAdminClient();

  const { data: team, error: teamError } = await supabase
    .from("teams")
    .select("id")
    .eq("organization_id", organization.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (teamError) {
    throw new Error(teamError.message);
  }

  if (!team) {
    return false;
  }

  const { data: entitlement, error: entitlementError } = await supabase
    .from("team_billing_entitlements")
    .select("plan")
    .eq("team_id", team.id)
    .maybeSingle();

  if (entitlementError) {
    throw new Error(entitlementError.message);
  }

  return (
    entitlement?.plan === "pro_team" || entitlement?.plan === "pro_plus_team"
  );
}

async function resolvePostOrganizationSwitchPath(
  userId: string,
  organizationId: string,
  role: OrganizationRole,
): Promise<string> {
  if (!isAthleteRole(role)) {
    return "/dashboard";
  }

  const athlete = await getLinkedAthleteForUser(userId, organizationId);

  if (!athlete || !isAthleteProfileComplete(athlete)) {
    return "/athlete/onboarding";
  }

  return "/athlete/home";
}

export async function switchActiveOrganization(
  organizationId: string,
): Promise<WorkspaceActionResult> {
  const { userId } = await auth();

  if (!userId) {
    return {
      ok: false,
      error: "You need to sign in again.",
    };
  }

  const supabase = createSupabaseAdminClient();

  const { data: membership, error } = await supabase
    .from("organization_members")
    .select("id, role")
    .eq("user_id", userId)
    .eq("organization_id", organizationId)
    .eq("is_active", true)
    .maybeSingle();

  if (error || !membership) {
    return {
      ok: false,
      error: "You do not have access to this organization.",
    };
  }

  const cookieStore = await cookies();
  cookieStore.set(ACTIVE_ORGANIZATION_COOKIE, organizationId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });

  revalidatePath("/", "layout");

  const redirectTo = await resolvePostOrganizationSwitchPath(
    userId,
    organizationId,
    membership.role,
  );

  return {
    ok: true,
    redirectTo,
  };
}

export async function updateActiveOrganization(
  input: UpdateOrganizationInput,
): Promise<WorkspaceActionResult> {
  const name = cleanString(input.name);

  if (!name) {
    return {
      ok: false,
      error: "Organization name is required.",
    };
  }

  if (!isOrganizationType(input.type)) {
    return {
      ok: false,
      error: "Invalid organization type.",
    };
  }

  const { organization, membership } = await getCurrentWorkspace();

  if (membership.role !== "owner" && membership.role !== "admin") {
    return {
      ok: false,
      error: "Only owners and admins can update organization settings.",
    };
  }

  const supabase = createSupabaseAdminClient();

  const { error } = await supabase
    .from("organizations")
    .update({
      name,
      type: input.type,
      city: cleanString(input.city),
      country: cleanString(input.country),
    })
    .eq("id", organization.id);

  if (error) {
    return {
      ok: false,
      error: error.message,
    };
  }

  revalidatePath("/");

  return {
    ok: true,
  };
}

export async function createAdditionalOrganization(
  input: CreateOrganizationInput,
): Promise<WorkspaceActionResult> {
  const { userId } = await auth();

  if (!userId) {
    return {
      ok: false,
      error: "You need to sign in again.",
    };
  }

  const organizationName = cleanString(input.organization.name);
  const teamName = cleanString(input.team.name);

  if (!organizationName) {
    return {
      ok: false,
      error: "Organization name is required.",
    };
  }

  if (!teamName) {
    return {
      ok: false,
      error: "First team name is required.",
    };
  }

  if (!isOrganizationType(input.organization.type)) {
    return {
      ok: false,
      error: "Invalid organization type.",
    };
  }

  if (!isSportType(input.team.sportType)) {
    return {
      ok: false,
      error: "Invalid sport type.",
    };
  }

  const allowed = await canCurrentWorkspaceCreateOrganization();

  if (!allowed) {
    return {
      ok: false,
      error:
        "Multiple organizations are available on Pro and Pro Plus team plans.",
    };
  }

  const supabase = createSupabaseAdminClient();
  const organizationSlug = `${slugify(organizationName)}-${crypto.randomUUID().slice(0, 8)}`;

  const { data: organization, error: organizationError } = await supabase
    .from("organizations")
    .insert({
      name: organizationName,
      slug: organizationSlug,
      type: input.organization.type,
      city: cleanString(input.organization.city),
      country: cleanString(input.organization.country),
      created_by: userId,
    })
    .select("id")
    .single();

  if (organizationError) {
    return {
      ok: false,
      error: organizationError.message,
    };
  }

  const organizationId = organization.id;

  const { error: membershipError } = await supabase
    .from("organization_members")
    .insert({
      organization_id: organizationId,
      user_id: userId,
      role: "owner",
      is_active: true,
    });

  if (membershipError) {
    return {
      ok: false,
      error: membershipError.message,
    };
  }

  const { data: team, error: teamError } = await supabase
    .from("teams")
    .insert({
      organization_id: organizationId,
      name: teamName,
      sport_type: input.team.sportType,
      age_group: cleanString(input.team.ageGroup),
      level: cleanString(input.team.level),
      weekly_training_count: parsePositiveInteger(input.team.weeklyTrainingCount) ?? 0,
    })
    .select("id")
    .single();

  if (teamError) {
    return {
      ok: false,
      error: teamError.message,
    };
  }

  const teamId = team.id;

  const { error: teamStaffError } = await supabase.from("team_staff").insert({
    team_id: teamId,
    user_id: userId,
    role: "head_coach",
    assigned_by: userId,
  });

  if (teamStaffError) {
    return {
      ok: false,
      error: teamStaffError.message,
    };
  }

  const { error: entitlementError } = await supabase
    .from("team_billing_entitlements")
    .insert({
      organization_id: organizationId,
      team_id: teamId,
      plan: "basic_team",
      max_team_members: 3,
    });

  if (entitlementError) {
    return {
      ok: false,
      error: entitlementError.message,
    };
  }

  const cookieStore = await cookies();
  cookieStore.set(ACTIVE_ORGANIZATION_COOKIE, organizationId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });

  await supabase.from("audit_logs").insert([
    {
      organization_id: organizationId,
      user_id: userId,
      action: "organization.created",
      entity_type: "organization",
      entity_id: organizationId,
    },
    {
      organization_id: organizationId,
      user_id: userId,
      action: "team.created",
      entity_type: "team",
      entity_id: teamId,
    },
  ]);

  revalidatePath("/");

  return {
    ok: true,
  };
}

export async function createTeam(
  input: CreateTeamInput,
): Promise<WorkspaceActionResult> {
  const { userId } = await auth();

  if (!userId) {
    return {
      ok: false,
      error: "You need to sign in again.",
    };
  }

  const teamName = cleanString(input.name);

  if (!teamName) {
    return {
      ok: false,
      error: "Team name is required.",
    };
  }

  if (!isSportType(input.sportType)) {
    return {
      ok: false,
      error: "Invalid sport type.",
    };
  }

  const { organization, membership } = await getCurrentWorkspace();

  if (
    !["owner", "admin", "head_coach"].includes(membership.role)
  ) {
    return {
      ok: false,
      error: "Only owners, admins and head coaches can create teams.",
    };
  }

  const supabase = createSupabaseAdminClient();

  const { data: team, error: teamError } = await supabase
    .from("teams")
    .insert({
      organization_id: organization.id,
      name: teamName,
      sport_type: input.sportType,
      age_group: cleanString(input.ageGroup),
      level: cleanString(input.level),
      season_goal: cleanString(input.seasonGoal),
      weekly_training_count: parsePositiveInteger(input.weeklyTrainingCount) ?? 0,
    })
    .select("id")
    .single();

  if (teamError) {
    return {
      ok: false,
      error: teamError.message,
    };
  }

  const { error: teamStaffError } = await supabase.from("team_staff").insert({
    team_id: team.id,
    user_id: userId,
    role: "head_coach",
    assigned_by: userId,
  });

  if (teamStaffError) {
    return {
      ok: false,
      error: teamStaffError.message,
    };
  }

  const { error: entitlementError } = await supabase
    .from("team_billing_entitlements")
    .insert({
      organization_id: organization.id,
      team_id: team.id,
      plan: "basic_team",
      max_team_members: 3,
    });

  if (entitlementError) {
    return {
      ok: false,
      error: entitlementError.message,
    };
  }

  await supabase.from("audit_logs").insert({
    organization_id: organization.id,
    user_id: userId,
    action: "team.created",
    entity_type: "team",
    entity_id: team.id,
  });

  revalidatePath("/teams");
  revalidatePath("/dashboard");

  return {
    ok: true,
  };
}

export async function updateTeam(
  input: UpdateTeamInput,
): Promise<WorkspaceActionResult> {
  const teamName = cleanString(input.name);

  if (!teamName) {
    return {
      ok: false,
      error: "Team name is required.",
    };
  }

  if (!isSportType(input.sportType)) {
    return {
      ok: false,
      error: "Invalid sport type.",
    };
  }

  const { organization, membership } = await getCurrentWorkspace();

  if (!["owner", "admin", "head_coach"].includes(membership.role)) {
    return {
      ok: false,
      error: "Only owners, admins and head coaches can update teams.",
    };
  }

  const supabase = createSupabaseAdminClient();

  const { error } = await supabase
    .from("teams")
    .update({
      name: teamName,
      sport_type: input.sportType,
      age_group: cleanString(input.ageGroup),
      level: cleanString(input.level),
      season_goal: cleanString(input.seasonGoal),
      weekly_training_count: parsePositiveInteger(input.weeklyTrainingCount) ?? 0,
    })
    .eq("id", input.teamId)
    .eq("organization_id", organization.id);

  if (error) {
    return {
      ok: false,
      error: error.message,
    };
  }

  await supabase.from("audit_logs").insert({
    organization_id: organization.id,
    user_id: membership.user_id,
    action: "team.updated",
    entity_type: "team",
    entity_id: input.teamId,
  });

  revalidatePath("/teams");
  revalidatePath("/dashboard");

  return {
    ok: true,
  };
}

export async function deleteTeam(
  teamId: string,
): Promise<WorkspaceActionResult> {
  const { organization, membership } = await getCurrentWorkspace();

  if (!["owner", "admin"].includes(membership.role)) {
    return {
      ok: false,
      error: "Only owners and admins can delete teams.",
    };
  }

  const supabase = createSupabaseAdminClient();

  const { count: teamCount, error: teamCountError } = await supabase
    .from("teams")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", organization.id);

  if (teamCountError) {
    return {
      ok: false,
      error: teamCountError.message,
    };
  }

  if ((teamCount ?? 0) <= 1) {
    return {
      ok: false,
      error: "Create another team before deleting the last team.",
    };
  }

  const { count: athleteCount, error: athleteCountError } = await supabase
    .from("athletes")
    .select("id", { count: "exact", head: true })
    .eq("team_id", teamId);

  if (athleteCountError) {
    return {
      ok: false,
      error: athleteCountError.message,
    };
  }

  if ((athleteCount ?? 0) > 0) {
    return {
      ok: false,
      error: "Move or remove athletes before deleting this team.",
    };
  }

  const { error } = await supabase
    .from("teams")
    .delete()
    .eq("id", teamId)
    .eq("organization_id", organization.id);

  if (error) {
    return {
      ok: false,
      error: error.message,
    };
  }

  await supabase.from("audit_logs").insert({
    organization_id: organization.id,
    user_id: membership.user_id,
    action: "team.deleted",
    entity_type: "team",
    entity_id: teamId,
  });

  revalidatePath("/teams");
  revalidatePath("/dashboard");

  return {
    ok: true,
  };
}

export async function createAthlete(
  input: CreateAthleteInput,
): Promise<WorkspaceActionResult> {
  const { userId } = await auth();

  if (!userId) {
    return {
      ok: false,
      error: "You need to sign in again.",
    };
  }

  const firstName = cleanString(input.firstName);

  if (!firstName) {
    return {
      ok: false,
      error: "Athlete first name is required.",
    };
  }

  const email = cleanString(input.email);

  if (email && !isValidEmail(email)) {
    return {
      ok: false,
      error: "Please enter a valid athlete email address.",
    };
  }

  const { organization, membership } = await getCurrentWorkspace();

  if (
    !["owner", "admin", "head_coach", "assistant_coach"].includes(
      membership.role,
    )
  ) {
    return {
      ok: false,
      error: "Only coaches and admins can create athletes.",
    };
  }

  const supabase = createSupabaseAdminClient();

  const { data: team, error: teamError } = await supabase
    .from("teams")
    .select("id")
    .eq("id", input.teamId)
    .eq("organization_id", organization.id)
    .maybeSingle();

  if (teamError || !team) {
    return {
      ok: false,
      error: "Please select a valid team.",
    };
  }

  const lastName = cleanString(input.lastName);
  const { error } = await supabase.from("athletes").insert({
    organization_id: organization.id,
    team_id: team.id,
    first_name: firstName,
    last_name: lastName,
    display_name: [firstName, lastName].filter(Boolean).join(" "),
    email,
    number: parsePositiveInteger(input.number),
    position: cleanString(input.position),
    dominant_side: cleanString(input.dominantSide),
    status: "active",
    created_by: userId,
  });

  if (error) {
    return {
      ok: false,
      error: error.message,
    };
  }

  await supabase.from("audit_logs").insert({
    organization_id: organization.id,
    user_id: userId,
    action: "athlete.created",
    entity_type: "athlete",
  });

  revalidatePath("/athletes");
  revalidatePath("/dashboard");
  revalidatePath("/teams");

  return {
    ok: true,
  };
}

export async function updateAthlete(
  input: UpdateAthleteInput,
): Promise<WorkspaceActionResult> {
  const firstName = cleanString(input.firstName);

  if (!firstName) {
    return {
      ok: false,
      error: "Athlete first name is required.",
    };
  }

  const email = cleanString(input.email);

  if (email && !isValidEmail(email)) {
    return {
      ok: false,
      error: "Please enter a valid athlete email address.",
    };
  }

  const { organization, membership } = await getCurrentWorkspace();

  if (
    !["owner", "admin", "head_coach", "assistant_coach"].includes(
      membership.role,
    )
  ) {
    return {
      ok: false,
      error: "Only coaches and admins can update athletes.",
    };
  }

  const supabase = createSupabaseAdminClient();

  const { data: team, error: teamError } = await supabase
    .from("teams")
    .select("id")
    .eq("id", input.teamId)
    .eq("organization_id", organization.id)
    .maybeSingle();

  if (teamError || !team) {
    return {
      ok: false,
      error: "Please select a valid team.",
    };
  }

  const lastName = cleanString(input.lastName);
  const { error } = await supabase
    .from("athletes")
    .update({
      team_id: team.id,
      first_name: firstName,
      last_name: lastName,
      display_name: [firstName, lastName].filter(Boolean).join(" "),
      email,
      number: parsePositiveInteger(input.number),
      position: cleanString(input.position),
      dominant_side: cleanString(input.dominantSide),
    })
    .eq("id", input.athleteId)
    .eq("organization_id", organization.id);

  if (error) {
    return {
      ok: false,
      error: error.message,
    };
  }

  await supabase.from("audit_logs").insert({
    organization_id: organization.id,
    user_id: membership.user_id,
    action: "athlete.updated",
    entity_type: "athlete",
    entity_id: input.athleteId,
  });

  revalidatePath("/athletes");
  revalidatePath("/dashboard");
  revalidatePath("/teams");

  return {
    ok: true,
  };
}

export async function deleteAthlete(
  athleteId: string,
): Promise<WorkspaceActionResult> {
  const { organization, membership } = await getCurrentWorkspace();

  if (
    !["owner", "admin", "head_coach", "assistant_coach"].includes(
      membership.role,
    )
  ) {
    return {
      ok: false,
      error: "Only coaches and admins can delete athletes.",
    };
  }

  const supabase = createSupabaseAdminClient();

  const { error } = await supabase
    .from("athletes")
    .delete()
    .eq("id", athleteId)
    .eq("organization_id", organization.id);

  if (error) {
    return {
      ok: false,
      error: error.message,
    };
  }

  await supabase.from("audit_logs").insert({
    organization_id: organization.id,
    user_id: membership.user_id,
    action: "athlete.deleted",
    entity_type: "athlete",
    entity_id: athleteId,
  });

  revalidatePath("/athletes");
  revalidatePath("/dashboard");
  revalidatePath("/teams");

  return {
    ok: true,
  };
}

async function getRequestOrigin(): Promise<string> {
  const envBase = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (envBase) {
    return envBase;
  }

  try {
    const headerList = await headers();
    const host = headerList.get("x-forwarded-host") ?? headerList.get("host");
    if (!host) {
      return "";
    }
    const proto = headerList.get("x-forwarded-proto") ?? "https";
    return `${proto}://${host}`;
  } catch {
    return "";
  }
}

export async function createAthleteInvite(
  athleteId: string,
): Promise<WorkspaceActionResult> {
  const { userId } = await auth();

  if (!userId) {
    return {
      ok: false,
      error: "You need to sign in again.",
    };
  }

  const { organization, membership } = await getCurrentWorkspace();

  if (
    !["owner", "admin", "head_coach", "assistant_coach"].includes(
      membership.role,
    )
  ) {
    return {
      ok: false,
      error: "Only coaches and admins can invite athletes.",
    };
  }

  const supabase = createSupabaseAdminClient();

  const { data: athlete, error: athleteError } = await supabase
    .from("athletes")
    .select("id, organization_id, team_id, user_id, email")
    .eq("id", athleteId)
    .eq("organization_id", organization.id)
    .maybeSingle();

  if (athleteError || !athlete) {
    return {
      ok: false,
      error: "Athlete could not be found.",
    };
  }

  if (athlete.user_id) {
    return {
      ok: false,
      error: "This athlete has already connected an account.",
    };
  }

  await supabase
    .from("athlete_invites")
    .delete()
    .eq("athlete_id", athlete.id)
    .is("accepted_at", null);

  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(
    Date.now() + 14 * 24 * 60 * 60 * 1000,
  ).toISOString();

  const { error: insertError } = await supabase.from("athlete_invites").insert({
    athlete_id: athlete.id,
    organization_id: organization.id,
    team_id: athlete.team_id,
    email: cleanString(athlete.email ?? undefined),
    token,
    invited_by: userId,
    expires_at: expiresAt,
  });

  if (insertError) {
    return {
      ok: false,
      error: insertError.message,
    };
  }

  await supabase.from("audit_logs").insert({
    organization_id: organization.id,
    user_id: userId,
    action: "athlete.invite_created",
    entity_type: "athlete",
    entity_id: athlete.id,
  });

  revalidatePath("/athletes");

  const origin = await getRequestOrigin();
  const claimPath = `/invite/athlete/${token}`;
  const claimUrl = origin ? `${origin}${claimPath}` : claimPath;

  return {
    ok: true,
    claimUrl,
  };
}

export async function claimAthleteProfile(
  token: string,
): Promise<WorkspaceActionResult> {
  const { userId } = await auth();

  if (!userId) {
    return {
      ok: false,
      error: "You need to sign in before claiming this profile.",
    };
  }

  const trimmed = token?.trim();
  if (!trimmed) {
    return {
      ok: false,
      error: "This invite link is invalid.",
    };
  }

  const supabase = createSupabaseAdminClient();

  const { data: invite, error: inviteError } = await supabase
    .from("athlete_invites")
    .select("*")
    .eq("token", trimmed)
    .maybeSingle();

  if (inviteError || !invite) {
    return {
      ok: false,
      error: "This invite link is not valid.",
    };
  }

  if (invite.accepted_at) {
    return {
      ok: false,
      error: "This invite has already been used.",
    };
  }

  if (
    invite.expires_at &&
    new Date(invite.expires_at).getTime() < Date.now()
  ) {
    return {
      ok: false,
      error: "This invite has expired. Ask your coach for a new link.",
    };
  }

  const { data: athlete, error: athleteError } = await supabase
    .from("athletes")
    .select("id, organization_id, user_id, email")
    .eq("id", invite.athlete_id)
    .maybeSingle();

  if (athleteError || !athlete) {
    return {
      ok: false,
      error: "Athlete profile could not be found.",
    };
  }

  if (athlete.user_id) {
    return {
      ok: false,
      error: "This athlete profile is already connected to an account.",
    };
  }

  const { data: existingClaim } = await supabase
    .from("athletes")
    .select("id")
    .eq("organization_id", athlete.organization_id)
    .eq("user_id", userId)
    .maybeSingle();

  if (existingClaim) {
    return {
      ok: false,
      error:
        "Your account is already linked to another athlete in this organization.",
    };
  }

  const { data: existingMember } = await supabase
    .from("organization_members")
    .select("id, role")
    .eq("organization_id", invite.organization_id)
    .eq("user_id", userId)
    .maybeSingle();

  if (
    existingMember &&
    organizationStaffRoles.includes(existingMember.role as OrganizationRole)
  ) {
    return {
      ok: false,
      error:
        "You are signed in as staff for this organization. Use a different account to claim this athlete profile.",
    };
  }

  const clerkUser = await currentUser();
  const primaryEmail =
    clerkUser?.primaryEmailAddress?.emailAddress?.toLowerCase() ?? null;

  if (athlete.email?.trim()) {
    const athleteEmail = athlete.email.trim().toLowerCase();
    if (primaryEmail && primaryEmail !== athleteEmail) {
      return {
        ok: false,
        error:
          "Sign in with the same email address as on your athlete profile, or ask your coach to update it.",
      };
    }
  }

  const { data: updatedAthlete, error: updateAthleteError } = await supabase
    .from("athletes")
    .update({ user_id: userId })
    .eq("id", athlete.id)
    .is("user_id", null)
    .select("id")
    .maybeSingle();

  if (updateAthleteError || !updatedAthlete) {
    return {
      ok: false,
      error: "Could not link this profile. It may have just been claimed.",
    };
  }

  const { error: inviteUpdateError } = await supabase
    .from("athlete_invites")
    .update({
      accepted_at: new Date().toISOString(),
      accepted_by: userId,
    })
    .eq("id", invite.id);

  if (inviteUpdateError) {
    return {
      ok: false,
      error: inviteUpdateError.message,
    };
  }

  const memberError = existingMember
    ? (
        await supabase
          .from("organization_members")
          .update({ role: "athlete", is_active: true })
          .eq("id", existingMember.id)
      ).error
    : (
        await supabase.from("organization_members").insert({
          organization_id: invite.organization_id,
          user_id: userId,
          role: "athlete",
          is_active: true,
          invited_by: invite.invited_by,
        })
      ).error;

  if (memberError) {
    return {
      ok: false,
      error: memberError.message,
    };
  }

  await supabase.from("audit_logs").insert({
    organization_id: invite.organization_id,
    user_id: userId,
    action: "athlete.claimed",
    entity_type: "athlete",
    entity_id: athlete.id,
  });

  revalidatePath("/athletes");
  revalidatePath("/dashboard");
  revalidatePath("/athlete/home");
  revalidatePath("/athlete/onboarding");

  return {
    ok: true,
  };
}

export async function completeAthletePortalProfile(
  input: CompleteAthletePortalProfileInput,
): Promise<WorkspaceActionResult> {
  const { userId } = await auth();

  if (!userId) {
    return {
      ok: false,
      error: "You need to sign in again.",
    };
  }

  const firstName = cleanString(input.firstName);
  if (!firstName) {
    return {
      ok: false,
      error: "First name is required.",
    };
  }

  const { organization, membership } = await getCurrentWorkspace();

  if (!isAthleteRole(membership.role)) {
    return {
      ok: false,
      error: "Only athletes can complete this profile step.",
    };
  }

  const athlete = await getLinkedAthleteForUser(userId, organization.id);

  if (!athlete) {
    return {
      ok: false,
      error: "No athlete profile is linked to your account yet.",
    };
  }

  const lastName = cleanString(input.lastName);
  const supabase = createSupabaseAdminClient();
  const existingMeta = getAthleteMetadata(athlete);

  const { error } = await supabase
    .from("athletes")
    .update({
      first_name: firstName,
      last_name: lastName,
      display_name: [firstName, lastName].filter(Boolean).join(" "),
      phone: cleanString(input.phone),
      position: cleanString(input.position),
      dominant_side: cleanString(input.dominantSide),
      metadata: {
        ...existingMeta,
        profile_completed: true,
        profile_completed_at: new Date().toISOString(),
      },
    })
    .eq("id", athlete.id)
    .eq("organization_id", organization.id)
    .eq("user_id", userId);

  if (error) {
    return {
      ok: false,
      error: error.message,
    };
  }

  await supabase.from("audit_logs").insert({
    organization_id: organization.id,
    user_id: userId,
    action: "athlete.profile_completed",
    entity_type: "athlete",
    entity_id: athlete.id,
  });

  revalidatePath("/athlete/home");
  revalidatePath("/athlete/onboarding");
  revalidatePath("/athlete/profile");

  return {
    ok: true,
  };
}

export async function createSession(
  input: CreateSessionInput,
): Promise<WorkspaceActionResult> {
  const { userId } = await auth();

  if (!userId) {
    return {
      ok: false,
      error: "You need to sign in again.",
    };
  }

  const title = cleanString(input.title);

  if (!title) {
    return {
      ok: false,
      error: "Session title is required.",
    };
  }

  if (!isSessionType(input.type)) {
    return {
      ok: false,
      error: "Invalid session type.",
    };
  }

  const intensityResult = parseOptionalSessionIntensity(input.plannedIntensity);
  if (!intensityResult.ok) {
    return {
      ok: false,
      error: intensityResult.error,
    };
  }

  if (!isOptionalSessionFocusArea(input.focusArea)) {
    return {
      ok: false,
      error: "Invalid focus area.",
    };
  }

  const { organization, membership } = await getCurrentWorkspace();

  if (
    !["owner", "admin", "head_coach", "assistant_coach"].includes(
      membership.role,
    )
  ) {
    return {
      ok: false,
      error: "Only coaches and admins can create sessions.",
    };
  }

  const supabase = createSupabaseAdminClient();

  const { data: team, error: teamError } = await supabase
    .from("teams")
    .select("id")
    .eq("id", input.teamId)
    .eq("organization_id", organization.id)
    .maybeSingle();

  if (teamError || !team) {
    return {
      ok: false,
      error: "Please select a valid team.",
    };
  }

  const athleteIds = [...new Set(input.athleteIds)].filter(Boolean);

  if (athleteIds.length > 0) {
    const { data: athletes, error: athletesError } = await supabase
      .from("athletes")
      .select("id")
      .eq("organization_id", organization.id)
      .eq("team_id", team.id)
      .in("id", athleteIds);

    if (athletesError) {
      return {
        ok: false,
        error: athletesError.message,
      };
    }

    if ((athletes?.length ?? 0) !== athleteIds.length) {
      return {
        ok: false,
        error: "One or more selected athletes do not belong to this team.",
      };
    }
  }

  const { data: session, error: sessionError } = await supabase
    .from("sessions")
    .insert({
      organization_id: organization.id,
      team_id: team.id,
      title,
      type: input.type,
      status: "planned",
      scheduled_at: parseDateTime(input.scheduledAt),
      location: cleanString(input.location),
      opponent: cleanString(input.opponent),
      planned_duration_min: parsePositiveInteger(input.plannedDurationMin),
      planned_intensity: intensityResult.value,
      focus_area: cleanString(input.focusArea),
      coach_notes: cleanString(input.coachNotes),
      created_by: userId,
    })
    .select("id")
    .single();

  if (sessionError) {
    return {
      ok: false,
      error: sessionError.message,
    };
  }

  if (athleteIds.length > 0) {
    const { error: attendanceError } = await supabase
      .from("session_attendance")
      .insert(
        athleteIds.map((athleteId) => ({
          session_id: session.id,
          athlete_id: athleteId,
          attended: false,
        })),
      );

    if (attendanceError) {
      return {
        ok: false,
        error: attendanceError.message,
      };
    }
  }

  await supabase.from("audit_logs").insert({
    organization_id: organization.id,
    user_id: userId,
    action: "session.created",
    entity_type: "session",
    entity_id: session.id,
  });

  revalidatePath("/sessions");
  revalidatePath("/dashboard");

  return {
    ok: true,
  };
}

export async function updateSession(
  input: UpdateSessionInput,
): Promise<WorkspaceActionResult> {
  const title = cleanString(input.title);

  if (!title) {
    return {
      ok: false,
      error: "Session title is required.",
    };
  }

  if (!isSessionType(input.type)) {
    return {
      ok: false,
      error: "Invalid session type.",
    };
  }

  if (input.status && !isSessionStatus(input.status)) {
    return {
      ok: false,
      error: "Invalid session status.",
    };
  }

  const intensityResult = parseOptionalSessionIntensity(input.plannedIntensity);
  if (!intensityResult.ok) {
    return {
      ok: false,
      error: intensityResult.error,
    };
  }

  if (!isOptionalSessionFocusArea(input.focusArea)) {
    return {
      ok: false,
      error: "Invalid focus area.",
    };
  }

  const { organization, membership } = await getCurrentWorkspace();

  if (
    !["owner", "admin", "head_coach", "assistant_coach"].includes(
      membership.role,
    )
  ) {
    return {
      ok: false,
      error: "Only coaches and admins can update sessions.",
    };
  }

  const supabase = createSupabaseAdminClient();

  const [{ data: session }, { data: team, error: teamError }] =
    await Promise.all([
      supabase
        .from("sessions")
        .select("id, team_id")
        .eq("id", input.sessionId)
        .eq("organization_id", organization.id)
        .maybeSingle(),
      supabase
        .from("teams")
        .select("id")
        .eq("id", input.teamId)
        .eq("organization_id", organization.id)
        .maybeSingle(),
    ]);

  if (!session) {
    return {
      ok: false,
      error: "Session could not be found.",
    };
  }

  if (teamError || !team) {
    return {
      ok: false,
      error: "Please select a valid team.",
    };
  }

  const { error } = await supabase
    .from("sessions")
    .update({
      team_id: team.id,
      title,
      type: input.type,
      status: input.status ?? "planned",
      scheduled_at: parseDateTime(input.scheduledAt),
      location: cleanString(input.location),
      opponent: cleanString(input.opponent),
      planned_duration_min: parsePositiveInteger(input.plannedDurationMin),
      planned_intensity: intensityResult.value,
      focus_area: cleanString(input.focusArea),
      coach_notes: cleanString(input.coachNotes),
    })
    .eq("id", input.sessionId)
    .eq("organization_id", organization.id);

  if (error) {
    return {
      ok: false,
      error: error.message,
    };
  }

  if (session.team_id !== team.id) {
    const { error: attendanceDeleteError } = await supabase
      .from("session_attendance")
      .delete()
      .eq("session_id", input.sessionId);

    if (attendanceDeleteError) {
      return {
        ok: false,
        error: attendanceDeleteError.message,
      };
    }
  }

  await supabase.from("audit_logs").insert({
    organization_id: organization.id,
    user_id: membership.user_id,
    action: "session.updated",
    entity_type: "session",
    entity_id: input.sessionId,
  });

  revalidatePath("/sessions");
  revalidatePath(`/sessions/${input.sessionId}`);
  revalidatePath("/dashboard");

  return {
    ok: true,
  };
}

export async function completeSession(
  sessionId: string,
): Promise<WorkspaceActionResult> {
  const { organization, membership } = await getCurrentWorkspace();

  if (
    !["owner", "admin", "head_coach", "assistant_coach"].includes(
      membership.role,
    )
  ) {
    return {
      ok: false,
      error: "Only coaches and admins can complete sessions.",
    };
  }

  const supabase = createSupabaseAdminClient();

  const { data: session, error: sessionError } = await supabase
    .from("sessions")
    .select("id, status, started_at, planned_duration_min")
    .eq("id", sessionId)
    .eq("organization_id", organization.id)
    .maybeSingle();

  if (sessionError || !session) {
    return {
      ok: false,
      error: "Session could not be found.",
    };
  }

  if (session.status === "completed") {
    return {
      ok: false,
      error: "This session is already marked as completed.",
    };
  }

  if (session.status === "cancelled") {
    return {
      ok: false,
      error: "Cancelled sessions cannot be completed.",
    };
  }

  const endedAt = new Date().toISOString();
  const startedAt = session.started_at ?? endedAt;

  const { error } = await supabase
    .from("sessions")
    .update({
      status: "completed",
      started_at: startedAt,
      ended_at: endedAt,
      actual_duration_min: session.planned_duration_min,
    })
    .eq("id", sessionId)
    .eq("organization_id", organization.id);

  if (error) {
    return {
      ok: false,
      error: error.message,
    };
  }

  await supabase.from("audit_logs").insert({
    organization_id: organization.id,
    user_id: membership.user_id,
    action: "session.completed",
    entity_type: "session",
    entity_id: sessionId,
  });

  revalidatePath("/sessions");
  revalidatePath(`/sessions/${sessionId}`);
  revalidatePath("/dashboard");
  revalidatePath("/load-recovery");

  return {
    ok: true,
  };
}

export async function deleteSession(
  sessionId: string,
): Promise<WorkspaceActionResult> {
  const { organization, membership } = await getCurrentWorkspace();

  if (
    !["owner", "admin", "head_coach", "assistant_coach"].includes(
      membership.role,
    )
  ) {
    return {
      ok: false,
      error: "Only coaches and admins can delete sessions.",
    };
  }

  const supabase = createSupabaseAdminClient();

  const { data: session } = await supabase
    .from("sessions")
    .select("id")
    .eq("id", sessionId)
    .eq("organization_id", organization.id)
    .maybeSingle();

  if (!session) {
    return {
      ok: false,
      error: "Session could not be found.",
    };
  }

  const { error } = await supabase
    .from("sessions")
    .delete()
    .eq("id", sessionId)
    .eq("organization_id", organization.id);

  if (error) {
    return {
      ok: false,
      error: error.message,
    };
  }

  await supabase.from("audit_logs").insert({
    organization_id: organization.id,
    user_id: membership.user_id,
    action: "session.deleted",
    entity_type: "session",
    entity_id: sessionId,
  });

  revalidatePath("/sessions");
  revalidatePath(`/sessions/${sessionId}`);
  revalidatePath("/dashboard");

  return {
    ok: true,
  };
}

export async function updateSessionAttendance(
  input: UpdateSessionAttendanceInput,
): Promise<WorkspaceActionResult> {
  const { organization, membership } = await getCurrentWorkspace();

  if (
    !["owner", "admin", "head_coach", "assistant_coach"].includes(
      membership.role,
    )
  ) {
    return {
      ok: false,
      error: "Only coaches and admins can update attendance.",
    };
  }

  const supabase = createSupabaseAdminClient();

  const { data: session, error: sessionError } = await supabase
    .from("sessions")
    .select("id, team_id")
    .eq("id", input.sessionId)
    .eq("organization_id", organization.id)
    .maybeSingle();

  if (sessionError || !session) {
    return {
      ok: false,
      error: "Session could not be found.",
    };
  }

  const includedEntries = input.entries.filter((entry) => entry.included);
  const includedAthleteIds = includedEntries.map((entry) => entry.athleteId);

  if (includedAthleteIds.length > 0) {
    const { data: athletes, error: athletesError } = await supabase
      .from("athletes")
      .select("id")
      .eq("organization_id", organization.id)
      .eq("team_id", session.team_id)
      .in("id", includedAthleteIds);

    if (athletesError) {
      return {
        ok: false,
        error: athletesError.message,
      };
    }

    if ((athletes?.length ?? 0) !== includedAthleteIds.length) {
      return {
        ok: false,
        error: "One or more selected athletes do not belong to this team.",
      };
    }
  }

  const { error: deleteError } = await supabase
    .from("session_attendance")
    .delete()
    .eq("session_id", session.id);

  if (deleteError) {
    return {
      ok: false,
      error: deleteError.message,
    };
  }

  if (includedEntries.length > 0) {
    const normalizedEntries: Array<{
      session_id: string;
      athlete_id: string;
      attended: boolean;
      absence_reason: string | null;
      minutes_played: number | null;
      rpe: number | null;
      coach_note: string | null;
      pain_reported: boolean;
      pain_area: string | null;
    }> = [];

    for (const entry of includedEntries) {
      const absenceReason = entry.attended
        ? null
        : cleanString(entry.absenceReason);

      if (absenceReason && !isOptionalAbsenceReason(absenceReason)) {
        return {
          ok: false,
          error: "Invalid absence reason.",
        };
      }

      const painArea = entry.painReported ? cleanString(entry.painArea) : null;

      if (painArea && !isOptionalBodyPainArea(painArea)) {
        return {
          ok: false,
          error: "Invalid pain area.",
        };
      }

      const rpeResult = parseOptionalRpe(entry.rpe);
      if (!rpeResult.ok) {
        return {
          ok: false,
          error: rpeResult.error,
        };
      }

      normalizedEntries.push({
        session_id: session.id,
        athlete_id: entry.athleteId,
        attended: entry.attended,
        absence_reason: absenceReason,
        minutes_played: parsePositiveInteger(entry.minutesPlayed),
        rpe: rpeResult.value,
        coach_note: cleanString(entry.coachNote),
        pain_reported: entry.painReported,
        pain_area: painArea,
      });
    }

    const { error: insertError } = await supabase
      .from("session_attendance")
      .insert(normalizedEntries);

    if (insertError) {
      return {
        ok: false,
        error: insertError.message,
      };
    }
  }

  await supabase.from("audit_logs").insert({
    organization_id: organization.id,
    user_id: membership.user_id,
    action: "session.attendance_updated",
    entity_type: "session",
    entity_id: session.id,
  });

  revalidatePath("/sessions");
  revalidatePath(`/sessions/${input.sessionId}`);
  revalidatePath("/dashboard");
  revalidatePath("/load-recovery");

  return {
    ok: true,
  };
}

export async function updateSessionTrainingBlocks(
  input: UpdateSessionTrainingBlocksInput,
): Promise<WorkspaceActionResult> {
  const { organization, membership } = await getCurrentWorkspace();

  if (
    !["owner", "admin", "head_coach", "assistant_coach"].includes(
      membership.role,
    )
  ) {
    return {
      ok: false,
      error: "Only coaches and admins can update training blocks.",
    };
  }

  for (const block of input.blocks) {
    const cleaned = block.intensity?.trim();
    if (cleaned) {
      const parsed = parsePositiveInteger(block.intensity);
      if (parsed === null || parsed < 1 || parsed > 99) {
        return {
          ok: false,
          error:
            "Each block intensity must be a whole number from 1 to 99, or left empty.",
        };
      }
    }
  }

  const blocks = input.blocks
    .map((block, index) => ({
      ...block,
      title: cleanString(block.title),
      orderIndex: parsePositiveInteger(block.orderIndex) ?? index,
      plannedDurationMin: parsePositiveInteger(block.plannedDurationMin),
      actualDurationMin: parsePositiveInteger(block.actualDurationMin),
      intensity: block.intensity?.trim()
        ? parsePositiveInteger(block.intensity)
        : null,
      description: cleanString(block.description),
      notes: cleanString(block.notes),
    }))
    .filter((block) => block.title);

  if (blocks.length !== input.blocks.filter((block) => cleanString(block.title)).length) {
    return {
      ok: false,
      error: "Every training block needs a title.",
    };
  }

  const supabase = createSupabaseAdminClient();

  const { data: session, error: sessionError } = await supabase
    .from("sessions")
    .select("id")
    .eq("id", input.sessionId)
    .eq("organization_id", organization.id)
    .maybeSingle();

  if (sessionError || !session) {
    return {
      ok: false,
      error: "Session could not be found.",
    };
  }

  const { error: deleteError } = await supabase
    .from("training_blocks")
    .delete()
    .eq("session_id", session.id);

  if (deleteError) {
    return {
      ok: false,
      error: deleteError.message,
    };
  }

  if (blocks.length > 0) {
    const { error: insertError } = await supabase.from("training_blocks").insert(
      blocks.map((block) => ({
        session_id: session.id,
        title: block.title as string,
        description: block.description,
        order_index: block.orderIndex,
        planned_duration_min: block.plannedDurationMin,
        actual_duration_min: block.actualDurationMin,
        intensity: block.intensity,
        completed: block.completed,
        notes: block.notes,
      })),
    );

    if (insertError) {
      return {
        ok: false,
        error: insertError.message,
      };
    }
  }

  await supabase.from("audit_logs").insert({
    organization_id: organization.id,
    user_id: membership.user_id,
    action: "session.training_blocks_updated",
    entity_type: "session",
    entity_id: session.id,
  });

  revalidatePath("/sessions");
  revalidatePath(`/sessions/${session.id}`);
  revalidatePath("/dashboard");

  return {
    ok: true,
  };
}

export async function upsertReadinessCheckin(
  input: UpsertReadinessCheckinInput,
): Promise<WorkspaceActionResult> {
  const { userId } = await auth();

  if (!userId) {
    return {
      ok: false,
      error: "You need to sign in again.",
    };
  }

  const checkinDate = cleanString(input.checkinDate);

  if (!checkinDate) {
    return {
      ok: false,
      error: "Check-in date is required.",
    };
  }

  const { organization, membership } = await getCurrentWorkspace();
  const supabase = createSupabaseAdminClient();

  let athlete: { id: string; team_id: string } | null = null;

  if (isAthleteRole(membership.role)) {
    const linked = await getLinkedAthleteForUser(userId, organization.id);
    if (!linked || linked.id !== input.athleteId) {
      return {
        ok: false,
        error: "You can only submit check-ins for your own profile.",
      };
    }
    athlete = { id: linked.id, team_id: linked.team_id };
  } else if (
    isCoachStaffRole(membership.role) &&
    ["owner", "admin", "head_coach", "assistant_coach", "physiotherapist"].includes(
      membership.role,
    )
  ) {
    const { data, error: athleteError } = await supabase
      .from("athletes")
      .select("id, team_id")
      .eq("id", input.athleteId)
      .eq("organization_id", organization.id)
      .maybeSingle();

    if (athleteError || !data) {
      return {
        ok: false,
        error: "Please select a valid athlete.",
      };
    }
    athlete = data;
  } else {
    return {
      ok: false,
      error: "You do not have permission to manage readiness check-ins.",
    };
  }

  const painArea = cleanString(input.painArea);
  if (painArea && !isOptionalBodyPainArea(painArea)) {
    return {
      ok: false,
      error: "Invalid pain area.",
    };
  }

  const { error } = await supabase.from("wellness_checkins").upsert(
    {
      organization_id: organization.id,
      team_id: athlete.team_id,
      athlete_id: athlete.id,
      checkin_date: checkinDate,
      sleep_quality: parseScore(input.sleepQuality),
      sleep_hours: parsePositiveNumber(input.sleepHours),
      fatigue: parseScore(input.fatigue),
      muscle_soreness: parseScore(input.muscleSoreness),
      stress: parseScore(input.stress),
      mood: parseScore(input.mood),
      readiness_score: calculateReadinessScore(input),
      pain_area: painArea,
      notes: cleanString(input.notes),
      created_by: userId,
    },
    {
      onConflict: "athlete_id,checkin_date",
    },
  );

  if (error) {
    return {
      ok: false,
      error: error.message,
    };
  }

  await supabase.from("audit_logs").insert({
    organization_id: organization.id,
    user_id: userId,
    action: "readiness_checkin.upserted",
    entity_type: "wellness_checkin",
  });

  revalidatePath("/readiness");
  revalidatePath("/athlete/check-in");
  revalidatePath("/athlete/home");
  revalidatePath("/dashboard");

  return {
    ok: true,
  };
}

export async function upsertNutritionLog(
  input: UpsertNutritionLogInput,
): Promise<WorkspaceActionResult> {
  const { userId } = await auth();

  if (!userId) {
    return {
      ok: false,
      error: "You need to sign in again.",
    };
  }

  const logDate = cleanString(input.logDate);

  if (!logDate) {
    return {
      ok: false,
      error: "Log date is required.",
    };
  }

  const { organization, membership } = await getCurrentWorkspace();
  const supabase = createSupabaseAdminClient();

  let athlete: { id: string; team_id: string } | null = null;

  if (isAthleteRole(membership.role)) {
    const linked = await getLinkedAthleteForUser(userId, organization.id);
    if (!linked || linked.id !== input.athleteId) {
      return {
        ok: false,
        error: "You can only submit nutrition logs for your own profile.",
      };
    }
    athlete = { id: linked.id, team_id: linked.team_id };
  } else if (
    isCoachStaffRole(membership.role) &&
    [
      "owner",
      "admin",
      "head_coach",
      "assistant_coach",
      "nutritionist",
    ].includes(membership.role)
  ) {
    const { data, error: athleteError } = await supabase
      .from("athletes")
      .select("id, team_id")
      .eq("id", input.athleteId)
      .eq("organization_id", organization.id)
      .maybeSingle();

    if (athleteError || !data) {
      return {
        ok: false,
        error: "Please select a valid athlete.",
      };
    }
    athlete = data;
  } else {
    return {
      ok: false,
      error: "You do not have permission to manage nutrition logs.",
    };
  }

  const { error } = await supabase.from("nutrition_logs").upsert(
    {
      organization_id: organization.id,
      team_id: athlete.team_id,
      athlete_id: athlete.id,
      log_date: logDate,
      hydration_score: parseScore(input.hydrationScore),
      meal_quality: parseScore(input.mealQuality),
      protein_servings: parsePositiveInteger(input.proteinServings),
      carbs_timing: cleanString(input.carbsTiming),
      supplements: cleanString(input.supplements),
      notes: cleanString(input.notes),
      created_by: userId,
    },
    {
      onConflict: "athlete_id,log_date",
    },
  );

  if (error) {
    return {
      ok: false,
      error: error.message,
    };
  }

  await supabase.from("audit_logs").insert({
    organization_id: organization.id,
    user_id: userId,
    action: "nutrition_log.upserted",
    entity_type: "nutrition_log",
  });

  revalidatePath("/nutrition");
  revalidatePath("/athlete/nutrition");
  revalidatePath("/athlete/home");
  revalidatePath("/dashboard");

  return {
    ok: true,
  };
}

export async function createDrill(
  input: CreateDrillInput,
): Promise<WorkspaceActionResult> {
  const { userId } = await auth();

  if (!userId) {
    return {
      ok: false,
      error: "You need to sign in again.",
    };
  }

  const title = cleanString(input.title);

  if (!title) {
    return {
      ok: false,
      error: "Drill title is required.",
    };
  }

  if (!isSportType(input.sportType)) {
    return {
      ok: false,
      error: "Invalid sport type.",
    };
  }

  const category = cleanString(input.category);
  const difficulty = cleanString(input.difficulty);
  const equipment = cleanString(input.equipment);

  if (!isOptionalDrillCategory(category)) {
    return {
      ok: false,
      error: "Invalid drill category.",
    };
  }

  if (!isOptionalDrillDifficulty(difficulty)) {
    return {
      ok: false,
      error: "Invalid drill difficulty.",
    };
  }

  if (!isDrillEquipmentValue(equipment)) {
    return {
      ok: false,
      error: "Equipment description is too long or invalid.",
    };
  }

  const { organization, membership } = await getCurrentWorkspace();

  if (
    !["owner", "admin", "head_coach", "assistant_coach", "analyst"].includes(
      membership.role,
    )
  ) {
    return {
      ok: false,
      error: "Only coaches and analysts can create drills.",
    };
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("drills").insert({
    organization_id: organization.id,
    created_by: userId,
    sport_type: input.sportType,
    title,
    category: category || null,
    description: cleanString(input.description),
    objective: cleanString(input.objective),
    duration_min: parsePositiveInteger(input.durationMin),
    difficulty: difficulty || null,
    player_count_min: parsePositiveInteger(input.playerCountMin),
    player_count_max: parsePositiveInteger(input.playerCountMax),
    area_setup: cleanString(input.areaSetup),
    equipment: equipment || null,
    instructions: cleanString(input.instructions),
    coaching_points: cleanString(input.coachingPoints),
    tags: parseTags(input.tags),
    is_system_drill: false,
  });

  if (error) {
    return {
      ok: false,
      error: error.message,
    };
  }

  await supabase.from("audit_logs").insert({
    organization_id: organization.id,
    user_id: userId,
    action: "drill.created",
    entity_type: "drill",
  });

  revalidatePath("/drills");
  revalidatePath("/training-planner");

  return {
    ok: true,
  };
}

export async function createWearableConnection(
  input: CreateWearableConnectionInput,
): Promise<WorkspaceActionResult> {
  const { userId } = await auth();

  if (!userId) {
    return {
      ok: false,
      error: "You need to sign in again.",
    };
  }

  if (!isWearableProvider(input.provider)) {
    return {
      ok: false,
      error: "Invalid wearable provider.",
    };
  }

  const { organization, membership } = await getCurrentWorkspace();

  if (
    !["owner", "admin", "head_coach", "assistant_coach", "analyst"].includes(
      membership.role,
    )
  ) {
    return {
      ok: false,
      error: "Only coaches and analysts can manage wearable connections.",
    };
  }

  const supabase = createSupabaseAdminClient();
  const { data: athlete, error: athleteError } = await supabase
    .from("athletes")
    .select("id")
    .eq("id", input.athleteId)
    .eq("organization_id", organization.id)
    .maybeSingle();

  if (athleteError || !athlete) {
    return {
      ok: false,
      error: "Please select a valid athlete.",
    };
  }

  const { error } = await supabase.from("wearable_connections").upsert(
    {
      organization_id: organization.id,
      athlete_id: athlete.id,
      user_id: userId,
      provider: input.provider,
      provider_user_id: cleanString(input.providerUserId),
      scopes: parseTags(input.scopes),
      is_active: true,
      sync_error: null,
    },
    {
      onConflict: "athlete_id,provider",
    },
  );

  if (error) {
    return {
      ok: false,
      error: error.message,
    };
  }

  await supabase.from("audit_logs").insert({
    organization_id: organization.id,
    user_id: userId,
    action: "wearable_connection.upserted",
    entity_type: "wearable_connection",
  });

  revalidatePath("/wearables");

  return {
    ok: true,
  };
}

export async function createAiReport(
  input: CreateAiReportInput,
): Promise<WorkspaceActionResult> {
  const { userId } = await auth();

  if (!userId) {
    return {
      ok: false,
      error: "You need to sign in again.",
    };
  }

  const title = cleanString(input.title);

  if (!title) {
    return {
      ok: false,
      error: "Report title is required.",
    };
  }

  if (!isAiReportType(input.reportType)) {
    return {
      ok: false,
      error: "Invalid report type.",
    };
  }

  const { organization, membership } = await getCurrentWorkspace();

  if (
    !["owner", "admin", "head_coach", "assistant_coach", "analyst"].includes(
      membership.role,
    )
  ) {
    return {
      ok: false,
      error: "Only coaches and analysts can create AI reports.",
    };
  }

  const supabase = createSupabaseAdminClient();
  const teamId = cleanString(input.teamId);
  const athleteId = cleanString(input.athleteId);
  const sessionId = cleanString(input.sessionId);

  if (teamId) {
    const { data: team } = await supabase
      .from("teams")
      .select("id")
      .eq("id", teamId)
      .eq("organization_id", organization.id)
      .maybeSingle();

    if (!team) {
      return {
        ok: false,
        error: "Please select a valid team.",
      };
    }
  }

  if (athleteId) {
    const { data: athlete } = await supabase
      .from("athletes")
      .select("id")
      .eq("id", athleteId)
      .eq("organization_id", organization.id)
      .maybeSingle();

    if (!athlete) {
      return {
        ok: false,
        error: "Please select a valid athlete.",
      };
    }
  }

  if (sessionId) {
    const { data: session } = await supabase
      .from("sessions")
      .select("id")
      .eq("id", sessionId)
      .eq("organization_id", organization.id)
      .maybeSingle();

    if (!session) {
      return {
        ok: false,
        error: "Please select a valid session.",
      };
    }
  }

  const { error } = await supabase.from("ai_reports").insert({
    organization_id: organization.id,
    team_id: teamId,
    athlete_id: athleteId,
    session_id: sessionId,
    report_type: input.reportType,
    title,
    summary: cleanString(input.summary),
    model_provider: "manual",
    model_name: "manual-draft",
    prompt_version: "manual-v1",
    raw_input: {
      source: "manual",
    },
    raw_output: {},
    created_by: userId,
  });

  if (error) {
    return {
      ok: false,
      error: error.message,
    };
  }

  await supabase.from("audit_logs").insert({
    organization_id: organization.id,
    user_id: userId,
    action: "ai_report.created",
    entity_type: "ai_report",
  });

  revalidatePath("/ai-reports");

  return {
    ok: true,
  };
}

export async function createAthleteObservation(
  input: CreateAthleteObservationInput,
): Promise<WorkspaceActionResult> {
  const { userId } = await auth();

  if (!userId) {
    return {
      ok: false,
      error: "You need to sign in again.",
    };
  }

  const observation = cleanString(input.observation);

  if (!observation) {
    return {
      ok: false,
      error: "Observation is required.",
    };
  }

  const { organization, membership } = await getCurrentWorkspace();

  if (
    ![
      "owner",
      "admin",
      "head_coach",
      "assistant_coach",
      "analyst",
      "physiotherapist",
      "nutritionist",
    ].includes(membership.role)
  ) {
    return {
      ok: false,
      error: "Only staff can create athlete observations.",
    };
  }

  const supabase = createSupabaseAdminClient();
  const { data: athlete, error: athleteError } = await supabase
    .from("athletes")
    .select("id, team_id")
    .eq("id", input.athleteId)
    .eq("team_id", input.teamId)
    .eq("organization_id", organization.id)
    .maybeSingle();

  if (athleteError || !athlete) {
    return {
      ok: false,
      error: "Please select a valid athlete.",
    };
  }

  const observationCategory = cleanString(input.category);
  const observationSeverity = cleanString(input.severity);

  if (!isOptionalObservationCategory(observationCategory)) {
    return {
      ok: false,
      error: "Invalid observation category.",
    };
  }

  if (!isOptionalMemorySeverity(observationSeverity)) {
    return {
      ok: false,
      error: "Invalid severity value.",
    };
  }

  const { error } = await supabase.from("athlete_observations").insert({
    organization_id: organization.id,
    team_id: athlete.team_id,
    athlete_id: athlete.id,
    source: "manual",
    title: cleanString(input.title),
    category: observationCategory || null,
    severity: observationSeverity || null,
    observation,
    recommendation: cleanString(input.recommendation),
    is_resolved: false,
    created_by: userId,
  });

  if (error) {
    return {
      ok: false,
      error: error.message,
    };
  }

  revalidatePath("/team-memory");

  return {
    ok: true,
  };
}

export async function createTeamPattern(
  input: CreateTeamPatternInput,
): Promise<WorkspaceActionResult> {
  const title = cleanString(input.title);
  const patternType = cleanString(input.patternType);
  const patternSeverity = cleanString(input.severity);

  if (!title || !patternType) {
    return {
      ok: false,
      error: "Pattern type and title are required.",
    };
  }

  if (!isTeamPatternType(patternType)) {
    return {
      ok: false,
      error: "Invalid pattern type.",
    };
  }

  if (!isOptionalMemorySeverity(patternSeverity)) {
    return {
      ok: false,
      error: "Invalid severity value.",
    };
  }

  const { organization, membership } = await getCurrentWorkspace();

  if (
    !["owner", "admin", "head_coach", "assistant_coach", "analyst"].includes(
      membership.role,
    )
  ) {
    return {
      ok: false,
      error: "Only coaches and analysts can create team patterns.",
    };
  }

  const supabase = createSupabaseAdminClient();
  const { data: team } = await supabase
    .from("teams")
    .select("id")
    .eq("id", input.teamId)
    .eq("organization_id", organization.id)
    .maybeSingle();

  if (!team) {
    return {
      ok: false,
      error: "Please select a valid team.",
    };
  }

  const { error } = await supabase.from("team_patterns").insert({
    organization_id: organization.id,
    team_id: team.id,
    pattern_type: patternType,
    title,
    description: cleanString(input.description),
    severity: patternSeverity || null,
    occurrence_count: 1,
    status: "active",
    metadata: {},
  });

  if (error) {
    return {
      ok: false,
      error: error.message,
    };
  }

  revalidatePath("/team-memory");

  return {
    ok: true,
  };
}
