import {
  DashboardHero,
  DetailStat,
} from "../../../../components/dashboard/dashboard-cards";
import { getBillingPlan, billingPlans } from "../../../../lib/billing/plans";
import { getBillingSettingsData } from "../../../../lib/workspace";

export default async function BillingSettingsPage() {
  const { team, entitlement } = await getBillingSettingsData();
  const currentPlan = getBillingPlan(entitlement?.plan);

  return (
    <section className="bg-primary-50 px-5 py-6 md:px-8">
      <DashboardHero
        eyebrow="Settings"
        title="Billing"
        subtitle="Team plans are stored per team and drive the feature gates that will power checkout."
        mascotSrc="/maskotlar/harita.png"
      />

      <div className="mt-4 grid gap-2 md:grid-cols-3">
        <DetailStat label="Team" value={team?.name ?? "No team yet"} />
        <DetailStat label="Current plan" value={currentPlan.name} />
        <DetailStat
          label="Member limit"
          value={entitlement?.max_team_members ?? currentPlan.entitlements.maxTeamMembers}
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
          Checkout decision still open
        </p>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          CoachOS organizations currently live in Supabase, while Clerk Billing
          organization checkout requires an active Clerk Organization. Before
          enabling checkout, choose whether to mirror CoachOS organizations into
          Clerk Organizations or use user-scoped billing with an explicit team
          mapping layer.
        </p>
      </div>
    </section>
  );
}
