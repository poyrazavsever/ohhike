"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { setPrimaryTeamPlanAction } from "../../../../actions/billing";
import type { TeamPlanTier } from "../../../../../lib/database.types";

type PlanOption = {
  id: TeamPlanTier;
  label: string;
};

export function DevPlanSwitcher({
  currentPlan,
  plans,
}: {
  currentPlan: TeamPlanTier;
  plans: PlanOption[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <section className="mt-4 rounded-xl border border-amber-300/60 bg-amber-50 p-4 dark:border-amber-700/50 dark:bg-amber-950/30">
      <p className="text-sm font-extrabold text-foreground">Development: switch team plan</p>
      <p className="mt-1 text-sm text-muted-foreground">
        Checkout is not live yet. Use this to test Pro / Pro Plus gates (wearables, AI, PDF).
        Applies to your organization&apos;s first team — the same team used on /wearables.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {plans.map((plan) => {
          const isCurrent = plan.id === currentPlan;

          return (
            <button
              key={plan.id}
              type="button"
              disabled={pending || isCurrent}
              onClick={() => {
                startTransition(async () => {
                  const result = await setPrimaryTeamPlanAction(plan.id);

                  if (!result.ok) {
                    window.alert(result.error);
                    return;
                  }

                  router.refresh();
                });
              }}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-bold text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isCurrent ? `${plan.label} (current)` : `Set ${plan.label}`}
            </button>
          );
        })}
      </div>
    </section>
  );
}
