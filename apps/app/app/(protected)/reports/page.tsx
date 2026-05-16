import { PageHeader } from "../../../components/layout/page-header";
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

  const cards = [
    {
      label: "AI Reports",
      value: totals.aiReports.toString(),
      helper: "Recent report records",
    },
    {
      label: "Sessions",
      value: totals.sessions.toString(),
      helper: "Report source data",
    },
    {
      label: "Readiness",
      value: totals.readinessCheckins.toString(),
      helper: "Wellness entries",
    },
    {
      label: "Wearables",
      value: totals.wearableActivities.toString(),
      helper: "Activity rows",
    },
  ];

  return (
    <section className="px-5 py-8 md:px-8">
      <PageHeader
        eyebrow="AI Intelligence"
        title="Reports"
        description={`Export and report center for ${workspace.organization.name}.`}
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

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_0.85fr]">
        <div className="overflow-hidden rounded-3xl border border-border bg-card">
          <div className="border-b border-border p-5">
            <p className="text-sm font-extrabold text-foreground">
              Recent AI reports
            </p>
            <p className="mt-1 text-sm font-medium text-muted-foreground">
              Saved AI report records that can become downloadable exports.
            </p>
          </div>

          {aiReports.length > 0 ? (
            <div className="divide-y divide-border">
              {aiReports.map((report) => (
                <article
                  key={report.id}
                  className="grid gap-4 p-5 md:grid-cols-[1.4fr_0.8fr_0.8fr]"
                >
                  <div>
                    <p className="font-extrabold text-foreground">
                      {report.title}
                    </p>
                    <p className="mt-1 text-xs font-medium text-muted-foreground">
                      {formatReportType(report.report_type)} ·{" "}
                      {formatDate(report.created_at)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
                      Team
                    </p>
                    <p className="mt-2 truncate text-sm font-extrabold text-foreground">
                      {report.teamName ?? "Not linked"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
                      Provider
                    </p>
                    <p className="mt-2 text-sm font-extrabold text-foreground">
                      {report.model_provider ?? "manual"}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <p className="text-sm font-bold text-foreground">
                No AI reports yet
              </p>
              <p className="mt-2 text-sm font-medium text-muted-foreground">
                Create report drafts in AI Reports to populate this center.
              </p>
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-border bg-card p-5">
          <p className="text-sm font-extrabold text-foreground">
            Export pipeline
          </p>
          <p className="mt-2 text-sm font-medium leading-6 text-muted-foreground">
            PDF/CSV exports will build on the records shown here. Current scope
            is the report registry and source-data overview.
          </p>

          <div className="mt-5 grid gap-3">
            <div className="rounded-2xl bg-background p-4">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
                Nutrition logs
              </p>
              <p className="mt-2 text-sm font-extrabold text-foreground">
                {totals.nutritionLogs}
              </p>
            </div>
            <div className="rounded-2xl bg-background p-4">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
                Export status
              </p>
              <p className="mt-2 text-sm font-extrabold text-foreground">
                Not generated yet
              </p>
            </div>
            <div className="rounded-2xl bg-background p-4">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
                Next step
              </p>
              <p className="mt-2 text-sm font-extrabold text-foreground">
                Report templates
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
