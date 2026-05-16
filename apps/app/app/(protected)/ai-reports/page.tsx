import { Icon } from "@iconify/react";
import Link from "next/link";

import {
  DashboardHero,
  DetailStat,
  EmptyStateCard,
  MetricCard,
} from "../../../components/dashboard/dashboard-cards";
import { formatModelProvider } from "../../../lib/ai-report-display";
import { getAiReportsData } from "../../../lib/workspace";
import { CreateAiReportForm } from "./_components/create-ai-report-form";

function formatReportType(value: string) {
  return value
    .split("_")
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ");
}

function formatDate(value: string | null) {
  if (!value) {
    return "Unknown";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function AiReportsPage() {
  const { workspace, reports, teams, athletes, sessions, totals } =
    await getAiReportsData();

  const metricCards = [
    {
      label: "Reports",
      value: totals.reports.toString(),
      helper: "Saved report records",
      icon: "solar:document-add-bold",
    },
    {
      label: "Session",
      value: totals.sessionReports.toString(),
      helper: "Linked to sessions",
      icon: "solar:clipboard-list-bold",
      tone: "info" as const,
    },
    {
      label: "Athlete",
      value: totals.athleteReports.toString(),
      helper: "Linked to athletes",
      icon: "solar:user-id-bold",
      tone: "secondary" as const,
    },
    {
      label: "Team",
      value: totals.teamReports.toString(),
      helper: "Linked to teams",
      icon: "solar:users-group-rounded-bold",
      tone: "warning" as const,
    },
  ];

  return (
    <section className="bg-primary-50 px-5 py-6 md:px-8">
      <DashboardHero
        eyebrow="AI Intelligence"
        title="AI Reports"
        subtitle={`AI report registry for ${workspace.organization.name}.`}
        mascotSrc="/maskotlar/basardin.png"
      />

      <div className="mt-4">
        <CreateAiReportForm teams={teams} athletes={athletes} sessions={sessions} />
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {metricCards.map((card) => (
          <MetricCard key={card.label} {...card} />
        ))}
      </div>

      {reports.length > 0 ? (
        <div className="mt-4 grid gap-3">
          {reports.map((report) => (
            <article
              key={report.id}
              className="rounded-2xl border border-border bg-card p-4"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <h2 className="text-base font-black text-foreground">
                    {report.title}
                  </h2>
                  <p className="mt-1 text-sm font-semibold text-muted-foreground">
                    {formatReportType(report.report_type)} ·{" "}
                    {formatDate(report.created_at)}
                  </p>
                </div>
                <div className="rounded-xl bg-primary-soft px-3 py-1.5 text-xs font-extrabold text-primary-700">
                  {formatModelProvider(report.model_provider)}
                </div>
              </div>

              <div className="mt-4 grid gap-2 md:grid-cols-4">
                <DetailStat
                  label="Team"
                  value={report.teamName ?? "Not linked"}
                />
                <DetailStat
                  label="Athlete"
                  value={report.athleteName ?? "Not linked"}
                />
                <DetailStat
                  label="Session"
                  value={report.sessionTitle ?? "Not linked"}
                />
                <DetailStat
                  label="Confidence"
                  value={report.confidence_score ?? "Draft"}
                />
              </div>

              {report.summary ? (
                <p className="mt-3 line-clamp-2 text-sm font-semibold leading-6 text-muted-foreground">
                  {report.summary}
                </p>
              ) : null}

              <div className="mt-4">
                <Link
                  href={`/ai-reports/${report.id}`}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs font-bold text-foreground transition-colors hover:border-primary"
                >
                  <Icon icon="solar:arrow-right-linear" className="size-3.5" />
                  View report
                </Link>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyStateCard
          title="No AI reports yet"
          description="Add a report draft to prepare the AI analysis workflow."
          icon="solar:document-add-bold"
        />
      )}
    </section>
  );
}
