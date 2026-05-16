import Link from "next/link";

import { PageHeader } from "../../../components/layout/page-header";
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
    },
    {
      label: "Blocks",
      value: totals.blocks.toString(),
      helper: "Training blocks",
    },
    {
      label: "Planned Min",
      value: totals.plannedMinutes.toString(),
      helper: "Total duration",
    },
    {
      label: "Completed",
      value: totals.completedBlocks.toString(),
      helper: "Finished blocks",
    },
  ];

  return (
    <section className="px-5 py-8 md:px-8">
      <PageHeader
        eyebrow="Team Operations"
        title="Training Planner"
        description={`Training plan blocks for ${workspace.organization.name}.`}
      />

      <div className="mt-6 flex justify-end">
        <Link
          href="/sessions"
          className="inline-flex items-center rounded-xl bg-primary px-4 py-2.5 text-sm font-extrabold text-primary-foreground transition-colors hover:bg-primary-hover"
        >
          Manage sessions
        </Link>
      </div>

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

      {sessions.length > 0 ? (
        <div className="mt-6 grid gap-4">
          {sessions.map((session) => (
            <article
              key={session.id}
              className="rounded-3xl border border-border bg-card p-5"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <h2 className="text-lg font-extrabold text-foreground">
                    {session.title}
                  </h2>
                  <p className="mt-2 text-sm font-medium text-muted-foreground">
                    {session.teamName ?? "No team"} · {formatSessionType(session.type)}
                  </p>
                  <p className="mt-1 text-xs font-medium text-muted-foreground">
                    {formatDate(session.scheduled_at)}
                  </p>
                </div>
                <div className="rounded-2xl bg-primary-soft px-4 py-2 text-xs font-extrabold text-primary-700">
                  {completionLabel(session)}
                </div>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-3">
                <div className="rounded-2xl bg-background p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
                    Blocks
                  </p>
                  <p className="mt-2 text-sm font-extrabold text-foreground">
                    {session.trainingBlocks.length}
                  </p>
                </div>
                <div className="rounded-2xl bg-background p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
                    Planned Min
                  </p>
                  <p className="mt-2 text-sm font-extrabold text-foreground">
                    {plannedMinutes(session)}
                  </p>
                </div>
                <div className="rounded-2xl bg-background p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
                    Focus
                  </p>
                  <p className="mt-2 truncate text-sm font-extrabold text-foreground">
                    {session.focus_area ?? "Not set"}
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-3">
                {session.trainingBlocks.length > 0 ? (
                  session.trainingBlocks.map((block) => (
                    <div
                      key={block.id}
                      className="rounded-2xl border border-border bg-background p-4"
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div>
                          <p className="text-sm font-extrabold text-foreground">
                            {block.order_index + 1}. {block.title}
                          </p>
                          <p className="mt-1 text-xs font-medium text-muted-foreground">
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
                  <p className="rounded-2xl border border-dashed border-border bg-background p-5 text-center text-sm font-medium text-muted-foreground">
                    No blocks yet. Add blocks from the Sessions page.
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-3xl border border-dashed border-border bg-card p-8 text-center">
          <p className="text-sm font-bold text-foreground">
            No training plans yet
          </p>
          <p className="mt-2 text-sm font-medium text-muted-foreground">
            Create sessions and add training blocks to build the planner.
          </p>
        </div>
      )}
    </section>
  );
}
