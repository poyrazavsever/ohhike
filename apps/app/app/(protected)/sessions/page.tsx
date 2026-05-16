import {
  DashboardHero,
  DetailStat,
  EmptyStateCard,
  MetricCard,
} from "../../../components/dashboard/dashboard-cards";
import { getSessionsData } from "../../../lib/workspace";
import { CreateSessionForm } from "./_components/create-session-form";
import { SessionCardActions } from "./_components/session-card-actions";
import { SessionTrainingBlocksButton } from "./_components/session-training-blocks-button";

function formatSessionType(type: string) {
  return type
    .split("_")
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ");
}

function formatDate(value: string | null) {
  if (!value) {
    return "Not scheduled";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function SessionsPage() {
  const { workspace, sessions, teams, athletes } = await getSessionsData();
  const scheduledCount = sessions.filter((session) => session.scheduled_at).length;
  const attendanceCount = sessions.reduce(
    (total, session) => total + session.attendanceCount,
    0,
  );
  const blockCount = sessions.reduce(
    (total, session) => total + session.trainingBlocks.length,
    0,
  );

  return (
    <section className="bg-primary-50 px-5 py-6 md:px-8">
      <DashboardHero
        eyebrow="Training Workflow"
        title="Sessions"
        subtitle={`Plan sessions, attendance and RPE workflows for ${workspace.organization.name}.`}
        mascotSrc="/maskotlar/hazirlik.png"
      />

      <div className="mt-4">
        <CreateSessionForm teams={teams} athletes={athletes} />
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-4">
        <MetricCard
          label="Sessions"
          value={sessions.length.toString()}
          helper="Total workflows"
          icon="solar:clipboard-list-bold"
        />
        <MetricCard
          label="Scheduled"
          value={scheduledCount.toString()}
          helper="Have date and time"
          icon="solar:calendar-mark-bold"
          tone="info"
        />
        <MetricCard
          label="Attendance"
          value={attendanceCount.toString()}
          helper="Athlete entries"
          icon="solar:user-check-rounded-bold"
          tone="secondary"
        />
        <MetricCard
          label="Blocks"
          value={blockCount.toString()}
          helper="Training blocks"
          icon="solar:widget-5-bold"
          tone="warning"
        />
      </div>

      {sessions.length > 0 ? (
        <div className="mt-4 grid gap-3">
          {sessions.map((session) => (
            <article
              key={session.id}
              className="rounded-2xl border border-border bg-card p-4"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <h2 className="text-base font-black text-foreground">
                    {session.title}
                  </h2>
                  <p className="mt-1 text-sm font-semibold text-muted-foreground">
                    {session.teamName ?? "No team"} · {formatSessionType(session.type)}
                  </p>
                </div>
                <div className="flex flex-col items-start gap-2 md:items-end">
                  <div className="rounded-xl bg-primary-soft px-3 py-1.5 text-xs font-extrabold text-primary-700">
                    {session.status ?? "planned"}
                  </div>
                  <SessionCardActions
                    session={session}
                    teams={teams}
                    athletes={athletes}
                  />
                  <SessionTrainingBlocksButton session={session} />
                </div>
              </div>

              <div className="mt-4 grid gap-2 md:grid-cols-5">
                <DetailStat label="Scheduled" value={formatDate(session.scheduled_at)} />
                <DetailStat
                  label="Duration"
                  value={
                    session.planned_duration_min
                      ? `${session.planned_duration_min} min`
                      : "Not set"
                  }
                />
                <DetailStat
                  label="Intensity"
                  value={session.planned_intensity ?? "Not set"}
                />
                <DetailStat label="Attendance" value={session.attendanceCount} />
                <DetailStat label="Blocks" value={session.trainingBlocks.length} />
              </div>

              {session.focus_area || session.coach_notes ? (
                <p className="mt-3 text-sm font-semibold leading-6 text-muted-foreground">
                  {session.focus_area ? `Focus: ${session.focus_area}. ` : ""}
                  {session.coach_notes ?? ""}
                </p>
              ) : null}
            </article>
          ))}
        </div>
      ) : (
        <EmptyStateCard
          title="No sessions planned yet"
          description="Create your first training session, match or recovery workflow."
          icon="solar:clipboard-list-bold"
        />
      )}
    </section>
  );
}
