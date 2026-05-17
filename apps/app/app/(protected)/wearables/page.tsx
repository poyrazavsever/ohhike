import {
  DashboardHero,
  DetailStat,
  EmptyStateCard,
  MetricCard,
} from "../../../components/dashboard/dashboard-cards";
import { FeatureLockedCard } from "../../../components/dashboard/feature-locked-card";
import { getPrimaryTeamEntitlement } from "../../../lib/billing/entitlements";
import { getWearablesData } from "../../../lib/workspace";
import { CreateWearableConnectionForm } from "./_components/create-wearable-connection-form";

function formatProvider(value: string) {
  return value
    .split("_")
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ");
}

function formatDate(value: string | null) {
  if (!value) {
    return "Never";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function WearablesPage() {
  const { workspace, connections, athletes, totals } = await getWearablesData();
  const entitlement = await getPrimaryTeamEntitlement(workspace.organization.id);

  const metricCards = [
    {
      label: "Connections",
      value: totals.connections.toString(),
      helper: `${totals.activeConnections} active`,
      icon: "solar:watch-round-bold",
    },
    {
      label: "Daily Summaries",
      value: totals.summaries.toString(),
      helper: "Normalized rows",
      icon: "solar:clipboard-list-bold",
      tone: "info" as const,
    },
    {
      label: "Activities",
      value: totals.activities.toString(),
      helper: "Imported activities",
      icon: "solar:running-bold",
      tone: "secondary" as const,
    },
    {
      label: "Athletes",
      value: athletes.length.toString(),
      helper: "Available to connect",
      icon: "solar:user-id-bold",
      tone: "warning" as const,
    },
  ];

  return (
    <section className="bg-primary-50 px-5 py-6 md:px-8">
      <DashboardHero
        eyebrow="Performance Data"
        title="Wearables"
        subtitle={`Wearable provider connections for ${workspace.organization.name}.`}
        mascotSrc="/maskotlar/kosu.png"
      />

      {!entitlement.wearable_enabled ? (
        <FeatureLockedCard
          title="Wearables are not included in the current plan"
          description="Upgrade the active team to Pro or Pro Plus to manage wearable connections and imported summaries."
        />
      ) : null}

      <div className="mt-4">
        {entitlement.wearable_enabled ? (
          <CreateWearableConnectionForm athletes={athletes} />
        ) : null}
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {metricCards.map((card) => (
          <MetricCard key={card.label} {...card} />
        ))}
      </div>

      {connections.length > 0 ? (
        <div className="mt-4 grid gap-3 xl:grid-cols-2">
          {connections.map((connection) => (
            <article
              key={connection.id}
              className="rounded-2xl border border-border bg-card p-4"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <h2 className="text-base font-black text-foreground">
                    {connection.athleteName}
                  </h2>
                  <p className="mt-1 text-sm font-semibold text-muted-foreground">
                    {connection.teamName ?? "No team"} ·{" "}
                    {formatProvider(connection.provider)}
                  </p>
                </div>
                <div className="rounded-xl bg-primary-soft px-3 py-1.5 text-xs font-extrabold text-primary-700">
                  {connection.is_active ? "Active" : "Inactive"}
                </div>
              </div>

              <div className="mt-4 grid gap-2 md:grid-cols-3">
                <DetailStat
                  label="Provider ID"
                  value={connection.provider_user_id ?? "Not set"}
                />
                <DetailStat
                  label="Last Sync"
                  value={formatDate(connection.last_synced_at)}
                />
                <DetailStat
                  label="Scopes"
                  value={
                    connection.scopes?.length
                      ? connection.scopes.join(", ")
                      : "Not set"
                  }
                />
              </div>

              {connection.sync_error ? (
                <p className="mt-3 rounded-xl border border-destructive/30 bg-destructive-soft p-3 text-sm font-bold text-destructive-foreground">
                  {connection.sync_error}
                </p>
              ) : null}
            </article>
          ))}
        </div>
      ) : (
        <EmptyStateCard
          title="No wearable connections yet"
          description="Add a provider connection to prepare wearable sync workflows."
          icon="solar:watch-round-bold"
        />
      )}
    </section>
  );
}
