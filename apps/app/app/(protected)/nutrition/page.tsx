import {
  DashboardHero,
  EmptyStateCard,
  MetricCard,
} from "../../../components/dashboard/dashboard-cards";
import { getApiWorkspaceShellData } from "../../../lib/api-workspace";
import { getTeamNutrition } from "../../../lib/api-daily";
import { fetchApi } from "../../../lib/api-client";
import { getTeamAthletes } from "../../../lib/api-athletes";
import { NutritionLogForm } from "./_components/nutrition-log-form";

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
  }).format(new Date(date));
}

function average(values: Array<number | null | undefined>) {
  const validValues = values.filter((value): value is number => value !== null && value !== undefined);

  if (validValues.length === 0) {
    return "No data";
  }

  return Math.round(
    validValues.reduce((total, value) => total + value, 0) / validValues.length,
  ).toString();
}

export default async function NutritionPage() {
  const workspace = await getApiWorkspaceShellData();
  const logs = await getTeamNutrition();
  const apiAthletes = await getTeamAthletes();
  const teams = await fetchApi(`/teams/${workspace.organizationId}`);

  // Form için gerekli (AthleteOption) formatına dönüştürüyoruz
  const athletes = apiAthletes.map((a: any) => ({
    ...a,
    id: a._id,
    number: null,
  }));

  const latestLogs = logs.slice(0, 8);
  const todayStr = new Date().toISOString().split("T")[0];
  const todayLogs = logs.filter(
    (log: any) => log.date && log.date.startsWith(todayStr),
  );

  const metricCards = [
    {
      label: "Today",
      value: todayLogs.length.toString(),
      helper: "Nutrition logs submitted",
      icon: "solar:calendar-bold",
    },
    {
      label: "Avg Hydration",
      value: average(todayLogs.map((log: any) => log.hydration_ounces)),
      helper: "Ounces today",
      icon: "solar:drop-bold",
      tone: "info" as const,
    },
    {
      label: "Avg Meal Quality",
      value: average(todayLogs.map((log: any) => log.meal_quality)),
      helper: "Today score",
      icon: "solar:cup-hot-bold",
      tone: "secondary" as const,
    },
    {
      label: "Athletes",
      value: athletes.length.toString(),
      helper: "Available for logging",
      icon: "solar:user-id-bold",
      tone: "warning" as const,
    },
  ];

  return (
    <section className="bg-primary-50 px-5 py-6 md:px-8">
      <DashboardHero
        eyebrow="Performance Data"
        title="Nutrition"
        subtitle={`Nutrition overview for ${workspace.organizationName}.`}
        mascotSrc="/maskotlar/suIcme.png"
      />

      <div className="mt-4">
        <NutritionLogForm athletes={athletes} />
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {metricCards.map((card) => (
          <MetricCard key={card.label} {...card} />
        ))}
      </div>

      {latestLogs.length > 0 ? (
        <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-card">
          <div className="border-b border-border p-4">
            <p className="text-sm font-black text-foreground">
              Latest nutrition logs
            </p>
            <p className="mt-1 text-sm font-semibold text-muted-foreground">
              Recent athlete hydration, meal quality and supplement notes.
            </p>
          </div>

          <div className="divide-y divide-border">
            {latestLogs.map((log: any) => (
              <article
                key={log._id}
                className="grid gap-3 p-4 md:grid-cols-[1.4fr_1fr_1fr_1fr]"
              >
                <div>
                  <p className="font-black text-foreground">
                    {log.athlete?.first_name} {log.athlete?.last_name}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-muted-foreground">
                    {workspace.teamName ?? "No team"} · {formatDate(log.date)}
                  </p>
                </div>
                <div>
                  <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-muted-foreground">
                    Hydration
                  </p>
                  <p className="mt-1 text-sm font-black text-foreground">
                    {log.hydration_ounces ?? "Not set"} oz
                  </p>
                </div>
                <div>
                  <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-muted-foreground">
                    Meal Quality
                  </p>
                  <p className="mt-1 text-sm font-black text-foreground">
                    {log.meal_quality ?? "Not set"}
                  </p>
                </div>
                <div>
                  <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-muted-foreground">
                    Supplements
                  </p>
                  <p className="mt-1 text-sm font-black text-foreground">
                    {log.supplements_taken ? "Yes" : "No"}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      ) : (
        <EmptyStateCard
          title="No nutrition logs yet"
          description="Add the first daily nutrition entry to start tracking habits."
          icon="solar:cup-hot-bold"
        />
      )}
    </section>
  );
}
