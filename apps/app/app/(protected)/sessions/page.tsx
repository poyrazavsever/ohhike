import { PageHeader } from "../../../components/layout/page-header";
import { getSessionsData } from "../../../lib/workspace";
import { CreateSessionForm } from "./_components/create-session-form";

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

  return (
    <section className="px-5 py-8 md:px-8">
      <PageHeader
        eyebrow="Training Workflow"
        title="Sessions"
        description={`Plan sessions for ${workspace.organization.name}. Attendance and RPE workflows will build on this foundation.`}
      />

      <CreateSessionForm teams={teams} athletes={athletes} />

      {sessions.length > 0 ? (
        <div className="mt-6 grid gap-4">
          {sessions.map((session) => (
            <article
              key={session.id}
              className="rounded-3xl border border-border bg-card p-5"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <h2 className="text-lg font-extrabold text-foreground">
                    {session.title}
                  </h2>
                  <p className="mt-2 text-sm font-medium text-muted-foreground">
                    {session.teamName ?? "No team"} · {formatSessionType(session.type)}
                  </p>
                </div>
                <div className="rounded-2xl bg-primary-soft px-4 py-2 text-xs font-extrabold text-primary-700">
                  {session.status ?? "planned"}
                </div>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-4">
                <div className="rounded-2xl bg-background p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
                    Scheduled
                  </p>
                  <p className="mt-2 text-sm font-extrabold text-foreground">
                    {formatDate(session.scheduled_at)}
                  </p>
                </div>
                <div className="rounded-2xl bg-background p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
                    Duration
                  </p>
                  <p className="mt-2 text-sm font-extrabold text-foreground">
                    {session.planned_duration_min
                      ? `${session.planned_duration_min} min`
                      : "Not set"}
                  </p>
                </div>
                <div className="rounded-2xl bg-background p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
                    Intensity
                  </p>
                  <p className="mt-2 text-sm font-extrabold text-foreground">
                    {session.planned_intensity ?? "Not set"}
                  </p>
                </div>
                <div className="rounded-2xl bg-background p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
                    Attendance
                  </p>
                  <p className="mt-2 text-sm font-extrabold text-foreground">
                    {session.attendanceCount}
                  </p>
                </div>
              </div>

              {session.focus_area || session.coach_notes ? (
                <p className="mt-4 text-sm font-medium leading-6 text-muted-foreground">
                  {session.focus_area ? `Focus: ${session.focus_area}. ` : ""}
                  {session.coach_notes ?? ""}
                </p>
              ) : null}
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-3xl border border-dashed border-border bg-card p-8 text-center">
          <p className="text-sm font-bold text-foreground">
            No sessions planned yet
          </p>
          <p className="mt-2 text-sm font-medium text-muted-foreground">
            Create your first training session, match or recovery workflow.
          </p>
        </div>
      )}
    </section>
  );
}
