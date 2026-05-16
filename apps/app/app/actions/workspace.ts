"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

import type { OrganizationType, SportType } from "../../lib/database.types";
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
