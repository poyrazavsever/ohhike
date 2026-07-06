import {
  DashboardHero,
  DetailStat,
  EmptyStateCard,
  MetricCard,
} from "../../../components/dashboard/dashboard-cards";
import { getApiWorkspaceShellData } from "../../../lib/api-workspace";
import { getTeamTraining } from "../../../lib/api-daily";
import { fetchApi } from "../../../lib/api-client";
import { getTeamAthletes } from "../../../lib/api-athletes";
import { CreatePersonalTrainingForm } from "./_components/create-personal-training-form";
import { PersonalTrainingRowActions } from "./_components/personal-training-row-actions";

function formatDate(date: string | null | undefined) {
  if (!date) {
    return "Not set";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

export default async function PersonalTrainingPage() {
  const workspace = await getApiWorkspaceShellData();
  const trainings = await getTeamTraining();
  const apiAthletes = await getTeamAthletes();
  const teams = await fetchApi(`/teams/${workspace.organizationId}`);

  // Form için gerekli (AthleteOption) formatına dönüştürüyoruz
  const athletes = apiAthletes.map((a: any) => ({
    ...a,
    id: a._id,
    number: null,
  }));

  const totalMinutes = trainings.reduce(
    (total: number, training: any) => total + (training.duration_minutes ?? 0),
    0,
  );

  const metricCards = [
    {
      label: "Entries",
      value: trainings.length.toString(),
      helper: "Logged sessions",
      icon: "solar:running-bold",
    },
    {
      label: "Minutes",
      value: totalMinutes.toString(),
      helper: "Total duration",
      icon: "solar:clock-circle-bold",
      tone: "info" as const,
    },
    {
      label: "Athletes",
      value: athletes.length.toString(),
      helper: "Available athletes",
      icon: "solar:user-id-bold",
      tone: "secondary" as const,
    },
  ];

  const canCoachReview = [
    "owner",
    "admin",
    "head_coach",
    "assistant_coach",
    "analyst",
  ].includes(workspace.role);

  return (
    <section className="bg-primary-50 px-5 py-6 md:px-8">
      <DashboardHero
        eyebrow="Performance Data"
        title="Personal Training"
        subtitle={`Extra work outside team sessions for ${workspace.organizationName}.`}
        mascotSrc="/maskotlar/kosu.png"
      />

      <CreatePersonalTrainingForm athletes={athletes} />

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {metricCards.map((card) => (
          <MetricCard key={card.label} {...card} />
        ))}
      </div>

      {trainings.length > 0 ? (
        <div className="mt-4 grid gap-3">
          {trainings.map((training: any) => (
            <article
              key={training._id}
              className="rounded-2xl border border-border bg-card p-4"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <h2 className="text-base font-black text-foreground capitalize">
                    {training.type ?? "Untitled training"}
                  </h2>
                  <p className="mt-1 text-sm font-semibold text-muted-foreground">
                    {training.athlete?.first_name} {training.athlete?.last_name}
                    {workspace.teamName ? ` · ${workspace.teamName}` : ""}
                  </p>
                </div>
                <PersonalTrainingRowActions
                  training={training}
                  athletes={athletes}
                  canCoachReview={canCoachReview}
                />
              </div>

              <div className="mt-4 grid gap-2 md:grid-cols-3">
                <DetailStat label="When" value={formatDate(training.date)} />
                <DetailStat
                  label="Duration"
                  value={
                    training.duration_minutes
                      ? `${training.duration_minutes} min`
                      : "Not set"
                  }
                />
                <DetailStat label="Intensity" value={training.intensity ?? "—"} />
              </div>

              {training.notes ? (
                <p className="mt-3 text-sm font-semibold leading-6 text-muted-foreground">
                  {training.notes}
                </p>
              ) : null}
            </article>
          ))}
        </div>
      ) : (
        <EmptyStateCard
          title="No personal training logged yet"
          description="Athletes can log extra work from their portal, or coaches can add entries here."
          icon="solar:running-bold"
        />
      )}
    </section>
  );
}
