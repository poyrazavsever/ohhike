import { PageHeader } from "../../../components/layout/page-header";
import { getTeamMemoryData } from "../../../lib/workspace";
import { TeamMemoryForms } from "./_components/team-memory-forms";

function formatDate(value: string | null) {
  if (!value) {
    return "Unknown";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
  }).format(new Date(value));
}

export default async function TeamMemoryPage() {
  const { workspace, observations, patterns, teams, athletes, totals } =
    await getTeamMemoryData();

  const cards = [
    {
      label: "Observations",
      value: totals.observations.toString(),
      helper: `${totals.unresolvedObservations} unresolved`,
    },
    {
      label: "Patterns",
      value: totals.patterns.toString(),
      helper: `${totals.activePatterns} active`,
    },
    {
      label: "Teams",
      value: teams.length.toString(),
      helper: "Available context",
    },
    {
      label: "Athletes",
      value: athletes.length.toString(),
      helper: "Memory targets",
    },
  ];

  return (
    <section className="px-5 py-8 md:px-8">
      <PageHeader
        eyebrow="AI Intelligence"
        title="Team Memory"
        description={`Durable coaching memory for ${workspace.organization.name}.`}
      />

      <TeamMemoryForms teams={teams} athletes={athletes} />

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

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <div className="rounded-3xl border border-border bg-card p-5">
          <p className="text-sm font-extrabold text-foreground">
            Athlete observations
          </p>
          <p className="mt-1 text-sm font-medium text-muted-foreground">
            Manual and AI-created athlete context.
          </p>
          <div className="mt-5 grid gap-3">
            {observations.length > 0 ? (
              observations.map((observation) => (
                <article
                  key={observation.id}
                  className="rounded-2xl border border-border bg-background p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-extrabold text-foreground">
                        {observation.title ?? observation.athleteName}
                      </p>
                      <p className="mt-1 text-xs font-medium text-muted-foreground">
                        {observation.athleteName} · {observation.teamName ?? "No team"} ·{" "}
                        {formatDate(observation.created_at)}
                      </p>
                    </div>
                    <div className="rounded-xl bg-primary-soft px-3 py-1.5 text-xs font-extrabold text-primary-700">
                      {observation.severity ?? "note"}
                    </div>
                  </div>
                  <p className="mt-3 text-sm font-medium leading-6 text-muted-foreground">
                    {observation.observation}
                  </p>
                </article>
              ))
            ) : (
              <p className="rounded-2xl border border-dashed border-border bg-background p-5 text-center text-sm font-medium text-muted-foreground">
                No athlete observations yet.
              </p>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-card p-5">
          <p className="text-sm font-extrabold text-foreground">Team patterns</p>
          <p className="mt-1 text-sm font-medium text-muted-foreground">
            Repeating themes and development areas.
          </p>
          <div className="mt-5 grid gap-3">
            {patterns.length > 0 ? (
              patterns.map((pattern) => (
                <article
                  key={pattern.id}
                  className="rounded-2xl border border-border bg-background p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-extrabold text-foreground">
                        {pattern.title}
                      </p>
                      <p className="mt-1 text-xs font-medium text-muted-foreground">
                        {pattern.teamName ?? "No team"} · {pattern.pattern_type}
                      </p>
                    </div>
                    <div className="rounded-xl bg-primary-soft px-3 py-1.5 text-xs font-extrabold text-primary-700">
                      {pattern.status ?? "active"}
                    </div>
                  </div>
                  <p className="mt-3 text-sm font-medium leading-6 text-muted-foreground">
                    {pattern.description ?? "No description"}
                  </p>
                </article>
              ))
            ) : (
              <p className="rounded-2xl border border-dashed border-border bg-background p-5 text-center text-sm font-medium text-muted-foreground">
                No team patterns yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
