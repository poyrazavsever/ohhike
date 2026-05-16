import { PageHeader } from "../../../components/layout/page-header";
import { getCalendarData, type CalendarSession } from "../../../lib/workspace";

function formatDate(value: string | null) {
  if (!value) {
    return "Not scheduled";
  }

  return new Intl.DateTimeFormat("en", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

function formatTime(value: string | null) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("en", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatSessionType(type: string) {
  return type
    .split("_")
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ");
}

function splitSessions(sessions: CalendarSession[]) {
  const now = Date.now();

  return {
    upcoming: sessions
      .filter(
        (session) =>
          session.scheduled_at && new Date(session.scheduled_at).getTime() >= now,
      )
      .slice(0, 12),
    recent: sessions
      .filter(
        (session) =>
          session.scheduled_at && new Date(session.scheduled_at).getTime() < now,
      )
      .reverse()
      .slice(0, 8),
    unscheduled: sessions.filter((session) => !session.scheduled_at).slice(0, 8),
  };
}

function SessionRow({ session }: { session: CalendarSession }) {
  return (
    <article className="grid gap-4 rounded-2xl border border-border bg-background p-4 md:grid-cols-[0.8fr_1.4fr_0.8fr_0.8fr]">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
          Date
        </p>
        <p className="mt-2 text-sm font-extrabold text-foreground">
          {formatDate(session.scheduled_at)}
        </p>
        <p className="mt-1 text-xs font-medium text-muted-foreground">
          {formatTime(session.scheduled_at)}
        </p>
      </div>
      <div>
        <p className="font-extrabold text-foreground">{session.title}</p>
        <p className="mt-1 text-sm font-medium text-muted-foreground">
          {session.teamName ?? "No team"} · {formatSessionType(session.type)}
        </p>
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
          Location
        </p>
        <p className="mt-2 text-sm font-extrabold text-foreground">
          {session.location ?? "Not set"}
        </p>
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
          Status
        </p>
        <p className="mt-2 text-sm font-extrabold text-foreground">
          {session.status ?? "planned"}
        </p>
      </div>
    </article>
  );
}

function SessionSection({
  title,
  description,
  sessions,
}: {
  title: string;
  description: string;
  sessions: CalendarSession[];
}) {
  return (
    <div className="rounded-3xl border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-extrabold text-foreground">{title}</p>
          <p className="mt-1 text-sm font-medium text-muted-foreground">
            {description}
          </p>
        </div>
        <div className="rounded-2xl bg-primary-soft px-4 py-2 text-xs font-extrabold text-primary-700">
          {sessions.length}
        </div>
      </div>

      <div className="mt-5 grid gap-3">
        {sessions.length > 0 ? (
          sessions.map((session) => (
            <SessionRow key={session.id} session={session} />
          ))
        ) : (
          <p className="rounded-2xl border border-dashed border-border bg-background p-5 text-center text-sm font-medium text-muted-foreground">
            No sessions in this section.
          </p>
        )}
      </div>
    </div>
  );
}

export default async function CalendarPage() {
  const { workspace, sessions } = await getCalendarData();
  const { upcoming, recent, unscheduled } = splitSessions(sessions);
  const scheduledCount = sessions.filter((session) => session.scheduled_at).length;

  const cards = [
    {
      label: "Scheduled",
      value: scheduledCount.toString(),
      helper: "Sessions with date",
    },
    {
      label: "Upcoming",
      value: upcoming.length.toString(),
      helper: "Next sessions",
    },
    {
      label: "Unscheduled",
      value: unscheduled.length.toString(),
      helper: "Need planning",
    },
    {
      label: "Total",
      value: sessions.length.toString(),
      helper: "Loaded sessions",
    },
  ];

  return (
    <section className="px-5 py-8 md:px-8">
      <PageHeader
        eyebrow="Workspace"
        title="Calendar"
        description={`Session calendar for ${workspace.organization.name}.`}
      />

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

      <div className="mt-6 grid gap-6">
        <SessionSection
          title="Upcoming"
          description="Scheduled sessions from now forward."
          sessions={upcoming}
        />
        <SessionSection
          title="Unscheduled"
          description="Sessions that still need a date and time."
          sessions={unscheduled}
        />
        <SessionSection
          title="Recent"
          description="Recently completed or past scheduled sessions."
          sessions={recent}
        />
      </div>
    </section>
  );
}
