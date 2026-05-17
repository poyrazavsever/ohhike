import {
  DashboardHero,
  DetailStat,
} from "../../../../components/dashboard/dashboard-cards";
import { toEffectiveTeamEntitlement } from "../../../../lib/billing/entitlements";
import { parseEntitlementMetadata } from "../../../../lib/billing/promo-codes";
import { billingPlans, getBillingPlan } from "../../../../lib/billing/plans";
import {
  getRevenueCatPublicApiKey,
  getRevenueCatTeamAppUserId,
  isRevenueCatEnabled,
} from "../../../../lib/billing/revenuecat";
import { createSupabaseAdminClient } from "../../../../lib/supabase-admin";
import { getBillingSettingsData } from "../../../../lib/workspace";
import { DevPlanSwitcher } from "./_components/dev-plan-switcher";
import { PromoCodeForm } from "./_components/promo-code-form";
import { RevenueCatTestCheckout } from "./_components/revenuecat-test-checkout";

function devPlanOverrideEnabled() {
  return (
    process.env.NODE_ENV === "development" ||
    process.env.ALLOW_DEV_PLAN_OVERRIDE === "true"
  );
}

export default async function BillingSettingsPage() {
  const { team, entitlement } = await getBillingSettingsData();
  const currentPlan = getBillingPlan(entitlement?.plan);
  const effectiveEntitlement = toEffectiveTeamEntitlement(entitlement);
  const showDevPlanSwitcher = devPlanOverrideEnabled();
  const entitlementMeta = parseEntitlementMetadata(
    entitlement?.metadata ?? null,
  );
  const activePromoCode =
    typeof entitlementMeta.promo_code === "string"
      ? entitlementMeta.promo_code
      : null;

  let activePromoLabel: string | null = null;
  if (activePromoCode && team) {
    const supabase = createSupabaseAdminClient();
    const { data: promo } = await supabase
      .from("promo_codes")
      .select("label")
      .eq("code", activePromoCode)
      .maybeSingle();
    activePromoLabel = promo?.label ?? activePromoCode;
  }
  const revenueCatEnabled = isRevenueCatEnabled();
  const revenueCatApiKey = getRevenueCatPublicApiKey();
  const revenueCatAppUserId = team ? getRevenueCatTeamAppUserId(team.id) : null;

  return (
    <section className="bg-primary-50 px-5 py-6 md:px-8">
      <DashboardHero
        eyebrow="Settings"
        title="Billing"
        subtitle="Team plans are stored per team and drive the feature gates that will power checkout."
        mascotSrc="/maskotlar/harita.png"
      />

      <PromoCodeForm
        activePromoLabel={activePromoLabel}
        periodEnd={entitlement?.current_period_end ?? null}
      />

      {showDevPlanSwitcher ? (
        <DevPlanSwitcher
          currentPlan={currentPlan.id}
          plans={billingPlans.map((plan) => ({
            id: plan.id,
            label: plan.name,
          }))}
        />
      ) : null}

      {revenueCatEnabled && revenueCatAppUserId ? (
        <RevenueCatTestCheckout
          apiKey={revenueCatApiKey}
          appUserId={revenueCatAppUserId}
          currentPlan={currentPlan.name}
        />
      ) : null}

      <div className="mt-4 grid gap-2 md:grid-cols-3">
        <DetailStat label="Team" value={team?.name ?? "No team yet"} />
        <DetailStat label="Current plan" value={currentPlan.name} />
        <DetailStat
          label="Member limit"
          value={
            entitlement?.max_team_members ??
            currentPlan.entitlements.maxTeamMembers
          }
        />
      </div>

      <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-4">
        <DetailStat
          label="AI report limit"
          value={effectiveEntitlement.monthly_ai_report_limit}
        />
        <DetailStat
          label="Team Memory"
          value={
            effectiveEntitlement.team_memory_enabled ? "Included" : "Locked"
          }
        />
        <DetailStat
          label="PDF export"
          value={
            effectiveEntitlement.pdf_export_enabled ? "Included" : "Locked"
          }
        />
        <DetailStat
          label="Branded reports"
          value={
            effectiveEntitlement.branded_reports_enabled ? "Included" : "Locked"
          }
        />
      </div>

      <div className="mt-6 grid gap-3 lg:grid-cols-3">
        {billingPlans.map((plan) => {
          const isCurrent = plan.id === currentPlan.id;

          return (
            <article
              key={plan.id}
              className="rounded-xl border border-border bg-background p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-extrabold text-foreground">
                    {plan.name}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {plan.description}
                  </p>
                </div>
                {isCurrent ? (
                  <span className="rounded-full bg-primary px-2.5 py-1 text-[11px] font-extrabold text-white">
                    Current
                  </span>
                ) : null}
              </div>

              <p className="mt-4 text-2xl font-extrabold text-foreground">
                {plan.priceLabel}
              </p>
              <p className="mt-1 text-xs font-semibold text-muted-foreground">
                {plan.memberLimitLabel}
              </p>

              <ul className="mt-4 space-y-2 text-sm text-foreground/90">
                {plan.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
            </article>
          );
        })}
      </div>

      <div className="mt-4 rounded-xl border border-border bg-background p-4">
        <p className="text-sm font-extrabold text-foreground">
          Billing integration status
        </p>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          RevenueCat Test Store can drive plan testing without Stripe. Team
          access still resolves from Supabase after a server-side sync, so the
          production provider can later move to Stripe without changing feature
          gates across the app.
        </p>
      </div>
    </section>
  );
}
