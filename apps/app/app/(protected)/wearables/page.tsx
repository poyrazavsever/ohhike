import { PageHeader } from "../../../components/layout/page-header";
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

  const cards = [
    {
      label: "Connections",
      value: totals.connections.toString(),
      helper: `${totals.activeConnections} active`,
    },
    {
      label: "Daily Summaries",
      value: totals.summaries.toString(),
      helper: "Normalized rows",
    },
    {
      label: "Activities",
      value: totals.activities.toString(),
      helper: "Imported activities",
    },
    {
      label: "Athletes",
      value: athletes.length.toString(),
      helper: "Available to connect",
    },
  ];

  return (
    <section className="px-5 py-8 md:px-8">
      <PageHeader
        eyebrow="Performance Data"
        title="Wearables"
        description={`Wearable provider connections for ${workspace.organization.name}.`}
      />

      <CreateWearableConnectionForm athletes={athletes} />

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-3xl border border-border bg-card p-5"
          >
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
              {card.label}
            </p>
            <p className="mt-3 truncate text-2xl font-extrabold text-foreground">
              {card.value}
            </p>
            <p className="mt-2 text-xs font-medium leading-5 text-muted-foreground">
              {card.helper}
            </p>
          </div>
        ))}
      </div>

      {connections.length > 0 ? (
        <div className="mt-6 grid gap-4 xl:grid-cols-2">
          {connections.map((connection) => (
            <article
              key={connection.id}
              className="rounded-3xl border border-border bg-card p-5"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <h2 className="text-lg font-extrabold text-foreground">
                    {connection.athleteName}
                  </h2>
                  <p className="mt-2 text-sm font-medium text-muted-foreground">
                    {connection.teamName ?? "No team"} ·{" "}
                    {formatProvider(connection.provider)}
                  </p>
                </div>
                <div className="rounded-2xl bg-primary-soft px-4 py-2 text-xs font-extrabold text-primary-700">
                  {connection.is_active ? "Active" : "Inactive"}
                </div>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-3">
                <div className="rounded-2xl bg-background p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
                    Provider ID
                  </p>
                  <p className="mt-2 truncate text-sm font-extrabold text-foreground">
                    {connection.provider_user_id ?? "Not set"}
                  </p>
                </div>
                <div className="rounded-2xl bg-background p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
                    Last Sync
                  </p>
                  <p className="mt-2 text-sm font-extrabold text-foreground">
                    {formatDate(connection.last_synced_at)}
                  </p>
                </div>
                <div className="rounded-2xl bg-background p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
                    Scopes
                  </p>
                  <p className="mt-2 truncate text-sm font-extrabold text-foreground">
                    {connection.scopes?.length
                      ? connection.scopes.join(", ")
                      : "Not set"}
                  </p>
                </div>
              </div>

              {connection.sync_error ? (
                <p className="mt-4 rounded-2xl border border-destructive/30 bg-destructive-soft p-4 text-sm font-bold text-destructive-foreground">
                  {connection.sync_error}
                </p>
              ) : null}
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-3xl border border-dashed border-border bg-card p-8 text-center">
          <p className="text-sm font-bold text-foreground">
            No wearable connections yet
          </p>
          <p className="mt-2 text-sm font-medium text-muted-foreground">
            Add a provider connection to prepare wearable sync workflows.
          </p>
        </div>
      )}
    </section>
  );
}
