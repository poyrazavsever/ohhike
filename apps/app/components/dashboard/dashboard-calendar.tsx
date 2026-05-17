import { Icon } from "@iconify/react";
import Link from "next/link";

import type { CalendarSession } from "../../lib/workspace";

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function formatMonth(date: Date) {
  return new Intl.DateTimeFormat("en", {
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatAgendaDate(value: string | null) {
  if (!value) {
    return "Unscheduled";
  }

  return new Intl.DateTimeFormat("en", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

function formatAgendaTime(value: string | null) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("en", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function buildMonthDays(monthDate: Date) {
  const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const calendarStart = new Date(monthStart);
  calendarStart.setDate(monthStart.getDate() - monthStart.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(calendarStart);
    date.setDate(calendarStart.getDate() + index);
    return date;
  });
}

function dateKey(value: Date) {
  return `${value.getFullYear()}-${value.getMonth()}-${value.getDate()}`;
}

function getUpcomingSessions(sessions: CalendarSession[]) {
  const now = Date.now();

  return sessions
    .filter(
      (session) =>
        session.scheduled_at && new Date(session.scheduled_at).getTime() >= now,
    )
    .slice(0, 4);
}

export function DashboardMiniCalendar({
  sessions,
}: {
  sessions: CalendarSession[];
}) {
  const now = new Date();
  const days = buildMonthDays(now);
  const todayKey = dateKey(startOfDay(now));
  const sessionDayKeys = new Set(
    sessions
      .filter((session) => session.scheduled_at)
      .map((session) => dateKey(startOfDay(new Date(session.scheduled_at!)))),
  );

  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-black text-foreground">Calendar</p>
          <p className="mt-1 text-xs font-semibold text-muted-foreground">
            {formatMonth(now)}
          </p>
        </div>
        <Link
          href="/calendar"
          className="text-xs font-extrabold text-primary-700 transition-colors hover:text-primary-hover"
        >
          View all
        </Link>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-1 text-center text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-muted-foreground">
        {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
          <span key={`${day}-${index}`}>{day}</span>
        ))}
      </div>

      <div className="mt-2 grid grid-cols-7 gap-1">
        {days.map((day) => {
          const key = dateKey(day);
          const isCurrentMonth = day.getMonth() === now.getMonth();
          const isToday = key === todayKey;
          const hasSession = sessionDayKeys.has(key);

          return (
            <div
              key={day.toISOString()}
              className={[
                "relative grid aspect-square place-items-center rounded-lg text-xs font-bold",
                isCurrentMonth ? "text-foreground" : "text-muted-foreground/45",
                isToday
                  ? "bg-primary text-primary-foreground"
                  : "bg-background",
              ].join(" ")}
            >
              {day.getDate()}
              {hasSession ? (
                <span
                  className={[
                    "absolute bottom-1 size-1.5 rounded-full",
                    isToday ? "bg-primary-foreground" : "bg-secondary",
                  ].join(" ")}
                />
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function DashboardAgenda({
  sessions,
  title = "Upcoming sessions",
}: {
  sessions: CalendarSession[];
  title?: string;
}) {
  const upcoming = getUpcomingSessions(sessions);

  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-black text-foreground">{title}</p>
        <span className="rounded-xl bg-primary-soft px-2.5 py-1 text-xs font-extrabold text-primary-700">
          {upcoming.length}
        </span>
      </div>

      <div className="mt-3 grid gap-2">
        {upcoming.length > 0 ? (
          upcoming.map((session) => (
            <article
              key={session.id}
              className="flex items-start gap-3 rounded-xl bg-background p-3"
            >
              <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-info-soft text-info-foreground">
                <Icon icon="solar:calendar-mark-bold" className="size-4" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-black text-foreground">
                  {session.title}
                </p>
                <p className="mt-1 text-xs font-semibold text-muted-foreground">
                  {formatAgendaDate(session.scheduled_at)} ·{" "}
                  {formatAgendaTime(session.scheduled_at)}
                </p>
                <p className="mt-1 truncate text-xs font-semibold text-muted-foreground">
                  {session.teamName ?? "No team"} ·{" "}
                  {session.location ?? "Location not set"}
                </p>
              </div>
            </article>
          ))
        ) : (
          <p className="rounded-xl border border-dashed border-border bg-background p-4 text-center text-sm font-semibold text-muted-foreground">
            No upcoming sessions scheduled.
          </p>
        )}
      </div>
    </section>
  );
}
