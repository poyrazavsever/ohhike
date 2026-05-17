import Link from "next/link";

import type { EffectiveTeamEntitlement } from "../../../../lib/billing/entitlements";
import { getBillingPlan } from "../../../../lib/billing/plans";

const stravaMessages: Record<
  string,
  { title: string; body: string; tone: "success" | "error" }
> = {
  connected: {
    title: "Strava connected",
    body: "Activities can be imported with Sync now.",
    tone: "success",
  },
  missing: {
    title: "Strava authorization incomplete",
    body: "Strava did not return an authorization code. Try Connect Strava again.",
    tone: "error",
  },
  "missing-scope": {
    title: "Strava scope missing",
    body: "Allow activity read access when authorizing Strava.",
    tone: "error",
  },
  "invalid-state": {
    title: "Strava session expired",
    body: "Start Connect Strava again from this page.",
    tone: "error",
  },
  "invalid-user": {
    title: "Strava user mismatch",
    body: "Sign in with the same CoachOS account that started the connection.",
    tone: "error",
  },
  "athlete-missing": {
    title: "Athlete not found",
    body: "The selected athlete is no longer available in this organization.",
    tone: "error",
  },
};

function stravaConfigured() {
  return Boolean(
    process.env.STRAVA_CLIENT_ID?.trim() &&
      process.env.STRAVA_CLIENT_SECRET?.trim(),
  );
}

export function WearablesStatusBanners({
  entitlement,
  stravaStatus,
  athleteCount,
}: {
  entitlement: EffectiveTeamEntitlement;
  stravaStatus?: string;
  athleteCount: number;
}) {
  const plan = getBillingPlan(entitlement.plan);
  const stravaMessage = stravaStatus ? stravaMessages[stravaStatus] : null;

  return (
    <>
      <div className="mt-4 flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card px-4 py-3">
        <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
          Team plan
        </span>
        <span className="rounded-full bg-primary-soft px-2.5 py-1 text-xs font-extrabold text-primary-700">
          {plan.name}
        </span>
        {!entitlement.wearable_enabled ? (
          <Link
            href="/settings/billing"
            className="text-xs font-bold text-primary underline-offset-2 hover:underline"
          >
            Upgrade to Pro for wearables
          </Link>
        ) : null}
      </div>

      {stravaMessage ? (
        <div
          className={
            stravaMessage.tone === "success"
              ? "mt-3 rounded-xl border border-emerald-300/60 bg-emerald-50 p-4 dark:border-emerald-800/50 dark:bg-emerald-950/30"
              : "mt-3 rounded-xl border border-destructive/30 bg-destructive-soft p-4"
          }
        >
          <p className="text-sm font-extrabold text-foreground">{stravaMessage.title}</p>
          <p className="mt-1 text-sm font-semibold text-muted-foreground">{stravaMessage.body}</p>
        </div>
      ) : null}

      {entitlement.wearable_enabled && !stravaConfigured() ? (
        <div className="mt-3 rounded-xl border border-amber-300/60 bg-amber-50 p-4 dark:border-amber-700/50 dark:bg-amber-950/30">
          <p className="text-sm font-extrabold text-foreground">Strava OAuth not configured</p>
          <p className="mt-1 text-sm font-semibold text-muted-foreground">
            Add STRAVA_CLIENT_ID and STRAVA_CLIENT_SECRET to apps/app/.env.local, then restart
            the dev server.
          </p>
        </div>
      ) : null}

      {entitlement.wearable_enabled && athleteCount === 0 ? (
        <div className="mt-3 rounded-xl border border-border bg-card p-4">
          <p className="text-sm font-extrabold text-foreground">Add an athlete first</p>
          <p className="mt-1 text-sm font-semibold text-muted-foreground">
            Wearable connections are linked to roster athletes. Create an athlete, then use Connect
            Strava or Add connection.
          </p>
          <Link
            href="/athletes"
            className="mt-3 inline-flex rounded-xl bg-primary px-4 py-2.5 text-sm font-black text-primary-foreground hover:bg-primary-hover"
          >
            Go to athletes
          </Link>
        </div>
      ) : null}
    </>
  );
}
