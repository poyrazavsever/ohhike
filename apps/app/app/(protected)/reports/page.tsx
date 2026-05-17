import {
  DashboardHero,
  DetailStat,
  EmptyStateCard,
  MetricCard,
} from "../../../components/dashboard/dashboard-cards";
import { FeatureLockedCard } from "../../../components/dashboard/feature-locked-card";
import { getPrimaryTeamEntitlement } from "../../../lib/billing/entitlements";
import { getReportsData } from "../../../lib/workspace";

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

export default async function ReportsPage() {
  const { workspace, aiReports, totals } = await getReportsData();
  const entitlement = await getPrimaryTeamEntitlement(workspace.organization.id);

  const metricCards = [
    {
      label: "AI Reports",
      value: totals.aiReports.toString(),
      helper: "Recent report records",
      icon: "solar:document-add-bold",
    },
    {
      label: "Sessions",
      value: totals.sessions.toString(),
      helper: "Report source data",
      icon: "solar:clipboard-list-bold",
      tone: "info" as const,
    },
    {
      label: "Readiness",
      value: totals.readinessCheckins.toString(),
      helper: "Wellness entries",
      icon: "solar:pulse-2-bold",
      tone: "secondary" as const,
    },
    {
      label: "Wearables",
      value: totals.wearableActivities.toString(),
      helper: "Activity rows",
      icon: "solar:watch-round-bold",
      tone: "warning" as const,
    },
  ];

  return (
    <section className="bg-primary-50 px-5 py-6 md:px-8">
      <DashboardHero
        eyebrow="AI Intelligence"
        title="Reports"
        subtitle={`Export and report center for ${workspace.organization.name}.`}
        mascotSrc="/maskotlar/elleIsaretEtme.png"
      />

      {!entitlement.pdf_export_enabled ? (
        <FeatureLockedCard
          title="PDF export is not included in the current plan"
          description="Report records remain visible on every plan. PDF exports will be available to Pro and Pro Plus teams when the export pipeline is released."
        />
      ) : null}

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {metricCards.map((card) => (
          <MetricCard key={card.label} {...card} />
        ))}
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_0.85fr]">
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="border-b border-border p-4">
            <p className="text-sm font-black text-foreground">
              Recent AI reports
            </p>
            <p className="mt-1 text-sm font-semibold text-muted-foreground">
              Saved AI report records that can become downloadable exports.
            </p>
          </div>

          {aiReports.length > 0 ? (
            <div className="divide-y divide-border">
              {aiReports.map((report) => (
                <article
                  key={report.id}
                  className="grid gap-3 p-4 md:grid-cols-[1.4fr_0.8fr_0.8fr_auto]"
                >
                  <div>
                    <p className="font-black text-foreground">
                      {report.title}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-muted-foreground">
                      {formatReportType(report.report_type)} ·{" "}
                      {formatDate(report.created_at)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-muted-foreground">
                      Team
                    </p>
                    <p className="mt-1 truncate text-sm font-black text-foreground">
                      {report.teamName ?? "Not linked"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-muted-foreground">
                      Provider
                    </p>
                    <p className="mt-1 text-sm font-black text-foreground">
                      {report.model_provider ?? "manual"}
                    </p>
                  </div>
                  <div className="flex items-center">
                    {entitlement.pdf_export_enabled ? (
                      <Link
                        href={`/api/reports/export?reportId=${report.id}`}
                        className="inline-flex items-center rounded-xl border border-border px-3 py-2 text-xs font-bold text-foreground transition-colors hover:border-primary"
                      >
                        PDF
                      </Link>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <EmptyStateCard
              title="No AI reports yet"
              description="Create report drafts in AI Reports to populate this center."
              icon="solar:file-download-bold"
            />
          )}
        </div>

        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-sm font-black text-foreground">
            Export pipeline
          </p>
          <p className="mt-2 text-sm font-semibold leading-6 text-muted-foreground">
            PDF/CSV exports will build on the records shown here. Current scope
            is the report registry and source-data overview.
          </p>

          <div className="mt-4 grid gap-2">
            <DetailStat label="Nutrition logs" value={totals.nutritionLogs} />
            <DetailStat
              label="Export access"
              value={entitlement.pdf_export_enabled ? "Included" : "Not included"}
            />
            <DetailStat label="Next step" value="Report templates" />
          </div>
        </div>
      </div>
    </section>
  );
}
import Link from "next/link";
