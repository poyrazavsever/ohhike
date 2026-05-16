import Link from "next/link";

import {
  DashboardHero,
  DetailStat,
  EmptyStateCard,
  MetricCard,
} from "../../../components/dashboard/dashboard-cards";
import {
  getTrainingPlannerData,
  type TrainingPlannerSession,
} from "../../../lib/workspace";

function formatDate(value: string | null) {
  if (!value) {
    return "Not scheduled";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatSessionType(type: string) {
  return type
    .split("_")
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ");
}

function plannedMinutes(session: TrainingPlannerSession) {
  return session.trainingBlocks.reduce(
    (total, block) => total + (block.planned_duration_min ?? 0),
    0,
  );
}

function completionLabel(session: TrainingPlannerSession) {
  if (session.trainingBlocks.length === 0) {
    return "No blocks";
  }

  const completed = session.trainingBlocks.filter((block) => block.completed).length;
  return `${completed}/${session.trainingBlocks.length} completed`;
}

export default async function TrainingPlannerPage() {
  const { workspace, sessions, totals } = await getTrainingPlannerData();

  const cards = [
    {
      label: "Plans",
      value: totals.sessions.toString(),
      helper: "Loaded sessions",
      icon: "solar:map-arrow-right-bold",
    },
    {
      label: "Blocks",
      value: totals.blocks.toString(),
      helper: "Training blocks",
      icon: "solar:widget-5-bold",
      tone: "info" as const,
    },
    {
      label: "Planned Min",
      value: totals.plannedMinutes.toString(),
      helper: "Total duration",
      icon: "solar:clock-circle-bold",
      tone: "secondary" as const,
    },
    {
      label: "Completed",
      value: totals.completedBlocks.toString(),
      helper: "Finished blocks",
      icon: "solar:check-circle-bold",
      tone: "warning" as const,
    },
  ];

  return (
    <section className="bg-primary-50 px-5 py-6 md:px-8">
      <DashboardHero
        eyebrow="Team Operations"
        title="Training Planner"
        subtitle={`Training plan blocks for ${workspace.organization.name}.`}
        mascotSrc="/maskotlar/harita.png"
      />

      <div className="mt-4 flex justify-end">
        <Link
          href="/sessions"
          className="inline-flex items-center rounded-xl bg-primary px-4 py-2.5 text-sm font-black text-primary-foreground transition-colors hover:bg-primary-hover"
        >
          Manage sessions
        </Link>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <MetricCard key={card.label} {...card} />
        ))}
      </div>

      {sessions.length > 0 ? (
        <div className="mt-4 grid gap-3">
          {sessions.map((session) => (
            <article
              key={session.id}
              className="rounded-2xl border border-border bg-card p-4"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <h2 className="text-base font-black text-foreground">
                    {session.title}
                  </h2>
                  <p className="mt-1 text-sm font-semibold text-muted-foreground">
                    {session.teamName ?? "No team"} · {formatSessionType(session.type)}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-muted-foreground">
                    {formatDate(session.scheduled_at)}
                  </p>
                </div>
                <div className="rounded-xl bg-primary-soft px-3 py-1.5 text-xs font-extrabold text-primary-700">
                  {completionLabel(session)}
                </div>
              </div>

              <div className="mt-4 grid gap-2 md:grid-cols-3">
                <DetailStat label="Blocks" value={session.trainingBlocks.length} />
                <DetailStat label="Planned Min" value={plannedMinutes(session)} />
                <DetailStat label="Focus" value={session.focus_area ?? "Not set"} />
              </div>

              <div className="mt-4 grid gap-2">
                {session.trainingBlocks.length > 0 ? (
                  session.trainingBlocks.map((block) => (
                    <div
                      key={block.id}
                      className="rounded-xl border border-border bg-background p-3"
                    >
                      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                        <div>
                          <p className="text-sm font-black text-foreground">
                            {block.order_index + 1}. {block.title}
                          </p>
                          <p className="mt-1 text-xs font-semibold text-muted-foreground">
                            {block.description ?? "No description"}
                          </p>
                        </div>
                        <div className="text-left text-xs font-bold text-muted-foreground md:text-right">
                          <p>{block.planned_duration_min ?? 0} min</p>
                          <p>Intensity {block.intensity ?? "-"}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="rounded-xl border border-dashed border-border bg-background p-4 text-center text-sm font-semibold text-muted-foreground">
                    No blocks yet. Add blocks from the Sessions page.
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyStateCard
          title="No training plans yet"
          description="Create sessions and add training blocks to build the planner."
          icon="solar:map-arrow-right-bold"
        />
      )}
    </section>
  );
}
