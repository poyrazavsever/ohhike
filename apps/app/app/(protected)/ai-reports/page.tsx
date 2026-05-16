import { PageHeader } from "../../../components/layout/page-header";
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

  const cards = [
    {
      label: "Reports",
      value: totals.reports.toString(),
      helper: "Saved report records",
    },
    {
      label: "Session",
      value: totals.sessionReports.toString(),
      helper: "Linked to sessions",
    },
    {
      label: "Athlete",
      value: totals.athleteReports.toString(),
      helper: "Linked to athletes",
    },
    {
      label: "Team",
      value: totals.teamReports.toString(),
      helper: "Linked to teams",
    },
  ];

  return (
    <section className="px-5 py-8 md:px-8">
      <PageHeader
        eyebrow="AI Intelligence"
        title="AI Reports"
        description={`AI report registry for ${workspace.organization.name}.`}
      />

      <CreateAiReportForm teams={teams} athletes={athletes} sessions={sessions} />

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

      {reports.length > 0 ? (
        <div className="mt-6 grid gap-4">
          {reports.map((report) => (
            <article
              key={report.id}
              className="rounded-3xl border border-border bg-card p-5"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <h2 className="text-lg font-extrabold text-foreground">
                    {report.title}
                  </h2>
                  <p className="mt-2 text-sm font-medium text-muted-foreground">
                    {formatReportType(report.report_type)} ·{" "}
                    {formatDate(report.created_at)}
                  </p>
                </div>
                <div className="rounded-2xl bg-primary-soft px-4 py-2 text-xs font-extrabold text-primary-700">
                  {report.model_provider ?? "manual"}
                </div>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-4">
                <div className="rounded-2xl bg-background p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
                    Team
                  </p>
                  <p className="mt-2 truncate text-sm font-extrabold text-foreground">
                    {report.teamName ?? "Not linked"}
                  </p>
                </div>
                <div className="rounded-2xl bg-background p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
                    Athlete
                  </p>
                  <p className="mt-2 truncate text-sm font-extrabold text-foreground">
                    {report.athleteName ?? "Not linked"}
                  </p>
                </div>
                <div className="rounded-2xl bg-background p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
                    Session
                  </p>
                  <p className="mt-2 truncate text-sm font-extrabold text-foreground">
                    {report.sessionTitle ?? "Not linked"}
                  </p>
                </div>
                <div className="rounded-2xl bg-background p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
                    Confidence
                  </p>
                  <p className="mt-2 text-sm font-extrabold text-foreground">
                    {report.confidence_score ?? "Draft"}
                  </p>
                </div>
              </div>

              {report.summary ? (
                <p className="mt-4 text-sm font-medium leading-6 text-muted-foreground">
                  {report.summary}
                </p>
              ) : null}
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-3xl border border-dashed border-border bg-card p-8 text-center">
          <p className="text-sm font-bold text-foreground">
            No AI reports yet
          </p>
          <p className="mt-2 text-sm font-medium text-muted-foreground">
            Add a report draft to prepare the AI analysis workflow.
          </p>
        </div>
      )}
    </section>
  );
}
