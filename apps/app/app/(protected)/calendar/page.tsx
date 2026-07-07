import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  DashboardHero,
  MetricCard,
} from "../../../components/dashboard/dashboard-cards";
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
    <Card className="grid gap-3 p-4 shadow-sm hover:shadow-md transition-shadow md:grid-cols-[0.8fr_1.4fr_0.8fr_0.8fr]">
      <div>
        <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-muted-foreground">
          Date
        </p>
        <p className="mt-1 text-sm font-black text-foreground">
          {formatDate(session.scheduled_at)}
        </p>
        <p className="mt-1 text-xs font-semibold text-muted-foreground">
          {formatTime(session.scheduled_at)}
        </p>
      </div>
      <div>
        <p className="font-black text-foreground">{session.title}</p>
        <p className="mt-1 text-sm font-semibold text-muted-foreground">
          {session.teamName ?? "No team"} · {formatSessionType(session.type)}
        </p>
      </div>
      <div>
        <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-muted-foreground">
          Location
        </p>
        <p className="mt-1 text-sm font-black text-foreground">
          {session.location ?? "Not set"}
        </p>
      </div>
      <div>
        <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-muted-foreground">
          Status
        </p>
        <p className="mt-1 text-sm font-black text-foreground">
          {session.status ?? "planned"}
        </p>
      </div>
    </Card>
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
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-3 pb-4 space-y-0">
        <div>
          <CardTitle className="text-sm font-black">{title}</CardTitle>
          <CardDescription className="mt-1 text-sm font-medium">
            {description}
          </CardDescription>
        </div>
        <div className="rounded-xl bg-primary/10 px-3 py-1.5 text-xs font-extrabold text-primary">
          {sessions.length}
        </div>
      </CardHeader>
      <CardContent className="grid gap-3 pt-0">
        {sessions.length > 0 ? (
          sessions.map((session) => (
            <SessionRow key={session.id} session={session} />
          ))
        ) : (
          <div className="rounded-xl border border-dashed bg-transparent p-6 text-center">
            <p className="text-sm font-semibold text-muted-foreground">
              No sessions in this section.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default async function CalendarPage() {
  const { workspace, sessions } = await getCalendarData();
  const { upcoming, recent, unscheduled } = splitSessions(sessions);
  const scheduledCount = sessions.filter((session) => session.scheduled_at).length;

  const metricCards = [
    {
      label: "Scheduled",
      value: scheduledCount.toString(),
      helper: "Sessions with date",
      icon: "solar:calendar-mark-bold",
    },
    {
      label: "Upcoming",
      value: upcoming.length.toString(),
      helper: "Next sessions",
      icon: "solar:calendar-add-bold",
      tone: "info" as const,
    },
    {
      label: "Unscheduled",
      value: unscheduled.length.toString(),
      helper: "Need planning",
      icon: "solar:calendar-minimalistic-bold",
      tone: "warning" as const,
    },
    {
      label: "Total",
      value: sessions.length.toString(),
      helper: "Loaded sessions",
      icon: "solar:clipboard-list-bold",
      tone: "secondary" as const,
    },
  ];

  return (
    <section className="bg-primary-50 px-5 py-6 md:px-8">
      <DashboardHero
        eyebrow="Workspace"
        title="Calendar"
        subtitle={`Session calendar for ${workspace.organization.name}.`}
        mascotSrc="/maskotlar/gozetleme.png"
      />

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {metricCards.map((card) => (
          <MetricCard key={card.label} {...card} />
        ))}
      </div>

      <div className="mt-4 grid gap-4">
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
