"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

import type {
  OrganizationType,
  SessionStatus,
  SessionType,
  SportType,
} from "../../lib/database.types";
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

export type WorkspaceActionResult =
  | {
      ok: true;
    }
  | {
      ok: false;
      error: string;
    };

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

function parseIntensity(value: string | undefined) {
  const parsed = parsePositiveInteger(value);
  return parsed !== null && parsed >= 1 && parsed <= 10 ? parsed : null;
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
    .select("id")
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

  revalidatePath("/");

  return {
    ok: true,
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
      planned_intensity: parsePositiveInteger(input.plannedIntensity),
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
      planned_intensity: parsePositiveInteger(input.plannedIntensity),
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
  revalidatePath("/dashboard");

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
    const { error: insertError } = await supabase
      .from("session_attendance")
      .insert(
        includedEntries.map((entry) => ({
          session_id: session.id,
          athlete_id: entry.athleteId,
          attended: entry.attended,
          absence_reason: cleanString(entry.absenceReason),
          minutes_played: parsePositiveInteger(entry.minutesPlayed),
          rpe: parsePositiveInteger(entry.rpe),
          coach_note: cleanString(entry.coachNote),
          pain_reported: entry.painReported,
          pain_area: cleanString(entry.painArea),
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
    action: "session.attendance_updated",
    entity_type: "session",
    entity_id: session.id,
  });

  revalidatePath("/sessions");
  revalidatePath("/dashboard");

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

  const blocks = input.blocks
    .map((block, index) => ({
      ...block,
      title: cleanString(block.title),
      orderIndex: parsePositiveInteger(block.orderIndex) ?? index,
      plannedDurationMin: parsePositiveInteger(block.plannedDurationMin),
      actualDurationMin: parsePositiveInteger(block.actualDurationMin),
      intensity: parseIntensity(block.intensity),
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
  revalidatePath("/dashboard");

  return {
    ok: true,
  };
}
