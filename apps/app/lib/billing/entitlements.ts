import type { Tables } from "../database.types";
import { createSupabaseAdminClient } from "../supabase-admin";
import { defaultBillingPlan, getBillingPlan } from "./plans";

type TeamEntitlement = Tables<"team_billing_entitlements">;

export type EffectiveTeamEntitlement = Pick<
  TeamEntitlement,
  | "plan"
  | "max_team_members"
  | "ai_features_enabled"
  | "ai_reports_enabled"
  | "team_memory_enabled"
  | "training_planner_enabled"
  | "wearable_enabled"
  | "pdf_export_enabled"
  | "branded_reports_enabled"
  | "monthly_ai_report_limit"
>;

const defaultEntitlements: EffectiveTeamEntitlement = {
  plan: defaultBillingPlan.id,
  max_team_members: defaultBillingPlan.entitlements.maxTeamMembers,
  ai_features_enabled: defaultBillingPlan.entitlements.aiFeaturesEnabled,
  ai_reports_enabled: defaultBillingPlan.entitlements.aiReportsEnabled,
  team_memory_enabled: defaultBillingPlan.entitlements.teamMemoryEnabled,
  training_planner_enabled: defaultBillingPlan.entitlements.trainingPlannerEnabled,
  wearable_enabled: defaultBillingPlan.entitlements.wearableEnabled,
  pdf_export_enabled: defaultBillingPlan.entitlements.pdfExportEnabled,
  branded_reports_enabled: defaultBillingPlan.entitlements.brandedReportsEnabled,
  monthly_ai_report_limit: defaultBillingPlan.entitlements.monthlyAiReportLimit,
};

export function toEffectiveTeamEntitlement(
  entitlement: TeamEntitlement | null | undefined,
): EffectiveTeamEntitlement {
  if (!entitlement) {
    return defaultEntitlements;
  }

  const planDefinition = getBillingPlan(entitlement.plan);
  const planFlags = planDefinition.entitlements;

  // Plan tier is the source of truth for feature flags (avoids stale DB booleans).
  return {
    plan: entitlement.plan,
    max_team_members: entitlement.max_team_members ?? planFlags.maxTeamMembers,
    ai_features_enabled: planFlags.aiFeaturesEnabled,
    ai_reports_enabled: planFlags.aiReportsEnabled,
    team_memory_enabled: planFlags.teamMemoryEnabled,
    training_planner_enabled: planFlags.trainingPlannerEnabled,
    wearable_enabled: planFlags.wearableEnabled,
    pdf_export_enabled: planFlags.pdfExportEnabled,
    branded_reports_enabled: planFlags.brandedReportsEnabled,
    monthly_ai_report_limit:
      entitlement.monthly_ai_report_limit ?? planFlags.monthlyAiReportLimit,
  };
}

export async function getPrimaryTeamEntitlement(
  organizationId: string,
): Promise<EffectiveTeamEntitlement> {
  const supabase = createSupabaseAdminClient();
  const { data: team, error: teamError } = await supabase
    .from("teams")
    .select("id")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (teamError) {
    throw new Error(teamError.message);
  }

  if (!team) {
    return defaultEntitlements;
  }

  const { data: entitlement, error: entitlementError } = await supabase
    .from("team_billing_entitlements")
    .select("*")
    .eq("team_id", team.id)
    .maybeSingle();

  if (entitlementError) {
    throw new Error(entitlementError.message);
  }

  return toEffectiveTeamEntitlement(entitlement);
}

export async function getTeamEntitlement(
  teamId: string,
): Promise<EffectiveTeamEntitlement> {
  const supabase = createSupabaseAdminClient();
  const { data: entitlement, error } = await supabase
    .from("team_billing_entitlements")
    .select("*")
    .eq("team_id", teamId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return toEffectiveTeamEntitlement(entitlement);
}

export function monthStartIso(referenceDate = new Date()) {
  return new Date(
    Date.UTC(referenceDate.getUTCFullYear(), referenceDate.getUTCMonth(), 1),
  ).toISOString();
}
