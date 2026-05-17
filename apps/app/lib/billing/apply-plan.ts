import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database, Json, TeamPlanTier } from "../database.types";
import { getBillingPlan } from "./plans";

export function entitlementRowFromPlan(input: {
  organizationId: string;
  teamId: string;
  plan: TeamPlanTier;
}) {
  const definition = getBillingPlan(input.plan);
  const flags = definition.entitlements;

  return {
    organization_id: input.organizationId,
    team_id: input.teamId,
    plan: definition.id,
    max_team_members: flags.maxTeamMembers,
    ai_features_enabled: flags.aiFeaturesEnabled,
    ai_reports_enabled: flags.aiReportsEnabled,
    team_memory_enabled: flags.teamMemoryEnabled,
    training_planner_enabled: flags.trainingPlannerEnabled,
    wearable_enabled: flags.wearableEnabled,
    pdf_export_enabled: flags.pdfExportEnabled,
    branded_reports_enabled: flags.brandedReportsEnabled,
    monthly_ai_report_limit: flags.monthlyAiReportLimit,
  };
}

export async function applyTeamBillingPlan(
  supabase: SupabaseClient<Database>,
  input: {
    organizationId: string;
    teamId: string;
    plan: TeamPlanTier;
    periodStart?: Date | null;
    periodEnd?: Date | null;
    metadata?: Json | Record<string, unknown> | null;
  },
) {
  const row = {
    ...entitlementRowFromPlan(input),
    current_period_start: input.periodStart?.toISOString() ?? null,
    current_period_end: input.periodEnd?.toISOString() ?? null,
    metadata: (input.metadata ?? {}) as Json,
  };

  const { error } = await supabase.from("team_billing_entitlements").upsert(row, {
    onConflict: "team_id",
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function applyPromoPlanToTeam(
  supabase: SupabaseClient<Database>,
  input: {
    organizationId: string;
    teamId: string;
    plan: TeamPlanTier;
    periodStart: Date;
    periodEnd: Date;
    promoCode: string;
    redemptionId: string;
  },
) {
  await applyTeamBillingPlan(supabase, {
    organizationId: input.organizationId,
    teamId: input.teamId,
    plan: input.plan,
    periodStart: input.periodStart,
    periodEnd: input.periodEnd,
    metadata: {
      promo_code: input.promoCode,
      redemption_id: input.redemptionId,
      granted_at: input.periodStart.toISOString(),
    },
  });
}
