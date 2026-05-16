import { Icon } from "@iconify/react";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  DashboardHero,
  DetailStat,
  EmptyStateCard,
} from "../../../../components/dashboard/dashboard-cards";
import {
  absenceReasonLabel,
  bodyPainAreaLabel,
  sessionFocusAreaLabel,
  sessionPlannedIntensityLabel,
} from "../../../../lib/coach-vocabulary";
import { getSessionDetailData } from "../../../../lib/workspace";
import { SessionCardActions } from "../_components/session-card-actions";
import { SessionCompleteButton } from "../_components/session-complete-button";
import { SessionGenerateAiReportButton } from "../_components/session-generate-ai-report-button";
import { SessionTrainingBlocksButton } from "../_components/session-training-blocks-button";

function formatSessionType(type: string) {
  return type
    .split("_")
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ");
}

function formatStatus(value: string | null) {
  if (!value) {
    return "Planned";
  }

  return value
    .split("_")
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ");
}

function formatDate(value: string | null) {
  if (!value) {
    return "Not set";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function athleteLabel(
  athletes: Array<{
    id: string;
    first_name: string;
    last_name: string | null;
    number: number | null;
  }>,
  athleteId: string,
) {
  const athlete = athletes.find((row) => row.id === athleteId);

  if (!athlete) {
    return "Unknown athlete";
  }

  return [
    athlete.number ? `#${athlete.number}` : null,
    athlete.first_name,
    athlete.last_name,
  ]
    .filter(Boolean)
    .join(" ");
}

export default async function SessionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getSessionDetailData(id);

  if (!data) {
    notFound();
  }

  const { workspace, session, teams, athletes, latestAiReport } = data;
  const teamAthletes = athletes.filter(
    (athlete) => athlete.team_id === session.team_id,
  );

  return (
    <section className="bg-primary-50 px-5 py-6 md:px-8">
      <Link
        href="/sessions"
        className="inline-flex items-center gap-1.5 text-sm font-bold text-muted-foreground transition-colors hover:text-primary"
      >
        <Icon icon="solar:arrow-left-linear" className="size-4" />
        Back to sessions
      </Link>

      <DashboardHero
        eyebrow={session.teamName ?? workspace.organization.name}
        title={session.title}
        subtitle={`${formatSessionType(session.type)} · ${formatStatus(session.status)}`}
        mascotSrc="/maskotlar/hazirlik.png"
      />

      <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <div className="rounded-xl bg-primary-soft px-3 py-1.5 text-xs font-extrabold text-primary-700">
            {session.status ?? "planned"}
          </div>
          <SessionCompleteButton
            sessionId={session.id}
            status={session.status}
          />
        </div>
        <div className="flex flex-col items-start gap-2 md:items-end">
          <SessionCardActions
            session={session}
            teams={teams}
            athletes={athletes}
            redirectAfterDelete="/sessions"
          />
          <SessionTrainingBlocksButton session={session} />
        </div>
      </div>

      <div className="mt-4 grid gap-2 md:grid-cols-3 lg:grid-cols-6">
        <DetailStat label="Scheduled" value={formatDate(session.scheduled_at)} />
        <DetailStat label="Started" value={formatDate(session.started_at)} />
        <DetailStat label="Ended" value={formatDate(session.ended_at)} />
        <DetailStat
          label="Planned duration"
          value={
            session.planned_duration_min
              ? `${session.planned_duration_min} min`
              : "Not set"
          }
        />
        <DetailStat
          label="Intensity"
          value={sessionPlannedIntensityLabel(session.planned_intensity)}
        />
        <DetailStat label="Attendance rows" value={session.attendanceCount} />
      </div>

      {(session.location ||
        session.opponent ||
        session.focus_area ||
        session.description ||
        session.coach_notes) && (
        <div className="mt-4 rounded-3xl border border-border bg-card p-5">
          <p className="text-sm font-extrabold text-foreground">Session notes</p>
          <div className="mt-3 grid gap-2 text-sm font-medium text-muted-foreground">
            {session.location ? <p>Location: {session.location}</p> : null}
            {session.opponent ? <p>Opponent: {session.opponent}</p> : null}
            {session.focus_area ? (
              <p>Focus: {sessionFocusAreaLabel(session.focus_area)}</p>
            ) : null}
            {session.description ? <p>{session.description}</p> : null}
            {session.coach_notes ? (
              <p className="font-semibold text-foreground">{session.coach_notes}</p>
            ) : null}
          </div>
        </div>
      )}

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border border-border bg-card p-5">
          <p className="text-sm font-extrabold text-foreground">Attendance & RPE</p>
          {session.attendance.length === 0 ? (
            <EmptyStateCard
              title="No attendance yet"
              description="Open Attendance to add athletes and record minutes, RPE and absence reasons."
              icon="solar:checklist-minimalistic-bold"
            />
          ) : (
            <ul className="mt-4 space-y-3">
              {session.attendance.map((entry) => (
                <li
                  key={entry.id}
                  className="rounded-2xl border border-border bg-background px-4 py-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-extrabold text-foreground">
                      {athleteLabel(athletes, entry.athlete_id)}
                    </p>
                    <span
                      className={
                        entry.attended
                          ? "rounded-lg bg-primary-soft px-2 py-0.5 text-[10px] font-bold text-primary-700"
                          : "rounded-lg bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground"
                      }
                    >
                      {entry.attended ? "Present" : "Absent"}
                    </span>
                  </div>
                  <div className="mt-2 grid gap-1 text-xs font-medium text-muted-foreground">
                    {!entry.attended && entry.absence_reason ? (
                      <p>Reason: {absenceReasonLabel(entry.absence_reason)}</p>
                    ) : null}
                    {entry.minutes_played != null ? (
                      <p>Minutes: {entry.minutes_played}</p>
                    ) : null}
                    {entry.rpe != null ? <p>RPE: {entry.rpe}</p> : null}
                    {entry.pain_reported ? (
                      <p>
                        Pain:{" "}
                        {bodyPainAreaLabel(entry.pain_area) || "Reported"}
                      </p>
                    ) : null}
                    {entry.coach_note ? <p>Coach note: {entry.coach_note}</p> : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
          {teamAthletes.length > session.attendance.length ? (
            <p className="mt-3 text-xs font-medium text-muted-foreground">
              {teamAthletes.length - session.attendance.length} roster athlete(s)
              not yet added to this session.
            </p>
          ) : null}
        </div>

        <div className="rounded-3xl border border-border bg-card p-5">
          <p className="text-sm font-extrabold text-foreground">Training blocks</p>
          {session.trainingBlocks.length === 0 ? (
            <EmptyStateCard
              title="No blocks planned"
              description="Add warm-up, technical and conditioning blocks for this session."
              icon="solar:widget-5-bold"
            />
          ) : (
            <ol className="mt-4 space-y-3">
              {session.trainingBlocks.map((block, index) => (
                <li
                  key={block.id}
                  className="rounded-2xl border border-border bg-background px-4 py-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-extrabold text-foreground">
                      {index + 1}. {block.title}
                    </p>
                    {block.completed ? (
                      <Icon
                        icon="solar:check-circle-bold"
                        className="size-4 text-primary"
                      />
                    ) : null}
                  </div>
                  {block.description ? (
                    <p className="mt-1 text-xs font-medium text-muted-foreground">
                      {block.description}
                    </p>
                  ) : null}
                  <p className="mt-2 text-xs font-medium text-muted-foreground">
                    {block.planned_duration_min
                      ? `${block.planned_duration_min} min planned`
                      : "Duration not set"}
                    {block.intensity ? ` · intensity ${block.intensity}` : ""}
                  </p>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>

      <div className="mt-4">
        <SessionGenerateAiReportButton
          sessionId={session.id}
          existingReportId={latestAiReport?.id}
        />
        {latestAiReport?.summary ? (
          <div className="mt-3 rounded-2xl border border-border bg-card/80 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Latest analysis · {latestAiReport.model_provider ?? "ai"}
            </p>
            <p className="mt-2 text-sm font-medium leading-6 text-foreground">
              {latestAiReport.summary}
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
