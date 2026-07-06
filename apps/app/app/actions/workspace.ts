// @ts-nocheck
"use server";

const auth = () => ({ userId: "temp" }); const currentUser = () => ({});
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { randomBytes } from "node:crypto";

import type {
  AiReportType,
  OrganizationRole,
  OrganizationType,
  SessionStatus,
  SessionType,
  SportType,
  WearableProvider,
} from "../../lib/db.types";
import {
  isDrillEquipmentValue,
  isOptionalDrillCategory,
  isOptionalDrillDifficulty,
  isOptionalMemorySeverity,
  isOptionalObservationCategory,
  isOptionalAbsenceReason,
  isOptionalBodyPainArea,
  isOptionalPersonalTrainingType,
  isOptionalSessionFocusArea,
  isTeamPatternType,
} from "../../lib/coach-vocabulary";
import {
  getAthleteMetadata,
  getLinkedAthleteForUser,
  isAthleteProfileComplete,
} from "../../lib/athlete-portal";
import {
  buildSessionAnalysisContext,
  generateSessionAnalysisFromContext,
  getSessionAnalysisPromptVersion,
  tryGenerateSessionAnalysisWithGemini,
} from "../../lib/ai/session-analysis";
import { getGeminiConfig, isGeminiConfigured } from "../../lib/ai/gemini";
import { syncOrganizationMemoryEmbeddings } from "../../lib/ai/team-memory/embeddings";
import {
  canManageStaffInvites,
  isAthleteRole,
  isCoachStaffRole,
  isInvitableOrganizationRole,
} from "../../lib/org-roles";
import { writeWorkspaceAuditLog } from "../../lib/audit-log";
import {
  formatAssistantAnswerForChat,
  runTeamMemoryQuery,
} from "../../lib/team-memory-assistant";
import { createDbAdminClient } from "../../lib/db-admin";
import {
  createActionDb,
  formatdbActionError,
} from "../../lib/db-admin";
import { getAppBaseUrl, buildAppUrl } from "../../lib/app-url";
import { sendInviteEmail } from "../../lib/email";
import {
  decryptStravaSecret,
  encryptStravaSecret,
  listStravaActivities,
  refreshStravaToken,
} from "../../lib/strava";
import { ACTIVE_ORGANIZATION_COOKIE, getCurrentWorkspace } from "../../lib/workspace";
import {
  getPrimaryTeamEntitlement,
  getTeamEntitlement,
  monthStartIso,
} from "../../lib/billing/entitlements";

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
      /** Present after generating an AI report. */
      reportId?: string;
      /** Optional user-facing status (e.g. rules fallback when Gemini fails). */
      message?: string;
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

export type CreatePersonalTrainingInput = {
  athleteId: string;
  title: string;
  trainingType?: string;
  startedAt?: string;
  durationMin?: string;
  distanceKm?: string;
  rpe?: string;
  notes?: string;
};

export type UpdatePersonalTrainingInput = CreatePersonalTrainingInput & {
  trainingId: string;
  coachReviewed?: boolean;
  coachNote?: string;
};

export type CreateStaffInviteInput = {
  role: OrganizationRole;
  email?: string;
  teamId?: string;
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

function parseDistanceKm(value: string | undefined) {
  const cleaned = cleanString(value);

  if (!cleaned) {
    return null;
  }

  const parsed = Number.parseFloat(cleaned);

  if (Number.isNaN(parsed) || parsed < 0) {
    return null;
  }

  return parsed;
}

async function canCurrentWorkspaceCreateOrganization() {
  const { organization } = await getCurrentWorkspace();
  const db = createDbAdminClient();

  const { data: team, error: teamError } = await db
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

  const { data: entitlement, error: entitlementError } = await db
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

  const db = createDbAdminClient();

  const { data: membership, error } = await db
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

  const db = createDbAdminClient();

  const { error } = await db
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

  const db = createDbAdminClient();
  const organizationSlug = `${slugify(organizationName)}-${crypto.randomUUID().slice(0, 8)}`;

  const { data: organization, error: organizationError } = await db
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

  const { error: membershipError } = await db
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

  const { data: team, error: teamError } = await db
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

  const { error: teamStaffError } = await db.from("team_staff").insert({
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

  const { error: entitlementError } = await db
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

  await db.from("audit_logs").insert([
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

  const db = createDbAdminClient();

  const { data: team, error: teamError } = await db
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

  const { error: teamStaffError } = await db.from("team_staff").insert({
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

  const { error: entitlementError } = await db
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

  await db.from("audit_logs").insert({
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

  const db = createDbAdminClient();

  const { error } = await db
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

  await db.from("audit_logs").insert({
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

  const db = createDbAdminClient();

  const { count: teamCount, error: teamCountError } = await db
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

  const { count: athleteCount, error: athleteCountError } = await db
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

  const { error } = await db
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

  await db.from("audit_logs").insert({
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

  const db = createDbAdminClient();

  const { data: team, error: teamError } = await db
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

  const entitlement = await getTeamEntitlement(team.id);
  const { count: currentAthleteCount, error: athleteCountError } = await db
    .from("athletes")
    .select("id", { count: "exact", head: true })
    .eq("team_id", team.id);

  if (athleteCountError) {
    return {
      ok: false,
      error: athleteCountError.message,
    };
  }

  if ((currentAthleteCount ?? 0) >= entitlement.max_team_members) {
    return {
      ok: false,
      error: `This team has reached its ${entitlement.max_team_members}-athlete plan limit.`,
    };
  }

  const lastName = cleanString(input.lastName);
  const { error } = await db.from("athletes").insert({
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

  await db.from("audit_logs").insert({
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

  const db = createDbAdminClient();

  const { data: team, error: teamError } = await db
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
  const { error } = await db
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

  await db.from("audit_logs").insert({
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

  const db = createDbAdminClient();

  const { error } = await db
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

  await db.from("audit_logs").insert({
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

  const db = createDbAdminClient();

  const { data: athlete, error: athleteError } = await db
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

  await db
    .from("athlete_invites")
    .delete()
    .eq("athlete_id", athlete.id)
    .is("accepted_at", null);

  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(
    Date.now() + 14 * 24 * 60 * 60 * 1000,
  ).toISOString();

  const { error: insertError } = await db.from("athlete_invites").insert({
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

  await db.from("audit_logs").insert({
    organization_id: organization.id,
    user_id: userId,
    action: "athlete.invite_created",
    entity_type: "athlete",
    entity_id: athlete.id,
  });

  revalidatePath("/athletes");

  const claimUrl = buildAppUrl(
    await getAppBaseUrl(),
    `/invite/athlete/${token}`,
  );
  const athleteEmail = cleanString(athlete.email ?? undefined);
  const emailSent = athleteEmail
    ? await sendInviteEmail({
        to: athleteEmail,
        organizationName: organization.name,
        claimUrl,
        kind: "athlete",
      })
    : false;

  return {
    ok: true,
    claimUrl,
    message: emailSent
      ? "Invite email sent."
      : athleteEmail
        ? "Invite link created. Email delivery is not configured or failed; copy the link manually."
        : "Invite link created. Add an athlete email to send invitations automatically.",
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

  const db = createDbAdminClient();

  const { data: invite, error: inviteError } = await db
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

  const { data: athlete, error: athleteError } = await db
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

  const { data: existingClaim } = await db
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

  const { data: existingMember } = await db
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

  const { data: updatedAthlete, error: updateAthleteError } = await db
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

  const { error: inviteUpdateError } = await db
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
        await db
          .from("organization_members")
          .update({ role: "athlete", is_active: true })
          .eq("id", existingMember.id)
      ).error
    : (
        await db.from("organization_members").insert({
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

  await db.from("audit_logs").insert({
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

export async function createStaffInvite(
  input: CreateStaffInviteInput,
): Promise<WorkspaceActionResult> {
  const { userId } = await auth();

  if (!userId) {
    return {
      ok: false,
      error: "You need to sign in again.",
    };
  }

  const { organization, membership } = await getCurrentWorkspace();

  if (!canManageStaffInvites(membership.role)) {
    return {
      ok: false,
      error: "Only owners and admins can invite staff.",
    };
  }

  if (!isInvitableOrganizationRole(input.role)) {
    return {
      ok: false,
      error: "Invalid staff role for an invite.",
    };
  }

  const email = cleanString(input.email);
  if (email && !isValidEmail(email)) {
    return {
      ok: false,
      error: "Enter a valid email address or leave it empty.",
    };
  }

  const db = createDbAdminClient();
  const teamId = cleanString(input.teamId);

  if (teamId) {
    const { data: team } = await db
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

  if (email) {
    const normalizedEmail = email.toLowerCase();
    const { data: existingUser } = await db
      .from("users")
      .select("id")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (existingUser) {
      const { data: existingMember } = await db
        .from("organization_members")
        .select("id, role")
        .eq("organization_id", organization.id)
        .eq("user_id", existingUser.id)
        .eq("is_active", true)
        .maybeSingle();

      if (existingMember && isCoachStaffRole(existingMember.role)) {
        return {
          ok: false,
          error: "This person is already a staff member of the organization.",
        };
      }
    }
  }

  if (email) {
    await db
      .from("organization_staff_invites")
      .delete()
      .eq("organization_id", organization.id)
      .is("accepted_at", null)
      .eq("email", email.toLowerCase());
  }

  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(
    Date.now() + 14 * 24 * 60 * 60 * 1000,
  ).toISOString();

  const { error: insertError } = await db
    .from("organization_staff_invites")
    .insert({
      organization_id: organization.id,
      team_id: teamId,
      email: email ? email.toLowerCase() : null,
      role: input.role,
      token,
      invited_by: userId,
      expires_at: expiresAt,
    });

  if (insertError) {
    const missingTable = insertError.message.includes(
      "organization_staff_invites",
    );

    return {
      ok: false,
      error: missingTable
        ? "Staff invites table is missing. Run docs/db/010_organization_staff_invites.sql in db, then retry."
        : insertError.message,
    };
  }

  await db.from("audit_logs").insert({
    organization_id: organization.id,
    user_id: userId,
    action: "staff.invite_created",
    entity_type: "organization_staff_invite",
  });

  revalidatePath("/settings/staff");

  const claimUrl = buildAppUrl(
    await getAppBaseUrl(),
    `/invite/staff/${token}`,
  );
  const emailSent = email
    ? await sendInviteEmail({
        to: email.toLowerCase(),
        organizationName: organization.name,
        claimUrl,
        kind: "staff",
      })
    : false;

  return {
    ok: true,
    claimUrl,
    message: emailSent
      ? "Invite email sent."
      : email
        ? "Invite link created. Email delivery is not configured or failed; copy the link manually."
        : "Invite link created. Add an email to send invitations automatically.",
  };
}

export async function claimStaffInvite(
  token: string,
): Promise<WorkspaceActionResult> {
  const { userId } = await auth();

  if (!userId) {
    return {
      ok: false,
      error: "You need to sign in before accepting this invite.",
    };
  }

  const trimmed = token?.trim();
  if (!trimmed) {
    return {
      ok: false,
      error: "This invite link is invalid.",
    };
  }

  const db = createDbAdminClient();

  const { data: invite, error: inviteError } = await db
    .from("organization_staff_invites")
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
      error: "This invite has expired. Ask for a new staff invite link.",
    };
  }

  const clerkUser = await currentUser();
  const primaryEmail =
    clerkUser?.primaryEmailAddress?.emailAddress?.toLowerCase() ?? null;

  if (invite.email?.trim()) {
    const inviteEmail = invite.email.trim().toLowerCase();
    if (primaryEmail && primaryEmail !== inviteEmail) {
      return {
        ok: false,
        error:
          "Sign in with the email address this invite was sent to, or ask an admin to resend it.",
      };
    }
  }

  const { data: existingAthlete } = await db
    .from("athletes")
    .select("id")
    .eq("organization_id", invite.organization_id)
    .eq("user_id", userId)
    .maybeSingle();

  if (existingAthlete) {
    return {
      ok: false,
      error:
        "Your account is linked as an athlete in this organization. Use a separate account for staff access.",
    };
  }

  const { data: existingMember } = await db
    .from("organization_members")
    .select("id, role, is_active")
    .eq("organization_id", invite.organization_id)
    .eq("user_id", userId)
    .maybeSingle();

  if (existingMember?.is_active && isCoachStaffRole(existingMember.role)) {
    return {
      ok: false,
      error: "You are already a staff member of this organization.",
    };
  }

  const { error: memberError } = existingMember
    ? await db
        .from("organization_members")
        .update({
          role: invite.role,
          is_active: true,
          invited_by: invite.invited_by,
        })
        .eq("id", existingMember.id)
    : await db.from("organization_members").insert({
        organization_id: invite.organization_id,
        user_id: userId,
        role: invite.role,
        is_active: true,
        invited_by: invite.invited_by,
      });

  if (memberError) {
    return {
      ok: false,
      error: memberError.message,
    };
  }

  if (invite.team_id) {
    await db.from("team_staff").upsert(
      {
        team_id: invite.team_id,
        user_id: userId,
        role: invite.role,
        assigned_by: invite.invited_by,
      },
      { onConflict: "team_id,user_id,role", ignoreDuplicates: true },
    );
  }

  const { error: inviteUpdateError } = await db
    .from("organization_staff_invites")
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

  const cookieStore = await cookies();
  cookieStore.set(ACTIVE_ORGANIZATION_COOKIE, invite.organization_id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });

  await db.from("audit_logs").insert({
    organization_id: invite.organization_id,
    user_id: userId,
    action: "staff.invite_claimed",
    entity_type: "organization_staff_invite",
    entity_id: invite.id,
  });

  revalidatePath("/settings/staff");
  revalidatePath("/dashboard");

  return {
    ok: true,
    redirectTo: "/dashboard",
  };
}

export async function revokeStaffInvite(
  inviteId: string,
): Promise<WorkspaceActionResult> {
  const { userId } = await auth();

  if (!userId) {
    return {
      ok: false,
      error: "You need to sign in again.",
    };
  }

  const { organization, membership } = await getCurrentWorkspace();

  if (!canManageStaffInvites(membership.role)) {
    return {
      ok: false,
      error: "Only owners and admins can revoke invites.",
    };
  }

  const db = createDbAdminClient();

  const { error } = await db
    .from("organization_staff_invites")
    .delete()
    .eq("id", inviteId)
    .eq("organization_id", organization.id)
    .is("accepted_at", null);

  if (error) {
    return {
      ok: false,
      error: error.message,
    };
  }

  revalidatePath("/settings/staff");

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
  const db = createDbAdminClient();
  const existingMeta = getAthleteMetadata(athlete);

  const { error } = await db
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

  await db.from("audit_logs").insert({
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

  const db = createDbAdminClient();

  const { data: team, error: teamError } = await db
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
    const { data: athletes, error: athletesError } = await db
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

  const { data: session, error: sessionError } = await db
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
    const { error: attendanceError } = await db
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

  await db.from("audit_logs").insert({
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

  const db = createDbAdminClient();

  const [{ data: session }, { data: team, error: teamError }] =
    await Promise.all([
      db
        .from("sessions")
        .select("id, team_id")
        .eq("id", input.sessionId)
        .eq("organization_id", organization.id)
        .maybeSingle(),
      db
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

  const { error } = await db
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
    const { error: attendanceDeleteError } = await db
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

  await db.from("audit_logs").insert({
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

  const db = createDbAdminClient();

  const { data: session, error: sessionError } = await db
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

  const { error } = await db
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

  await db.from("audit_logs").insert({
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

  const db = createDbAdminClient();

  const { data: session } = await db
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

  const { error } = await db
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

  await db.from("audit_logs").insert({
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

  const db = createDbAdminClient();

  const { data: session, error: sessionError } = await db
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
    const { data: athletes, error: athletesError } = await db
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

  const { error: deleteError } = await db
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

    const { error: insertError } = await db
      .from("session_attendance")
      .insert(normalizedEntries);

    if (insertError) {
      return {
        ok: false,
        error: insertError.message,
      };
    }
  }

  await db.from("audit_logs").insert({
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

  const db = createDbAdminClient();

  const { data: session, error: sessionError } = await db
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

  const { error: deleteError } = await db
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
    const { error: insertError } = await db.from("training_blocks").insert(
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

  await db.from("audit_logs").insert({
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
  const db = await createActionDb();

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
    const { data, error: athleteError } = await db
      .from("athletes")
      .select("id, team_id")
      .eq("id", input.athleteId)
      .eq("organization_id", organization.id)
      .maybeSingle();

    if (athleteError || !data) {
      return {
        ok: false,
        error: athleteError
          ? formatdbActionError(athleteError.message)
          : "Please select a valid athlete.",
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

  const { error } = await db.from("wellness_checkins").upsert(
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
    },
    {
      onConflict: "athlete_id,checkin_date",
    },
  );

  if (error) {
    const missingColumn =
      error.message.includes("created_by") ||
      error.message.includes("fatigue") ||
      error.message.includes("muscle_soreness") ||
      error.message.includes("schema cache");

    return {
      ok: false,
      error: formatdbActionError(error.message, {
        schemaAlignHint: missingColumn
          ? "Database schema is out of date. Run docs/db/009_daily_data_schema_align.sql in the db SQL Editor, then retry."
          : undefined,
      }),
    };
  }

  await writeWorkspaceAuditLog({
    organizationId: organization.id,
    userId,
    role: membership.role,
    action: "readiness_checkin.upserted",
    entityType: "wellness_checkin",
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
  const db = await createActionDb();

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
    const { data, error: athleteError } = await db
      .from("athletes")
      .select("id, team_id")
      .eq("id", input.athleteId)
      .eq("organization_id", organization.id)
      .maybeSingle();

    if (athleteError || !data) {
      return {
        ok: false,
        error: athleteError
          ? formatdbActionError(athleteError.message)
          : "Please select a valid athlete.",
      };
    }
    athlete = data;
  } else {
    return {
      ok: false,
      error: "You do not have permission to manage nutrition logs.",
    };
  }

  const { error } = await db.from("nutrition_logs").upsert(
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
    },
    {
      onConflict: "athlete_id,log_date",
    },
  );

  if (error) {
    const missingColumn =
      error.message.includes("created_by") ||
      error.message.includes("hydration_score") ||
      error.message.includes("schema cache");

    return {
      ok: false,
      error: formatdbActionError(error.message, {
        schemaAlignHint: missingColumn
          ? "Database schema is out of date. Run docs/db/009_daily_data_schema_align.sql in the db SQL Editor, then retry."
          : undefined,
      }),
    };
  }

  await writeWorkspaceAuditLog({
    organizationId: organization.id,
    userId,
    role: membership.role,
    action: "nutrition_log.upserted",
    entityType: "nutrition_log",
  });

  revalidatePath("/nutrition");
  revalidatePath("/athlete/nutrition");
  revalidatePath("/athlete/home");
  revalidatePath("/dashboard");

  return {
    ok: true,
  };
}

async function resolveAthleteForPersonalTraining(
  athleteId: string,
  organizationId: string,
  membership: Awaited<ReturnType<typeof getCurrentWorkspace>>["membership"],
  userId: string,
): Promise<
  | { ok: true; athlete: { id: string; team_id: string } }
  | { ok: false; error: string }
> {
  if (isAthleteRole(membership.role)) {
    const linked = await getLinkedAthleteForUser(userId, organizationId);

    if (!linked || linked.id !== athleteId) {
      return {
        ok: false,
        error: "You can only log personal training for your own profile.",
      };
    }

    return { ok: true, athlete: { id: linked.id, team_id: linked.team_id } };
  }

  if (
    !["owner", "admin", "head_coach", "assistant_coach", "analyst"].includes(
      membership.role,
    )
  ) {
    return {
      ok: false,
      error: "You do not have permission to manage personal training logs.",
    };
  }

  const db = await createActionDb();
  const { data, error } = await db
    .from("athletes")
    .select("id, team_id")
    .eq("id", athleteId)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (error || !data) {
    return {
      ok: false,
      error: error
        ? formatdbActionError(error.message)
        : "Please select a valid athlete.",
    };
  }

  return { ok: true, athlete: data };
}

export async function createPersonalTraining(
  input: CreatePersonalTrainingInput,
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
      error: "Training title is required.",
    };
  }

  const trainingType = cleanString(input.trainingType);

  if (!isOptionalPersonalTrainingType(trainingType ?? "")) {
    return {
      ok: false,
      error: "Invalid training type.",
    };
  }

  const rpeResult = parseOptionalRpe(input.rpe);

  if (!rpeResult.ok) {
    return {
      ok: false,
      error: rpeResult.error,
    };
  }

  const { organization, membership } = await getCurrentWorkspace();
  const athleteResult = await resolveAthleteForPersonalTraining(
    input.athleteId,
    organization.id,
    membership,
    userId,
  );

  if (!athleteResult.ok) {
    return athleteResult;
  }

  const db = await createActionDb();
  const startedAt = parseDateTime(input.startedAt) ?? new Date().toISOString();

  const { error } = await db.from("personal_trainings").insert({
    organization_id: organization.id,
    team_id: athleteResult.athlete.team_id,
    athlete_id: athleteResult.athlete.id,
    source: "manual",
    title,
    training_type: trainingType,
    started_at: startedAt,
    duration_min: parsePositiveInteger(input.durationMin),
    distance_km: parseDistanceKm(input.distanceKm),
    rpe: rpeResult.value,
    notes: cleanString(input.notes),
    coach_reviewed: false,
  });

  if (error) {
    return {
      ok: false,
      error: formatdbActionError(error.message),
    };
  }

  await writeWorkspaceAuditLog({
    organizationId: organization.id,
    userId,
    role: membership.role,
    action: "personal_training.created",
    entityType: "personal_training",
  });

  revalidatePath("/personal-training");
  revalidatePath("/athlete/training");
  revalidatePath("/athlete/home");
  revalidatePath("/load-recovery");
  revalidatePath("/dashboard");

  return {
    ok: true,
  };
}

export async function updatePersonalTraining(
  input: UpdatePersonalTrainingInput,
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
      error: "Training title is required.",
    };
  }

  const trainingType = cleanString(input.trainingType);

  if (!isOptionalPersonalTrainingType(trainingType ?? "")) {
    return {
      ok: false,
      error: "Invalid training type.",
    };
  }

  const rpeResult = parseOptionalRpe(input.rpe);

  if (!rpeResult.ok) {
    return {
      ok: false,
      error: rpeResult.error,
    };
  }

  const { organization, membership } = await getCurrentWorkspace();
  const db = createDbAdminClient();

  const { data: existing } = await db
    .from("personal_trainings")
    .select("id, athlete_id")
    .eq("id", input.trainingId)
    .eq("organization_id", organization.id)
    .maybeSingle();

  if (!existing) {
    return {
      ok: false,
      error: "Personal training entry could not be found.",
    };
  }

  const athleteResult = await resolveAthleteForPersonalTraining(
    input.athleteId,
    organization.id,
    membership,
    userId,
  );

  if (!athleteResult.ok) {
    return athleteResult;
  }

  if (
    isAthleteRole(membership.role) &&
    existing.athlete_id !== athleteResult.athlete.id
  ) {
    return {
      ok: false,
      error: "You can only update your own personal training logs.",
    };
  }

  const coachCanReview = [
    "owner",
    "admin",
    "head_coach",
    "assistant_coach",
    "analyst",
  ].includes(membership.role);

  const { error } = await db
    .from("personal_trainings")
    .update({
      team_id: athleteResult.athlete.team_id,
      athlete_id: athleteResult.athlete.id,
      title,
      training_type: trainingType,
      started_at: parseDateTime(input.startedAt),
      duration_min: parsePositiveInteger(input.durationMin),
      distance_km: parseDistanceKm(input.distanceKm),
      rpe: rpeResult.value,
      notes: cleanString(input.notes),
      coach_reviewed: coachCanReview ? input.coachReviewed ?? false : false,
      coach_note: coachCanReview ? cleanString(input.coachNote) : null,
    })
    .eq("id", input.trainingId)
    .eq("organization_id", organization.id);

  if (error) {
    return {
      ok: false,
      error: error.message,
    };
  }

  await db.from("audit_logs").insert({
    organization_id: organization.id,
    user_id: userId,
    action: "personal_training.updated",
    entity_type: "personal_training",
    entity_id: input.trainingId,
  });

  revalidatePath("/personal-training");
  revalidatePath("/athlete/training");
  revalidatePath("/load-recovery");

  return {
    ok: true,
  };
}

export async function deletePersonalTraining(
  trainingId: string,
): Promise<WorkspaceActionResult> {
  const { userId } = await auth();

  if (!userId) {
    return {
      ok: false,
      error: "You need to sign in again.",
    };
  }

  const { organization, membership } = await getCurrentWorkspace();
  const db = createDbAdminClient();

  const { data: existing } = await db
    .from("personal_trainings")
    .select("id, athlete_id")
    .eq("id", trainingId)
    .eq("organization_id", organization.id)
    .maybeSingle();

  if (!existing) {
    return {
      ok: false,
      error: "Personal training entry could not be found.",
    };
  }

  if (isAthleteRole(membership.role)) {
    const linked = await getLinkedAthleteForUser(userId, organization.id);

    if (!linked || linked.id !== existing.athlete_id) {
      return {
        ok: false,
        error: "You can only delete your own personal training logs.",
      };
    }
  } else if (
    !["owner", "admin", "head_coach", "assistant_coach"].includes(
      membership.role,
    )
  ) {
    return {
      ok: false,
      error: "You do not have permission to delete this entry.",
    };
  }

  const { error } = await db
    .from("personal_trainings")
    .delete()
    .eq("id", trainingId)
    .eq("organization_id", organization.id);

  if (error) {
    return {
      ok: false,
      error: error.message,
    };
  }

  await db.from("audit_logs").insert({
    organization_id: organization.id,
    user_id: userId,
    action: "personal_training.deleted",
    entity_type: "personal_training",
    entity_id: trainingId,
  });

  revalidatePath("/personal-training");
  revalidatePath("/athlete/training");
  revalidatePath("/load-recovery");

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

  const db = createDbAdminClient();
  const { error } = await db.from("drills").insert({
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

  await db.from("audit_logs").insert({
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

  const db = createDbAdminClient();
  const { data: athlete, error: athleteError } = await db
    .from("athletes")
    .select("id, team_id")
    .eq("id", input.athleteId)
    .eq("organization_id", organization.id)
    .maybeSingle();

  if (athleteError || !athlete) {
    return {
      ok: false,
      error: "Please select a valid athlete.",
    };
  }

  const entitlement = await getTeamEntitlement(athlete.team_id);

  if (!entitlement.wearable_enabled) {
    return {
      ok: false,
      error: "Wearables are available on Pro and Pro Plus team plans.",
    };
  }

  const { error } = await db.from("wearable_connections").upsert(
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

  await db.from("audit_logs").insert({
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

export async function syncStravaConnection(
  connectionId: string,
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
    !["owner", "admin", "head_coach", "assistant_coach", "analyst"].includes(
      membership.role,
    )
  ) {
    return {
      ok: false,
      error: "Only coaches and analysts can sync wearable connections.",
    };
  }

  const db = createDbAdminClient();
  const { data: connection, error: connectionError } = await db
    .from("wearable_connections")
    .select("*")
    .eq("id", connectionId)
    .eq("organization_id", organization.id)
    .eq("provider", "strava")
    .maybeSingle();

  if (connectionError || !connection) {
    return {
      ok: false,
      error: "Strava connection could not be found.",
    };
  }

  const { data: athlete } = await db
    .from("athletes")
    .select("team_id")
    .eq("id", connection.athlete_id)
    .eq("organization_id", organization.id)
    .maybeSingle();

  if (!athlete) {
    return {
      ok: false,
      error: "Athlete for this Strava connection could not be found.",
    };
  }

  const entitlement = await getTeamEntitlement(athlete.team_id);

  if (!entitlement.wearable_enabled) {
    return {
      ok: false,
      error: "Wearables are available on Pro and Pro Plus team plans.",
    };
  }

  if (!connection.access_token_encrypted || !connection.refresh_token_encrypted) {
    return {
      ok: false,
      error: "This Strava connection is missing OAuth tokens.",
    };
  }

  let accessToken = decryptStravaSecret(connection.access_token_encrypted);
  let refreshToken = decryptStravaSecret(connection.refresh_token_encrypted);
  const expiresAt = connection.token_expires_at
    ? new Date(connection.token_expires_at).getTime()
    : 0;

  if (expiresAt <= Date.now() + 60_000) {
    const refreshed = await refreshStravaToken(refreshToken);
    accessToken = refreshed.access_token;
    refreshToken = refreshed.refresh_token;

    await db
      .from("wearable_connections")
      .update({
        access_token_encrypted: encryptStravaSecret(accessToken),
        refresh_token_encrypted: encryptStravaSecret(refreshToken),
        token_expires_at: new Date(refreshed.expires_at * 1000).toISOString(),
      })
      .eq("id", connection.id);
  }

  const activities = await listStravaActivities(accessToken);
  const rows = activities.map((activity) => ({
    organization_id: organization.id,
    team_id: athlete.team_id,
    athlete_id: connection.athlete_id,
    provider: "strava" as const,
    provider_activity_id: String(activity.id),
    activity_type: activity.sport_type ?? activity.type ?? null,
    title: activity.name,
    started_at: activity.start_date ?? null,
    duration_sec: activity.elapsed_time ?? null,
    distance_km:
      activity.distance != null ? Number((activity.distance / 1000).toFixed(2)) : null,
    avg_heart_rate:
      activity.average_heartrate != null
        ? Math.round(activity.average_heartrate)
        : null,
    max_heart_rate:
      activity.max_heartrate != null ? Math.round(activity.max_heartrate) : null,
    calories: null,
    elevation_gain_m: activity.total_elevation_gain ?? null,
    raw_payload: activity,
  }));

  if (rows.length > 0) {
    const { error: upsertError } = await db
      .from("wearable_activities")
      .upsert(rows, { onConflict: "provider,provider_activity_id" });

    if (upsertError) {
      return {
        ok: false,
        error: upsertError.message,
      };
    }
  }

  await db
    .from("wearable_connections")
    .update({
      last_synced_at: new Date().toISOString(),
      sync_error: null,
    })
    .eq("id", connection.id);

  revalidatePath("/wearables");

  return {
    ok: true,
    message: `Synced ${rows.length} Strava activities.`,
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

  const db = createDbAdminClient();
  const teamId = cleanString(input.teamId);
  const athleteId = cleanString(input.athleteId);
  const sessionId = cleanString(input.sessionId);
  let targetTeamId = teamId;

  if (teamId) {
    const { data: team } = await db
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
    const { data: athlete } = await db
      .from("athletes")
      .select("id, team_id")
      .eq("id", athleteId)
      .eq("organization_id", organization.id)
      .maybeSingle();

    if (!athlete) {
      return {
        ok: false,
        error: "Please select a valid athlete.",
      };
    }

    targetTeamId ||= athlete.team_id;
  }

  if (sessionId) {
    const { data: session } = await db
      .from("sessions")
      .select("id, team_id")
      .eq("id", sessionId)
      .eq("organization_id", organization.id)
      .maybeSingle();

    if (!session) {
      return {
        ok: false,
        error: "Please select a valid session.",
      };
    }

    targetTeamId ||= session.team_id;
  }

  const entitlement = targetTeamId
    ? await getTeamEntitlement(targetTeamId)
    : await getPrimaryTeamEntitlement(organization.id);

  if (!entitlement.ai_reports_enabled) {
    return {
      ok: false,
      error: "AI reports are available on Pro and Pro Plus team plans.",
    };
  }

  const { count: monthlyReportCount, error: monthlyReportCountError } =
    await db
      .from("ai_reports")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", organization.id)
      .gte("created_at", monthStartIso());

  if (monthlyReportCountError) {
    return {
      ok: false,
      error: monthlyReportCountError.message,
    };
  }

  if ((monthlyReportCount ?? 0) >= entitlement.monthly_ai_report_limit) {
    return {
      ok: false,
      error: `Monthly AI report limit reached for this plan (${entitlement.monthly_ai_report_limit}).`,
    };
  }

  const { error } = await db.from("ai_reports").insert({
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

  await db.from("audit_logs").insert({
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

export async function generateSessionAiReport(
  sessionId: string,
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
    !["owner", "admin", "head_coach", "assistant_coach", "analyst"].includes(
      membership.role,
    )
  ) {
    return {
      ok: false,
      error: "Only coaches and analysts can generate AI reports.",
    };
  }

  const db = createDbAdminClient();

  const { data: session, error: sessionError } = await db
    .from("sessions")
    .select("*")
    .eq("id", sessionId)
    .eq("organization_id", organization.id)
    .maybeSingle();

  if (sessionError || !session) {
    return {
      ok: false,
      error: "Session could not be found.",
    };
  }

  const entitlement = await getTeamEntitlement(session.team_id);

  if (!entitlement.ai_reports_enabled) {
    return {
      ok: false,
      error: "AI reports are available on Pro and Pro Plus team plans.",
    };
  }

  const { count: monthlyReportCount, error: monthlyReportCountError } =
    await db
      .from("ai_reports")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", organization.id)
      .gte("created_at", monthStartIso());

  if (monthlyReportCountError) {
    return {
      ok: false,
      error: monthlyReportCountError.message,
    };
  }

  if ((monthlyReportCount ?? 0) >= entitlement.monthly_ai_report_limit) {
    return {
      ok: false,
      error: `Monthly AI report limit reached for this plan (${entitlement.monthly_ai_report_limit}).`,
    };
  }

  const [
    { data: team, error: teamError },
    { data: athletes, error: athletesError },
    { data: attendance, error: attendanceError },
    { data: trainingBlocks, error: blocksError },
  ] = await Promise.all([
    db
      .from("teams")
      .select("id, name, sport_type")
      .eq("id", session.team_id)
      .eq("organization_id", organization.id)
      .maybeSingle(),
    db
      .from("athletes")
      .select("id, first_name, last_name, number, team_id")
      .eq("organization_id", organization.id)
      .eq("team_id", session.team_id),
    db.from("session_attendance").select("*").eq("session_id", session.id),
    db
      .from("training_blocks")
      .select("*")
      .eq("session_id", session.id)
      .order("order_index", { ascending: true }),
  ]);

  if (teamError || !team) {
    return {
      ok: false,
      error: "Team for this session could not be loaded.",
    };
  }

  if (athletesError) {
    return {
      ok: false,
      error: athletesError.message,
    };
  }

  if (attendanceError) {
    return {
      ok: false,
      error: attendanceError.message,
    };
  }

  if (blocksError) {
    return {
      ok: false,
      error: blocksError.message,
    };
  }

  const athleteIds = (athletes ?? []).map((athlete) => athlete.id);
  const sessionDate = session.scheduled_at
    ? new Date(session.scheduled_at)
    : new Date();
  const checkinSince = new Date(sessionDate);
  checkinSince.setDate(checkinSince.getDate() - 7);
  const sinceDate = checkinSince.toISOString().slice(0, 10);

  const { data: checkins, error: checkinsError } =
    athleteIds.length > 0
      ? await db
          .from("wellness_checkins")
          .select("*")
          .in("athlete_id", athleteIds)
          .gte("checkin_date", sinceDate)
          .order("checkin_date", { ascending: false })
      : { data: [], error: null };

  if (checkinsError) {
    return {
      ok: false,
      error: checkinsError.message,
    };
  }

  const analysisContext = buildSessionAnalysisContext({
    organizationName: organization.name,
    team,
    session,
    athletes: athletes ?? [],
    attendance: attendance ?? [],
    trainingBlocks: trainingBlocks ?? [],
    checkins: checkins ?? [],
  });

  const llmAnalysis = await tryGenerateSessionAnalysisWithGemini(analysisContext);
  const analysis =
    llmAnalysis ?? generateSessionAnalysisFromContext(analysisContext);
  const usedLlm = Boolean(llmAnalysis);
  const geminiConfig = getGeminiConfig();
  const statusMessage = usedLlm
    ? `Analysis generated with Gemini (${geminiConfig.model}).`
    : isGeminiConfigured()
      ? "Report saved with rule-based analysis. Gemini did not return a valid response â€” verify your API key and model in .env.local."
      : "Report saved with rule-based analysis. Add GEMINI_API_KEY for LLM-powered session reports.";

  const { data: inserted, error: insertError } = await db
    .from("ai_reports")
    .insert({
      organization_id: organization.id,
      team_id: session.team_id,
      session_id: session.id,
      report_type: "session_analysis",
      title: analysis.title,
      summary: analysis.summary,
      confidence_score: analysis.confidence_score,
      model_provider: usedLlm ? "gemini" : "rules",
      model_name: usedLlm ? geminiConfig.model : "doctor-panda-rules-v1",
      prompt_version: getSessionAnalysisPromptVersion(),
      tactical_observations: analysis.tactical_observations,
      athlete_observations: analysis.athlete_observations,
      load_observations: analysis.load_observations,
      risk_alerts: analysis.risk_alerts,
      recommended_drills: analysis.recommended_drills,
      next_training_plan: analysis.next_training_plan,
      raw_input: {
        source: "session_analysis",
        session_id: session.id,
        context: analysisContext,
      },
      raw_output: analysis,
      created_by: userId,
    })
    .select("id")
    .single();

  if (insertError || !inserted) {
    return {
      ok: false,
      error: insertError?.message ?? "Could not save the AI report.",
    };
  }

  await db.from("audit_logs").insert({
    organization_id: organization.id,
    user_id: userId,
    action: "ai_report.generated",
    entity_type: "ai_report",
    entity_id: inserted.id,
  });

  revalidatePath("/ai-reports");
  revalidatePath(`/ai-reports/${inserted.id}`);
  revalidatePath(`/sessions/${sessionId}`);

  return {
    ok: true,
    reportId: inserted.id,
    message: statusMessage,
  };
}

export async function deleteAiReport(
  reportId: string,
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
    !["owner", "admin", "head_coach", "assistant_coach", "analyst"].includes(
      membership.role,
    )
  ) {
    return {
      ok: false,
      error: "Only coaches and analysts can delete AI reports.",
    };
  }

  const db = createDbAdminClient();

  const { data: report } = await db
    .from("ai_reports")
    .select("id, session_id")
    .eq("id", reportId)
    .eq("organization_id", organization.id)
    .maybeSingle();

  if (!report) {
    return {
      ok: false,
      error: "Report could not be found.",
    };
  }

  const { error } = await db
    .from("ai_reports")
    .delete()
    .eq("id", reportId)
    .eq("organization_id", organization.id);

  if (error) {
    return {
      ok: false,
      error: error.message,
    };
  }

  await writeWorkspaceAuditLog({
    organizationId: organization.id,
    userId,
    role: membership.role,
    action: "ai_report.deleted",
    entityType: "ai_report",
    entityId: reportId,
  });

  revalidatePath("/ai-reports");
  revalidatePath(`/ai-reports/${reportId}`);
  if (report.session_id) {
    revalidatePath(`/sessions/${report.session_id}`);
  }

  return {
    ok: true,
    redirectTo: "/ai-reports",
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

  const db = createDbAdminClient();
  const { data: athlete, error: athleteError } = await db
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

  const entitlement = await getTeamEntitlement(athlete.team_id);

  if (!entitlement.team_memory_enabled) {
    return {
      ok: false,
      error: "Team Memory is available on Pro and Pro Plus team plans.",
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

  const { error } = await db.from("athlete_observations").insert({
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

  void syncOrganizationMemoryEmbeddings(
    db,
    organization.id,
    userId,
  ).catch(() => undefined);

  revalidatePath("/team-memory");

  return {
    ok: true,
  };
}

export async function createTeamPattern(
  input: CreateTeamPatternInput,
): Promise<WorkspaceActionResult> {
  const { userId } = await auth();

  if (!userId) {
    return {
      ok: false,
      error: "You need to sign in again.",
    };
  }

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

  const db = createDbAdminClient();
  const { data: team } = await db
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

  const entitlement = await getTeamEntitlement(team.id);

  if (!entitlement.team_memory_enabled) {
    return {
      ok: false,
      error: "Team Memory is available on Pro and Pro Plus team plans.",
    };
  }

  const { error } = await db.from("team_patterns").insert({
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

  void syncOrganizationMemoryEmbeddings(
    db,
    organization.id,
    userId,
  ).catch(() => undefined);

  revalidatePath("/team-memory");

  return {
    ok: true,
  };
}

export type SendTeamMemoryMessageInput = {
  threadId?: string;
  message: string;
  teamId?: string;
  athleteId?: string;
};

export async function sendTeamMemoryMessage(
  input: SendTeamMemoryMessageInput,
): Promise<
  WorkspaceActionResult & {
    threadId?: string;
  }
> {
  const { userId } = await auth();

  if (!userId) {
    return {
      ok: false,
      error: "You need to sign in again.",
    };
  }

  const question = cleanString(input.message);

  if (!question) {
    return {
      ok: false,
      error: "Enter a question for Team Memory.",
    };
  }

  const { organization, membership } = await getCurrentWorkspace();

  if (isAthleteRole(membership.role)) {
    return {
      ok: false,
      error: "Team Memory assistant is available to coaching staff only.",
    };
  }

  const db = createDbAdminClient();
  const teamId = cleanString(input.teamId);
  const athleteId = cleanString(input.athleteId);

  let teamName: string | null = null;
  let athleteName: string | null = null;

  if (teamId) {
    const { data: team } = await db
      .from("teams")
      .select("id, name")
      .eq("id", teamId)
      .eq("organization_id", organization.id)
      .maybeSingle();

    if (!team) {
      return {
        ok: false,
        error: "Please select a valid team filter.",
      };
    }

    teamName = team.name;
  }

  const entitlement = teamId
    ? await getTeamEntitlement(teamId)
    : await getPrimaryTeamEntitlement(organization.id);

  if (!entitlement.team_memory_enabled) {
    return {
      ok: false,
      error: "Team Memory is available on Pro and Pro Plus team plans.",
    };
  }

  if (athleteId) {
    const { data: athlete } = await db
      .from("athletes")
      .select("id, first_name, last_name, number, team_id")
      .eq("id", athleteId)
      .eq("organization_id", organization.id)
      .maybeSingle();

    if (!athlete) {
      return {
        ok: false,
        error: "Please select a valid athlete filter.",
      };
    }

    athleteName = [
      athlete.number ? `#${athlete.number}` : null,
      athlete.first_name,
      athlete.last_name,
    ]
      .filter(Boolean)
      .join(" ");
  }

  let queryResult: Awaited<ReturnType<typeof runTeamMemoryQuery>>;

  try {
    queryResult = await runTeamMemoryQuery({
      organizationId: organization.id,
      organizationName: organization.name,
      userId,
      userRole: membership.role,
      question,
      teamId: teamId || null,
      teamName,
      athleteId: athleteId || null,
      athleteName,
    });
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "Team Memory could not answer this question.",
    };
  }

  const { answer, retrieved } = queryResult;
  const assistantContent = formatAssistantAnswerForChat(answer);

  let threadId = cleanString(input.threadId);

  if (threadId) {
    const { data: existingThread } = await db
      .from("assistant_threads")
      .select("id")
      .eq("id", threadId)
      .eq("organization_id", organization.id)
      .maybeSingle();

    if (!existingThread) {
      threadId = "";
    }
  }

  if (!threadId) {
    const { data: createdThread, error: threadError } = await db
      .from("assistant_threads")
      .insert({
        organization_id: organization.id,
        team_id: teamId || null,
        athlete_id: athleteId || null,
        title: question.slice(0, 120),
        created_by: userId,
      })
      .select("id")
      .single();

    if (threadError || !createdThread) {
      const missingTable = threadError?.message.includes("assistant_threads");

      return {
        ok: false,
        error: missingTable
          ? "Team Memory assistant tables are missing. Run docs/db/011_team_memory_rag.sql in db, then retry."
          : threadError?.message ?? "Could not start a conversation thread.",
      };
    }

    threadId = createdThread.id;
  } else {
    await db
      .from("assistant_threads")
      .update({
        team_id: teamId || null,
        athlete_id: athleteId || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", threadId);
  }

  const { error: userMessageError } = await db
    .from("assistant_messages")
    .insert({
      thread_id: threadId,
      organization_id: organization.id,
      role: "user",
      content: question,
      metadata: {
        team_id: teamId || null,
        athlete_id: athleteId || null,
      },
    });

  if (userMessageError) {
    return {
      ok: false,
      error: userMessageError.message,
    };
  }

  const { error: assistantMessageError } = await db
    .from("assistant_messages")
    .insert({
      thread_id: threadId,
      organization_id: organization.id,
      role: "assistant",
      content: assistantContent,
      metadata: {
        answer,
        sources: retrieved.map((document) => ({
          id: document.id,
          title: document.title,
          type: document.documentType,
        })),
      },
    });

  if (assistantMessageError) {
    return {
      ok: false,
      error: assistantMessageError.message,
    };
  }

  await writeWorkspaceAuditLog({
    organizationId: organization.id,
    userId,
    role: membership.role,
    action: "team_memory.assistant_message",
    entityType: "assistant_thread",
    entityId: threadId,
  });

  revalidatePath("/team-memory");

  return {
    ok: true,
    threadId,
  };
}


