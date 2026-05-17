import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database, Json, Tables, TeamPlanTier } from "../database.types";
import { applyPromoPlanToTeam, applyTeamBillingPlan } from "./apply-plan";

type TeamEntitlement = Tables<"team_billing_entitlements">;

export type PromoCodeRow = {
  id: string;
  code: string;
  label: string;
  plan: TeamPlanTier;
  duration_days: number;
  max_redemptions: number | null;
  is_active: boolean;
  valid_from: string | null;
  valid_until: string | null;
};

export function normalizePromoCodeInput(raw: string) {
  return raw.trim().toLowerCase().replace(/\s+/g, "");
}

export function parseEntitlementMetadata(metadata: Json | null): Record<string, unknown> {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return {};
  }
  return metadata as Record<string, unknown>;
}

export function isPromoGrantExpired(entitlement: Pick<
  TeamEntitlement,
  "current_period_end" | "metadata" | "clerk_subscription_id"
>): boolean {
  if (entitlement.clerk_subscription_id) {
    return false;
  }

  const meta = parseEntitlementMetadata(entitlement.metadata);
  if (typeof meta.promo_code !== "string" || !meta.promo_code) {
    return false;
  }

  if (!entitlement.current_period_end) {
    return false;
  }

  return new Date(entitlement.current_period_end).getTime() < Date.now();
}

export async function expirePromoGrantIfNeeded(
  supabase: SupabaseClient<Database>,
  entitlement: TeamEntitlement,
) {
  if (!isPromoGrantExpired(entitlement)) {
    return entitlement;
  }

  await applyTeamBillingPlan(supabase, {
    organizationId: entitlement.organization_id,
    teamId: entitlement.team_id,
    plan: "basic_team",
    periodStart: null,
    periodEnd: null,
    metadata: {
      ...parseEntitlementMetadata(entitlement.metadata),
      promo_expired_at: new Date().toISOString(),
    },
  });

  const { data: refreshed, error } = await supabase
    .from("team_billing_entitlements")
    .select("*")
    .eq("team_id", entitlement.team_id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return refreshed ?? entitlement;
}

async function getPromoByCode(
  supabase: SupabaseClient<Database>,
  normalizedCode: string,
): Promise<PromoCodeRow | null> {
  const { data, error } = await supabase
    .from("promo_codes")
    .select(
      "id, code, label, plan, duration_days, max_redemptions, is_active, valid_from, valid_until",
    )
    .eq("code", normalizedCode)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data as PromoCodeRow | null;
}

export async function redeemPromoCodeForTeam(
  supabase: SupabaseClient<Database>,
  input: {
    code: string;
    organizationId: string;
    teamId: string;
    userId: string;
  },
): Promise<
  | {
      ok: true;
      label: string;
      plan: TeamPlanTier;
      periodEnd: string;
    }
  | { ok: false; error: string }
> {
  const normalized = normalizePromoCodeInput(input.code);

  if (!normalized) {
    return { ok: false, error: "Enter a promo code." };
  }

  const promo = await getPromoByCode(supabase, normalized);

  if (!promo || !promo.is_active) {
    return { ok: false, error: "This promo code is not valid." };
  }

  const now = new Date();

  if (promo.valid_from && new Date(promo.valid_from).getTime() > now.getTime()) {
    return { ok: false, error: "This promo code is not active yet." };
  }

  if (promo.valid_until && new Date(promo.valid_until).getTime() < now.getTime()) {
    return { ok: false, error: "This promo code has expired." };
  }

  if (promo.max_redemptions != null) {
    const { count, error: countError } = await supabase
      .from("promo_code_redemptions")
      .select("id", { count: "exact", head: true })
      .eq("promo_code_id", promo.id);

    if (countError) {
      return { ok: false, error: countError.message };
    }

    if ((count ?? 0) >= promo.max_redemptions) {
      return { ok: false, error: "This promo code has reached its usage limit." };
    }
  }

  const { data: existingRedemption, error: existingError } = await supabase
    .from("promo_code_redemptions")
    .select("id, period_end")
    .eq("team_id", input.teamId)
    .eq("promo_code_id", promo.id)
    .maybeSingle();

  if (existingError) {
    return { ok: false, error: existingError.message };
  }

  if (existingRedemption) {
    const stillActive =
      new Date(existingRedemption.period_end).getTime() > now.getTime();
    if (stillActive) {
      return {
        ok: false,
        error: "This team has already redeemed this code. Pro access is still active.",
      };
    }
    return {
      ok: false,
      error: "This team has already used this promo code.",
    };
  }

  const periodStart = now;
  const periodEnd = new Date(now);
  periodEnd.setUTCDate(periodEnd.getUTCDate() + promo.duration_days);

  const { data: redemption, error: redemptionError } = await supabase
    .from("promo_code_redemptions")
    .insert({
      promo_code_id: promo.id,
      organization_id: input.organizationId,
      team_id: input.teamId,
      redeemed_by: input.userId,
      plan_granted: promo.plan,
      period_start: periodStart.toISOString(),
      period_end: periodEnd.toISOString(),
    })
    .select("id")
    .single();

  if (redemptionError || !redemption) {
    return {
      ok: false,
      error: redemptionError?.message ?? "Could not record redemption.",
    };
  }

  try {
    await applyPromoPlanToTeam(supabase, {
      organizationId: input.organizationId,
      teamId: input.teamId,
      plan: promo.plan,
      periodStart,
      periodEnd,
      promoCode: promo.code,
      redemptionId: redemption.id,
    });
  } catch (error) {
    await supabase.from("promo_code_redemptions").delete().eq("id", redemption.id);
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Could not apply plan.",
    };
  }

  return {
    ok: true,
    label: promo.label,
    plan: promo.plan,
    periodEnd: periodEnd.toISOString(),
  };
}

export async function getActivePromoRedemptionForTeam(
  supabase: SupabaseClient<Database>,
  teamId: string,
) {
  const { data, error } = await supabase
    .from("promo_code_redemptions")
    .select("id, period_end, plan_granted, promo_code_id, promo_codes(label, code)")
    .eq("team_id", teamId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
