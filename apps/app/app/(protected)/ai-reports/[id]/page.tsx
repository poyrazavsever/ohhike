import { Icon } from "@iconify/react";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  DashboardHero,
  DetailStat,
  EmptyStateCard,
} from "../../../../components/dashboard/dashboard-cards";
import {
  formatModelProvider,
  parseDrillList,
  parseObservationList,
  parseTrainingPlan,
} from "../../../../lib/ai-report-display";
import { getTeamEntitlement, getPrimaryTeamEntitlement } from "../../../../lib/billing/entitlements";
import { getAiReportDetailData } from "../../../../lib/workspace";
import { AiReportDetailActions } from "../_components/ai-report-detail-actions";
import { AiReportObservationSection } from "../_components/ai-report-observation-section";

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

export default async function AiReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getAiReportDetailData(id);

  if (!data) {
    notFound();
  }

  const { workspace, report } = data;
  const entitlement = report.team_id
    ? await getTeamEntitlement(report.team_id)
    : await getPrimaryTeamEntitlement(workspace.organization.id);

  const tactical = parseObservationList(report.tactical_observations);
  const athleteObs = parseObservationList(report.athlete_observations);
  const loadObs = parseObservationList(report.load_observations);
  const risks = parseObservationList(report.risk_alerts);
  const drills = parseDrillList(report.recommended_drills);
  const plan = parseTrainingPlan(report.next_training_plan);

  const hasStructuredSections =
    tactical.length > 0 ||
    athleteObs.length > 0 ||
    loadObs.length > 0 ||
    risks.length > 0 ||
    drills.length > 0 ||
    Boolean(plan?.focus || plan?.notes);

  return (
    <section className="bg-primary-50 px-5 py-6 md:px-8">
      <Link
        href="/ai-reports"
        className="inline-flex items-center gap-1.5 text-sm font-bold text-muted-foreground transition-colors hover:text-primary"
      >
        <Icon icon="solar:arrow-left-linear" className="size-4" />
        Back to AI reports
      </Link>

      <DashboardHero
        eyebrow={formatReportType(report.report_type)}
        title={report.title}
        subtitle={`${formatModelProvider(report.model_provider)} · ${report.model_name ?? "—"} · ${formatDate(report.created_at)}`}
        mascotSrc="/maskotlar/basardin.png"
      />

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="rounded-xl bg-primary-soft px-3 py-1.5 text-xs font-extrabold text-primary-700">
          {formatModelProvider(report.model_provider)}
          {report.prompt_version ? ` · ${report.prompt_version}` : ""}
        </div>
        <AiReportDetailActions reportId={report.id} />
      </div>

      <div className="mt-4 grid gap-2 md:grid-cols-2 lg:grid-cols-4">
        <DetailStat label="Team" value={report.teamName ?? "Not linked"} />
        <DetailStat label="Athlete" value={report.athleteName ?? "Not linked"} />
        <DetailStat
          label="Session"
          value={report.sessionTitle ?? "Not linked"}
        />
        <DetailStat
          label="Confidence"
          value={
            report.confidence_score != null
              ? `${Math.round(report.confidence_score * 100)}%`
              : "—"
          }
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {report.session_id ? (
          <Link
            href={`/sessions/${report.session_id}`}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-2 text-xs font-bold text-foreground transition-colors hover:border-primary"
          >
            <Icon icon="solar:clipboard-list-bold" className="size-3.5" />
            Open session
          </Link>
        ) : null}
        <Link
          href="/team-memory"
          className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-2 text-xs font-bold text-foreground transition-colors hover:border-primary"
        >
          <Icon icon="solar:chat-round-dots-bold" className="size-3.5" />
          Ask Team Memory
        </Link>
        {entitlement.pdf_export_enabled ? (
          <Link
            href={`/api/reports/export?reportId=${report.id}`}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-2 text-xs font-bold text-foreground transition-colors hover:border-primary"
          >
            <Icon icon="solar:file-download-bold" className="size-3.5" />
            Download PDF
          </Link>
        ) : null}
      </div>

      {report.summary ? (
        <div className="mt-4 rounded-3xl border border-border bg-card p-5">
          <p className="text-sm font-extrabold text-foreground">Summary</p>
          <p className="mt-3 text-sm font-medium leading-7 text-muted-foreground">
            {report.summary}
          </p>
        </div>
      ) : null}

      {hasStructuredSections ? (
        <div className="mt-4 grid gap-4 xl:grid-cols-2">
          <AiReportObservationSection title="Tactical" items={tactical} />
          <AiReportObservationSection title="Athlete notes" items={athleteObs} />
          <AiReportObservationSection title="Load" items={loadObs} />
          <AiReportObservationSection title="Risk alerts" items={risks} />
        </div>
      ) : (
        <div className="mt-4">
          <EmptyStateCard
            title="No structured sections"
            description="This report only has a summary, or it was created manually without analysis blocks."
            icon="solar:document-text-bold"
          />
        </div>
      )}

      {drills.length > 0 || plan?.focus || plan?.notes ? (
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {drills.length > 0 ? (
            <div className="rounded-3xl border border-border bg-card p-5">
              <p className="text-sm font-extrabold text-foreground">
                Recommended drills
              </p>
              <ul className="mt-4 space-y-3">
                {drills.map((drill, index) => (
                  <li
                    key={`drill-${index}`}
                    className="rounded-2xl border border-border bg-background px-4 py-3"
                  >
                    <p className="text-sm font-bold text-foreground">
                      {drill.title}
                    </p>
                    {drill.reason ? (
                      <p className="mt-1 text-xs font-medium text-muted-foreground">
                        {drill.reason}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {plan?.focus || plan?.notes ? (
            <div className="rounded-3xl border border-border bg-card p-5">
              <p className="text-sm font-extrabold text-foreground">
                Next training plan
              </p>
              {plan.focus ? (
                <p className="mt-3 text-sm font-bold text-foreground">
                  Focus: {plan.focus}
                </p>
              ) : null}
              {plan.notes ? (
                <p className="mt-2 text-sm font-medium leading-6 text-muted-foreground">
                  {plan.notes}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}

      <p className="mt-6 text-xs font-medium text-muted-foreground">
        Organization: {workspace.organization.name}
      </p>
    </section>
  );
}
