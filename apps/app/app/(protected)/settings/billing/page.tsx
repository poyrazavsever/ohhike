// @ts-nocheck
import { DashboardHero } from "../../../../components/dashboard/dashboard-cards";
import { parseEntitlementMetadata } from "../../../../lib/billing/promo-codes";
import { billingPlans, getBillingPlan } from "../../../../lib/billing/plans";
import {
  getRevenueCatPublicApiKey,
  getRevenueCatTeamAppUserId,
  isRevenueCatEnabled,
} from "../../../../lib/billing/revenuecat";
import { createDbAdminClient } from "../../../../lib/db-admin";
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
    const db = createDbAdminClient();
    const { data: promo } = await db
      .from("promo_codes")
      .select("label")
      .eq("code", activePromoCode)
      .maybeSingle();
    activePromoLabel = promo?.label ?? activePromoCode;
  }
  const revenueCatEnabled = isRevenueCatEnabled();
  const revenueCatApiKey = getRevenueCatPublicApiKey();
  const revenueCatAppUserId = team ? getRevenueCatTeamAppUserId(team.id) : null;
  const currentMemberLimit =
    entitlement?.max_team_members ?? currentPlan.entitlements.maxTeamMembers;

  return (
    <section className="bg-primary-50 px-5 py-6 md:px-8">
      <DashboardHero
        eyebrow="Settings"
        title="Billing"
        subtitle="Team plans are stored per team and drive the feature gates that will power checkout."
        mascotSrc="/maskotlar/harita.png"
      />

      <div className="mt-4 grid gap-3 xl:grid-cols-[minmax(0,1.25fr)_minmax(20rem,0.75fr)]">
        <section className="rounded-2xl border border-border bg-card p-5 md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-muted-foreground">
                Current plan
              </p>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-foreground">
                {currentPlan.name}
              </h2>
              <p className="mt-2 max-w-xl text-sm font-semibold leading-6 text-muted-foreground">
                {currentPlan.description}
              </p>
            </div>
            <div className="rounded-2xl bg-primary-soft px-4 py-3 text-right">
              <p className="text-2xl font-black text-primary-700">
                {currentPlan.priceLabel}
              </p>
              <p className="mt-1 text-xs font-bold text-primary-700/80">
                {team?.name ?? "No team yet"}
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <span className="rounded-full border border-primary/20 bg-primary-soft px-3 py-1 text-xs font-extrabold text-primary-700">
              {currentMemberLimit} members
            </span>
            <span className="rounded-full border border-border bg-background px-3 py-1 text-xs font-bold text-foreground">
              {currentPlan.entitlements.monthlyAiReportLimit} AI reports / month
            </span>
            {currentPlan.entitlements.teamMemoryEnabled ? (
              <span className="rounded-full border border-border bg-background px-3 py-1 text-xs font-bold text-foreground">
                Team Memory
              </span>
            ) : null}
            {currentPlan.entitlements.pdfExportEnabled ? (
              <span className="rounded-full border border-border bg-background px-3 py-1 text-xs font-bold text-foreground">
                PDF exports
              </span>
            ) : null}
            {currentPlan.entitlements.brandedReportsEnabled ? (
              <span className="rounded-full border border-border bg-background px-3 py-1 text-xs font-bold text-foreground">
                Branded reports
              </span>
            ) : null}
          </div>

          <div className="mt-6 border-t border-border pt-5">
            <p className="text-sm font-black text-foreground">
              Included in your plan
            </p>
            <div className="mt-3 grid gap-2 md:grid-cols-2">
              {currentPlan.features.map((feature) => (
                <div
                  key={feature}
                  className="rounded-xl bg-background px-3 py-2 text-sm font-semibold text-foreground"
                >
                  {feature}
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="grid gap-3">
          <PromoCodeForm
            activePromoLabel={activePromoLabel}
            periodEnd={entitlement?.current_period_end ?? null}
          />

          <section className="rounded-2xl border border-border bg-card p-4">
            <p className="text-sm font-black text-foreground">Billing status</p>
            <p className="mt-2 text-sm font-semibold leading-6 text-muted-foreground">
              RevenueCat Test Store is active for plan testing. Feature access
              is synced back into db, so provider changes later will not
              disturb the rest of the app.
            </p>
          </section>
        </div>
      </div>

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
      <div className="mt-6">
        <div>
          <p className="text-sm font-black text-foreground">Choose a plan</p>
          <p className="mt-1 text-sm font-semibold text-muted-foreground">
            Compare tiers by workflow depth, not by scattered feature counters.
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        {billingPlans.map((plan) => {
          const isCurrent = plan.id === currentPlan.id;
          const isRecommended = plan.id === "pro_team";

          return (
            <article
              key={plan.id}
              className={
                isCurrent
                  ? "relative rounded-2xl border border-primary/35 bg-card p-5 shadow-[0_10px_25px_-5px_rgba(22,230,140,0.14)]"
                  : "relative rounded-2xl border border-border bg-card p-5"
              }
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
                ) : isRecommended ? (
                  <span className="rounded-full border border-primary/20 bg-primary-soft px-2.5 py-1 text-[11px] font-extrabold text-primary-700">
                    Popular
                  </span>
                ) : null}
              </div>

              <p className="mt-4 text-2xl font-extrabold text-foreground">
                {plan.priceLabel}
              </p>
              <p className="mt-1 text-xs font-semibold text-muted-foreground">
                {plan.memberLimitLabel}
              </p>

              <ul className="mt-5 space-y-2 text-sm text-foreground/90">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="rounded-xl bg-background px-3 py-2"
                  >
                    {feature}
                  </li>
                ))}
              </ul>
            </article>
          );
        })}
      </div>
    </section>
  );
}

