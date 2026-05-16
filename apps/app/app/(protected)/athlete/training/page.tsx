import {
  DashboardHero,
  DetailStat,
  EmptyStateCard,
} from "../../../../components/dashboard/dashboard-cards";
import { personalTrainingTypeLabel } from "../../../../lib/coach-vocabulary";
import { getAthletePersonalTrainingsData } from "../../../../lib/athlete-portal";
import { AthleteSelfPersonalTrainingForm } from "../_components/athlete-portal-forms";

function formatDate(value: string | null) {
  if (!value) {
    return "Not set";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function AthleteTrainingPage() {
  const { portal, trainings } = await getAthletePersonalTrainingsData();

  return (
    <section className="bg-primary-50 px-5 py-6 md:px-8">
      <DashboardHero
        eyebrow={portal.teamName ?? portal.workspace.organization.name}
        title="Personal training"
        subtitle="Log extra sessions your coach should see in load planning."
        mascotSrc="/maskotlar/kosu.png"
      />

      <AthleteSelfPersonalTrainingForm athleteId={portal.athlete.id} />

      {trainings.length > 0 ? (
        <div className="mt-6 grid gap-3">
          {trainings.map((training) => (
            <article
              key={training.id}
              className="rounded-2xl border border-border bg-card p-4"
            >
              <h2 className="text-base font-black text-foreground">
                {training.title ?? "Training"}
              </h2>
              <p className="mt-1 text-sm font-semibold text-muted-foreground">
                {personalTrainingTypeLabel(training.training_type)}
              </p>
              <div className="mt-4 grid gap-2 md:grid-cols-4">
                <DetailStat label="When" value={formatDate(training.started_at)} />
                <DetailStat
                  label="Duration"
                  value={
                    training.duration_min
                      ? `${training.duration_min} min`
                      : "—"
                  }
                />
                <DetailStat label="RPE" value={training.rpe ?? "—"} />
                <DetailStat
                  label="Coach review"
                  value={training.coach_reviewed ? "Reviewed" : "Pending"}
                />
              </div>
              {training.notes ? (
                <p className="mt-3 text-sm font-medium text-muted-foreground">
                  {training.notes}
                </p>
              ) : null}
              {training.coach_note ? (
                <p className="mt-2 text-sm font-bold text-foreground">
                  Coach note: {training.coach_note}
                </p>
              ) : null}
            </article>
          ))}
        </div>
      ) : (
        <EmptyStateCard
          title="No personal training yet"
          description="Use Log personal training after gym work, skills practice or recovery sessions."
          icon="solar:running-bold"
        />
      )}
    </section>
  );
}
