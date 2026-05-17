"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

import {
  isValidCoachProfileSlug,
  slugifyCoachProfile,
} from "../../lib/coach-network/slug";
import type { SportType, Tables } from "../../lib/database.types";
import { getPrimaryTeamEntitlement } from "../../lib/billing/entitlements";
import { isCoachStaffRole } from "../../lib/org-roles";
import { createSupabaseAdminClient } from "../../lib/supabase-admin";
import { writeWorkspaceAuditLog } from "../../lib/audit-log";
import { getCurrentWorkspace } from "../../lib/workspace";

export type CoachMarketplaceProfileInput = {
  displayName: string;
  slug: string;
  headline?: string;
  bio?: string;
  photoUrl?: string;
  specialties?: string[];
  sports?: SportType[];
  coachingModes?: string[];
  languages?: string[];
  locationCountry?: string;
  locationCity?: string;
  yearsExperience?: number | null;
  pricingDisplay?: string;
  capacity?: number | null;
  responseTimeAvgHours?: number | null;
  isPublic: boolean;
  isAcceptingClients: boolean;
};

type ActionResult =
  | { ok: true; profile: Tables<"coach_marketplace_profiles"> }
  | { ok: false; error: string };

function cleanString(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function cleanStringArray(values: string[] | undefined) {
  return (values ?? []).map((value) => value.trim()).filter(Boolean);
}

const sportTypes: SportType[] = [
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
];

function parseSports(values: string[] | undefined): SportType[] {
  return cleanStringArray(values).filter((value): value is SportType =>
    sportTypes.includes(value as SportType),
  );
}

export async function getCoachMarketplaceProfileForWorkspace() {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  const workspace = await getCurrentWorkspace();
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("coach_marketplace_profiles")
    .select("*")
    .eq("organization_id", workspace.organization.id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function upsertCoachMarketplaceProfile(
  input: CoachMarketplaceProfileInput,
): Promise<ActionResult> {
  const { userId } = await auth();

  if (!userId) {
    return { ok: false, error: "You must be signed in." };
  }

  const workspace = await getCurrentWorkspace();

  if (!isCoachStaffRole(workspace.membership.role)) {
    return { ok: false, error: "Only coaching staff can manage marketplace profiles." };
  }

  const entitlement = await getPrimaryTeamEntitlement(workspace.organization.id);
  if (entitlement.plan === "basic_team") {
    return {
      ok: false,
      error: "Upgrade to Pro to publish your coach marketplace profile.",
    };
  }

  const displayName = input.displayName.trim();
  const slug = slugifyCoachProfile(input.slug || input.displayName);

  if (!displayName) {
    return { ok: false, error: "Display name is required." };
  }

  if (!isValidCoachProfileSlug(slug)) {
    return {
      ok: false,
      error: "Slug must be at least 3 characters and use lowercase letters, numbers, and hyphens.",
    };
  }

  const supabase = createSupabaseAdminClient();

  const { data: slugConflict } = await supabase
    .from("coach_marketplace_profiles")
    .select("id")
    .eq("slug", slug)
    .neq("organization_id", workspace.organization.id)
    .maybeSingle();

  if (slugConflict) {
    return { ok: false, error: "This profile URL slug is already taken." };
  }

  const payload = {
    organization_id: workspace.organization.id,
    coach_user_id: userId,
    slug,
    display_name: displayName,
    headline: cleanString(input.headline),
    bio: cleanString(input.bio),
    photo_url: cleanString(input.photoUrl),
    specialties: cleanStringArray(input.specialties),
    sports: parseSports(input.sports),
    coaching_modes: cleanStringArray(input.coachingModes),
    languages: cleanStringArray(input.languages),
    location_country: cleanString(input.locationCountry),
    location_city: cleanString(input.locationCity),
    years_experience: input.yearsExperience ?? null,
    pricing_display: cleanString(input.pricingDisplay),
    capacity: input.capacity ?? null,
    response_time_avg_hours: input.responseTimeAvgHours ?? null,
    is_public: input.isPublic,
    is_accepting_clients: input.isAcceptingClients,
    updated_at: new Date().toISOString(),
  };

  const { data: existing } = await supabase
    .from("coach_marketplace_profiles")
    .select("id")
    .eq("organization_id", workspace.organization.id)
    .maybeSingle();

  const query = existing
    ? supabase
        .from("coach_marketplace_profiles")
        .update(payload)
        .eq("id", existing.id)
        .select("*")
        .single()
    : supabase
        .from("coach_marketplace_profiles")
        .insert(payload)
        .select("*")
        .single();

  const { data, error } = await query;

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/coach-network/profile");

  return { ok: true, profile: data };
}

type ApplicationActionResult = { ok: true } | { ok: false; error: string };

export async function listCoachNetworkApplicationsForWorkspace() {
  const workspace = await getCurrentWorkspace();
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("coach_network_applications")
    .select(
      `
      id,
      status,
      athlete_message,
      submitted_at,
      created_at,
      athlete_user_id,
      coach_profile_id,
      athlete_marketplace_profiles!athlete_marketplace_profile_id (
        display_name,
        goals
      ),
      users!athlete_user_id (
        email,
        display_name
      )
    `,
    )
    .eq("organization_id", workspace.organization.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function getCoachNetworkApplicationDetail(applicationId: string) {
  const workspace = await getCurrentWorkspace();
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("coach_network_applications")
    .select(
      `
      *,
      athlete_marketplace_profiles!athlete_marketplace_profile_id (*),
      users!athlete_user_id (id, email, display_name),
      coach_marketplace_profiles!coach_profile_id (display_name, slug)
    `,
    )
    .eq("id", applicationId)
    .eq("organization_id", workspace.organization.id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

async function updateCoachNetworkApplicationStatus(
  applicationId: string,
  status: Tables<"coach_network_applications">["status"],
  coachResponse?: string | null,
): Promise<ApplicationActionResult> {
  const { userId } = await auth();

  if (!userId) {
    return { ok: false, error: "You must be signed in." };
  }

  const workspace = await getCurrentWorkspace();

  if (!isCoachStaffRole(workspace.membership.role)) {
    return { ok: false, error: "Only coaching staff can update applications." };
  }

  const supabase = createSupabaseAdminClient();
  const { data: application, error: loadError } = await supabase
    .from("coach_network_applications")
    .select("id, organization_id, status")
    .eq("id", applicationId)
    .eq("organization_id", workspace.organization.id)
    .maybeSingle();

  if (loadError) {
    return { ok: false, error: loadError.message };
  }

  if (!application) {
    return { ok: false, error: "Application not found." };
  }

  const resolvedAt =
    status === "declined" || status === "accepted"
      ? new Date().toISOString()
      : null;

  const { error } = await supabase
    .from("coach_network_applications")
    .update({
      status,
      coach_response: coachResponse?.trim() || null,
      resolved_at: resolvedAt,
      updated_at: new Date().toISOString(),
    })
    .eq("id", applicationId);

  if (error) {
    return { ok: false, error: error.message };
  }

  await writeWorkspaceAuditLog({
    organizationId: workspace.organization.id,
    userId,
    role: workspace.membership.role,
    action: `coach_network.application.${status}`,
    entityType: "coach_network_application",
    entityId: applicationId,
  });

  revalidatePath("/coach-network/applications");
  revalidatePath(`/coach-network/applications/${applicationId}`);

  return { ok: true };
}

export async function markCoachNetworkApplicationViewed(
  applicationId: string,
): Promise<ApplicationActionResult> {
  const supabase = createSupabaseAdminClient();
  const workspace = await getCurrentWorkspace();
  const { data } = await supabase
    .from("coach_network_applications")
    .select("status")
    .eq("id", applicationId)
    .eq("organization_id", workspace.organization.id)
    .maybeSingle();

  if (!data) {
    return { ok: false, error: "Application not found." };
  }

  if (data.status !== "submitted") {
    return { ok: true };
  }

  return updateCoachNetworkApplicationStatus(applicationId, "under_review");
}

export async function rejectCoachNetworkApplication(
  applicationId: string,
  coachResponse: string,
): Promise<ApplicationActionResult> {
  if (!coachResponse.trim()) {
    return { ok: false, error: "Please include a short note for the athlete." };
  }

  return updateCoachNetworkApplicationStatus(
    applicationId,
    "declined",
    coachResponse,
  );
}

export async function requestCoachNetworkApplicationInfo(
  applicationId: string,
  coachResponse: string,
): Promise<ApplicationActionResult> {
  if (!coachResponse.trim()) {
    return { ok: false, error: "Please describe what information you need." };
  }

  return updateCoachNetworkApplicationStatus(
    applicationId,
    "under_review",
    coachResponse,
  );
}
