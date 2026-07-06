import {
  DashboardHero,
  EmptyStateCard,
  MetricCard,
} from "../../../components/dashboard/dashboard-cards";
import { getApiWorkspaceShellData } from "../../../lib/api-workspace";
import { getTeamWellness } from "../../../lib/api-daily";
import { fetchApi } from "../../../lib/api-client";
import { getTeamAthletes } from "../../../lib/api-athletes";
import { ReadinessCheckinForm } from "./_components/readiness-checkin-form";

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

export default async function ReadinessPage() {
  const workspace = await getApiWorkspaceShellData();
  const checkins = await getTeamWellness();
  const apiAthletes = await getTeamAthletes();
  const teams = await fetchApi(`/teams/${workspace.organizationId}`);

  // Form için gerekli (AthleteOption) formatına dönüştürüyoruz
  const athletes = apiAthletes.map((a: any) => ({
    ...a,
    id: a._id,
    number: null,
  }));

  const latestCheckins = checkins.slice(0, 8);
  const todayStr = new Date().toISOString().split("T")[0];
  const todayCheckins = checkins.filter(
    (c: any) => c.date && c.date.startsWith(todayStr),
  );

  const metricCards = [
    {
      label: "Today",
      value: todayCheckins.length.toString(),
      helper: "Check-ins submitted",
      icon: "solar:calendar-bold",
    },
    {
      label: "Avg Readiness",
      value: average(todayCheckins.map((checkin: any) => checkin.readiness_score)),
      helper: "Today score",
      icon: "solar:pulse-2-bold",
      tone: "info" as const,
    },
    {
      label: "Avg Fatigue",
      value: average(todayCheckins.map((checkin: any) => checkin.fatigue_level)),
      helper: "Lower is better",
      icon: "solar:shield-warning-bold",
      tone: "warning" as const,
    },
    {
      label: "Athletes",
      value: athletes.length.toString(),
      helper: "Available for check-in",
      icon: "solar:user-id-bold",
      tone: "secondary" as const,
    },
  ];

  return (
    <section className="bg-primary-50 px-5 py-6 md:px-8">
      <DashboardHero
        eyebrow="Performance Data"
        title="Readiness"
        subtitle={`Daily wellness overview for ${workspace.organizationName}.`}
        mascotSrc="/maskotlar/uykuu.png"
      />

      <div className="mt-4">
        <ReadinessCheckinForm athletes={athletes} />
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {metricCards.map((card) => (
          <MetricCard key={card.label} {...card} />
        ))}
      </div>

      {latestCheckins.length > 0 ? (
        <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-card">
          <div className="border-b border-border p-4">
            <p className="text-sm font-black text-foreground">
              Latest check-ins
            </p>
            <p className="mt-1 text-sm font-semibold text-muted-foreground">
              Recent athlete wellness entries and calculated readiness score.
            </p>
          </div>

          <div className="divide-y divide-border">
            {latestCheckins.map((checkin: any) => (
              <article
                key={checkin._id}
                className="grid gap-3 p-4 md:grid-cols-[1.4fr_1fr_1fr_1fr]"
              >
                <div>
                  <p className="font-black text-foreground">
                    {checkin.athlete?.first_name} {checkin.athlete?.last_name}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-muted-foreground">
                    {workspace.teamName ?? "No team"} ·{" "}
                    {formatDate(checkin.date)}
                  </p>
                </div>
                <div>
                  <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-muted-foreground">
                    Readiness
                  </p>
                  <p className="mt-1 text-sm font-black text-foreground">
                    {checkin.readiness_score ?? "No score"}
                  </p>
                </div>
                <div>
                  <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-muted-foreground">
                    Sleep
                  </p>
                  <p className="mt-1 text-sm font-black text-foreground">
                    {checkin.sleep_hours
                      ? `${checkin.sleep_hours}h`
                      : "Not set"}
                  </p>
                </div>
                <div>
                  <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-muted-foreground">
                    Fatigue / Stress
                  </p>
                  <p className="mt-1 text-sm font-black text-foreground">
                    {checkin.fatigue_level ?? "-"} / {checkin.stress_level ?? "-"}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      ) : (
        <EmptyStateCard
          title="No readiness check-ins yet"
          description="Add the first daily wellness entry to start tracking athlete readiness."
          icon="solar:pulse-2-bold"
        />
      )}
    </section>
  );
}
