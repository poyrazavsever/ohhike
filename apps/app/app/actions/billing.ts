"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

import { applyTeamBillingPlan } from "../../lib/billing/apply-plan";
import { redeemPromoCodeForTeam } from "../../lib/billing/promo-codes";
import {
  getRevenueCatPlanFromSubscriber,
  getRevenueCatPublicApiKey,
  getRevenueCatTeamAppUserId,
  isRevenueCatEnabled,
  type RevenueCatSubscriberResponse,
} from "../../lib/billing/revenuecat";
import type { TeamPlanTier } from "../../lib/database.types";
import { createSupabaseAdminClient } from "../../lib/supabase-admin";
import { getCurrentWorkspace } from "../../lib/workspace";

const planIds: TeamPlanTier[] = ["basic_team", "pro_team", "pro_plus_team"];

function devPlanOverrideEnabled() {
  return (
    process.env.NODE_ENV === "development" ||
    process.env.ALLOW_DEV_PLAN_OVERRIDE === "true"
  );
}

function isTeamPlanTier(value: string): value is TeamPlanTier {
  return planIds.includes(value as TeamPlanTier);
}

export async function setPrimaryTeamPlanAction(plan: string) {
  if (!devPlanOverrideEnabled()) {
    return {
      ok: false as const,
      error:
        "Plan changes are only available in development or with ALLOW_DEV_PLAN_OVERRIDE.",
    };
  }

  if (!isTeamPlanTier(plan)) {
    return { ok: false as const, error: "Invalid plan." };
  }

  const { userId } = await auth();

  if (!userId) {
    return { ok: false as const, error: "You must be signed in." };
  }

  const workspace = await getCurrentWorkspace();
  const role = workspace.membership.role;

  if (role !== "owner" && role !== "admin" && role !== "head_coach") {
    return {
      ok: false as const,
      error:
        "Only organization owners, admins, or head coaches can change the team plan in dev.",
    };
  }

  const supabase = createSupabaseAdminClient();
  const organizationId = workspace.organization.id;

  const { data: team, error: teamError } = await supabase
    .from("teams")
    .select("id")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (teamError) {
    return { ok: false as const, error: teamError.message };
  }

  if (!team) {
    return {
      ok: false as const,
      error: "No team found. Finish onboarding first.",
    };
  }

  try {
    await applyTeamBillingPlan(supabase, {
      organizationId,
      teamId: team.id,
      plan,
    });
  } catch (error) {
    return {
      ok: false as const,
      error: error instanceof Error ? error.message : "Could not update plan.",
    };
  }

  revalidatePath("/settings/billing");
  revalidatePath("/wearables");
  revalidatePath("/team-memory");
  revalidatePath("/ai-reports");
  revalidatePath("/training-planner");
  revalidatePath("/reports");

  return { ok: true as const, plan };
}

export async function redeemPromoCodeAction(code: string) {
  const { userId } = await auth();

  if (!userId) {
    return { ok: false as const, error: "You must be signed in." };
  }

  const workspace = await getCurrentWorkspace();
  const role = workspace.membership.role;

  if (role !== "owner" && role !== "admin" && role !== "head_coach") {
    return {
      ok: false as const,
      error:
        "Only organization owners, admins, or head coaches can redeem promo codes.",
    };
  }

  const supabase = createSupabaseAdminClient();
  const organizationId = workspace.organization.id;

  const { data: team, error: teamError } = await supabase
    .from("teams")
    .select("id")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (teamError) {
    return { ok: false as const, error: teamError.message };
  }

  if (!team) {
    return {
      ok: false as const,
      error: "Create a team before redeeming a promo code.",
    };
  }

  const result = await redeemPromoCodeForTeam(supabase, {
    code,
    organizationId,
    teamId: team.id,
    userId,
  });

  if (!result.ok) {
    return result;
  }

  revalidatePath("/settings/billing");
  revalidatePath("/wearables");
  revalidatePath("/team-memory");
  revalidatePath("/ai-reports");
  revalidatePath("/training-planner");
  revalidatePath("/reports");
  revalidatePath("/dashboard");

  return {
    ok: true as const,
    label: result.label,
    plan: result.plan,
    periodEnd: result.periodEnd,
  };
}

export async function syncRevenueCatBillingAction() {
  if (!isRevenueCatEnabled()) {
    return { ok: false as const, error: "RevenueCat billing is not enabled." };
  }

  const { userId } = await auth();

  if (!userId) {
    return { ok: false as const, error: "You must be signed in." };
  }

  const workspace = await getCurrentWorkspace();
  const role = workspace.membership.role;

  if (role !== "owner" && role !== "admin" && role !== "head_coach") {
    return {
      ok: false as const,
      error:
        "Only organization owners, admins, or head coaches can sync billing.",
    };
  }

  const supabase = createSupabaseAdminClient();
  const organizationId = workspace.organization.id;
  const { data: team, error: teamError } = await supabase
    .from("teams")
    .select("id")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (teamError) {
    return { ok: false as const, error: teamError.message };
  }

  if (!team) {
    return {
      ok: false as const,
      error: "Create a team before syncing billing.",
    };
  }

  const appUserId = getRevenueCatTeamAppUserId(team.id);
  const response = await fetch(
    `https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(appUserId)}`,
    {
      headers: {
        Authorization: `Bearer ${getRevenueCatPublicApiKey()}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    return {
      ok: false as const,
      error: `RevenueCat sync failed (${response.status}).`,
    };
  }

  const payload = (await response.json()) as RevenueCatSubscriberResponse;
  const billing = getRevenueCatPlanFromSubscriber(payload.subscriber);

  try {
    await applyTeamBillingPlan(supabase, {
      organizationId,
      teamId: team.id,
      plan: billing.plan,
      periodStart: billing.periodStart,
      periodEnd: billing.periodEnd,
      metadata: {
        provider: "revenuecat",
        revenuecat_app_user_id: appUserId,
        revenuecat_active_entitlements: billing.activeEntitlements,
        synced_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    return {
      ok: false as const,
      error:
        error instanceof Error
          ? error.message
          : "Could not apply billing plan.",
    };
  }

  revalidatePath("/settings/billing");
  revalidatePath("/wearables");
  revalidatePath("/team-memory");
  revalidatePath("/ai-reports");
  revalidatePath("/training-planner");
  revalidatePath("/reports");
  revalidatePath("/dashboard");

  return {
    ok: true as const,
    plan: billing.plan,
    activeEntitlements: billing.activeEntitlements,
  };
}
