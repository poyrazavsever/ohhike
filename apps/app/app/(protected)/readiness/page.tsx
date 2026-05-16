import { PageHeader } from "../../../components/layout/page-header";
import { getReadinessData } from "../../../lib/workspace";
import { ReadinessCheckinForm } from "./_components/readiness-checkin-form";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
  }).format(new Date(value));
}

function average(values: Array<number | null>) {
  const validValues = values.filter((value): value is number => value !== null);

  if (validValues.length === 0) {
    return "No data";
  }

  return Math.round(
    validValues.reduce((total, value) => total + value, 0) / validValues.length,
  ).toString();
}

export default async function ReadinessPage() {
  const { workspace, checkins, athletes } = await getReadinessData();
  const latestCheckins = checkins.slice(0, 8);
  const today = new Date().toISOString().slice(0, 10);
  const todayCheckins = checkins.filter(
    (checkin) => checkin.checkin_date === today,
  );

  const cards = [
    {
      label: "Today",
      value: todayCheckins.length.toString(),
      helper: "Check-ins submitted",
    },
    {
      label: "Avg Readiness",
      value: average(todayCheckins.map((checkin) => checkin.readiness_score)),
      helper: "Today score",
    },
    {
      label: "Avg Fatigue",
      value: average(todayCheckins.map((checkin) => checkin.fatigue)),
      helper: "Lower is better",
    },
    {
      label: "Athletes",
      value: athletes.length.toString(),
      helper: "Available for check-in",
    },
  ];

  return (
    <section className="px-5 py-8 md:px-8">
      <PageHeader
        eyebrow="Performance Data"
        title="Readiness"
        description={`Daily wellness overview for ${workspace.organization.name}.`}
      />

      <ReadinessCheckinForm athletes={athletes} />

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

      {latestCheckins.length > 0 ? (
        <div className="mt-6 overflow-hidden rounded-3xl border border-border bg-card">
          <div className="border-b border-border p-5">
            <p className="text-sm font-extrabold text-foreground">
              Latest check-ins
            </p>
            <p className="mt-1 text-sm font-medium text-muted-foreground">
              Recent athlete wellness entries and calculated readiness score.
            </p>
          </div>

          <div className="divide-y divide-border">
            {latestCheckins.map((checkin) => (
              <article
                key={checkin.id}
                className="grid gap-4 p-5 md:grid-cols-[1.4fr_1fr_1fr_1fr]"
              >
                <div>
                  <p className="font-extrabold text-foreground">
                    {checkin.athleteName}
                  </p>
                  <p className="mt-1 text-xs font-medium text-muted-foreground">
                    {checkin.teamName ?? "No team"} · {formatDate(checkin.checkin_date)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
                    Readiness
                  </p>
                  <p className="mt-2 text-sm font-extrabold text-foreground">
                    {checkin.readiness_score ?? "No score"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
                    Sleep
                  </p>
                  <p className="mt-2 text-sm font-extrabold text-foreground">
                    {checkin.sleep_hours
                      ? `${checkin.sleep_hours}h`
                      : "Not set"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
                    Fatigue / Mood
                  </p>
                  <p className="mt-2 text-sm font-extrabold text-foreground">
                    {checkin.fatigue ?? "-"} / {checkin.mood ?? "-"}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-6 rounded-3xl border border-dashed border-border bg-card p-8 text-center">
          <p className="text-sm font-bold text-foreground">
            No readiness check-ins yet
          </p>
          <p className="mt-2 text-sm font-medium text-muted-foreground">
            Add the first daily wellness entry to start tracking athlete readiness.
          </p>
        </div>
      )}
    </section>
  );
}
