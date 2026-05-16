import {
  DashboardHero,
  DetailStat,
  EmptyStateCard,
  MetricCard,
} from "../../../components/dashboard/dashboard-cards";
import { personalTrainingTypeLabel } from "../../../lib/coach-vocabulary";
import { getPersonalTrainingsData } from "../../../lib/workspace";
import { CreatePersonalTrainingForm } from "./_components/create-personal-training-form";
import { PersonalTrainingRowActions } from "./_components/personal-training-row-actions";

function formatDate(value: string | null) {
  if (!value) {
    return "Not set";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function PersonalTrainingPage() {
  const { workspace, trainings, athletes } = await getPersonalTrainingsData();

  const withRpe = trainings.filter((training) => training.rpe != null);
  const reviewed = trainings.filter((training) => training.coach_reviewed);
  const totalMinutes = trainings.reduce(
    (total, training) => total + (training.duration_min ?? 0),
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
      label: "With RPE",
      value: withRpe.length.toString(),
      helper: "Load signal captured",
      icon: "solar:chart-2-bold",
      tone: "secondary" as const,
    },
    {
      label: "Reviewed",
      value: reviewed.length.toString(),
      helper: "Coach reviewed",
      icon: "solar:check-circle-bold",
      tone: "warning" as const,
    },
  ];

  const canCoachReview = [
    "owner",
    "admin",
    "head_coach",
    "assistant_coach",
    "analyst",
  ].includes(workspace.membership.role);

  return (
    <section className="bg-primary-50 px-5 py-6 md:px-8">
      <DashboardHero
        eyebrow="Performance Data"
        title="Personal Training"
        subtitle={`Extra work outside team sessions for ${workspace.organization.name}.`}
        mascotSrc="/maskotlar/kosu.png"
      />

      <CreatePersonalTrainingForm athletes={athletes} />

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {metricCards.map((card) => (
          <MetricCard key={card.label} {...card} />
        ))}
      </div>

      {trainings.length > 0 ? (
        <div className="mt-4 grid gap-3">
          {trainings.map((training) => (
            <article
              key={training.id}
              className="rounded-2xl border border-border bg-card p-4"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <h2 className="text-base font-black text-foreground">
                    {training.title ?? "Untitled training"}
                  </h2>
                  <p className="mt-1 text-sm font-semibold text-muted-foreground">
                    {training.athleteName}
                    {training.teamName ? ` · ${training.teamName}` : ""} ·{" "}
                    {personalTrainingTypeLabel(training.training_type)}
                  </p>
                </div>
                <PersonalTrainingRowActions
                  training={training}
                  athletes={athletes}
                  canCoachReview={canCoachReview}
                />
              </div>

              <div className="mt-4 grid gap-2 md:grid-cols-5">
                <DetailStat label="When" value={formatDate(training.started_at)} />
                <DetailStat
                  label="Duration"
                  value={
                    training.duration_min
                      ? `${training.duration_min} min`
                      : "Not set"
                  }
                />
                <DetailStat label="RPE" value={training.rpe ?? "—"} />
                <DetailStat
                  label="Distance"
                  value={
                    training.distance_km != null
                      ? `${training.distance_km} km`
                      : "—"
                  }
                />
                <DetailStat
                  label="Reviewed"
                  value={training.coach_reviewed ? "Yes" : "Pending"}
                />
              </div>

              {training.notes ? (
                <p className="mt-3 text-sm font-semibold leading-6 text-muted-foreground">
                  {training.notes}
                </p>
              ) : null}
              {training.coach_note ? (
                <p className="mt-2 text-sm font-bold text-foreground">
                  Coach: {training.coach_note}
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
