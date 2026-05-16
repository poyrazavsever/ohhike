import { PageHeader } from "../../../components/layout/page-header";
import { getNutritionData } from "../../../lib/workspace";
import { NutritionLogForm } from "./_components/nutrition-log-form";

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

export default async function NutritionPage() {
  const { workspace, logs, athletes } = await getNutritionData();
  const latestLogs = logs.slice(0, 8);
  const today = new Date().toISOString().slice(0, 10);
  const todayLogs = logs.filter((log) => log.log_date === today);

  const cards = [
    {
      label: "Today",
      value: todayLogs.length.toString(),
      helper: "Nutrition logs submitted",
    },
    {
      label: "Avg Hydration",
      value: average(todayLogs.map((log) => log.hydration_score)),
      helper: "Today score",
    },
    {
      label: "Avg Meal Quality",
      value: average(todayLogs.map((log) => log.meal_quality)),
      helper: "Today score",
    },
    {
      label: "Athletes",
      value: athletes.length.toString(),
      helper: "Available for logging",
    },
  ];

  return (
    <section className="px-5 py-8 md:px-8">
      <PageHeader
        eyebrow="Performance Data"
        title="Nutrition"
        description={`Nutrition overview for ${workspace.organization.name}.`}
      />

      <NutritionLogForm athletes={athletes} />

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

      {latestLogs.length > 0 ? (
        <div className="mt-6 overflow-hidden rounded-3xl border border-border bg-card">
          <div className="border-b border-border p-5">
            <p className="text-sm font-extrabold text-foreground">
              Latest nutrition logs
            </p>
            <p className="mt-1 text-sm font-medium text-muted-foreground">
              Recent athlete hydration, meal quality and protein notes.
            </p>
          </div>

          <div className="divide-y divide-border">
            {latestLogs.map((log) => (
              <article
                key={log.id}
                className="grid gap-4 p-5 md:grid-cols-[1.4fr_1fr_1fr_1fr]"
              >
                <div>
                  <p className="font-extrabold text-foreground">
                    {log.athleteName}
                  </p>
                  <p className="mt-1 text-xs font-medium text-muted-foreground">
                    {log.teamName ?? "No team"} · {formatDate(log.log_date)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
                    Hydration
                  </p>
                  <p className="mt-2 text-sm font-extrabold text-foreground">
                    {log.hydration_score ?? "Not set"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
                    Meal Quality
                  </p>
                  <p className="mt-2 text-sm font-extrabold text-foreground">
                    {log.meal_quality ?? "Not set"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
                    Protein
                  </p>
                  <p className="mt-2 text-sm font-extrabold text-foreground">
                    {log.protein_servings ?? "Not set"}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-6 rounded-3xl border border-dashed border-border bg-card p-8 text-center">
          <p className="text-sm font-bold text-foreground">
            No nutrition logs yet
          </p>
          <p className="mt-2 text-sm font-medium text-muted-foreground">
            Add the first daily nutrition entry to start tracking habits.
          </p>
        </div>
      )}
    </section>
  );
}
