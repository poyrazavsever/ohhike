import {
  DashboardHero,
  DetailStat,
  EmptyStateCard,
  MetricCard,
} from "../../../components/dashboard/dashboard-cards";
import { getDrillsData } from "../../../lib/workspace";
import {
  drillCategoryLabel,
  drillDifficultyLabel,
} from "../../../lib/coach-vocabulary";
import { CreateDrillForm } from "./_components/create-drill-form";

function formatSportType(value: string) {
  return value
    .split("_")
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ");
}

export default async function DrillsPage() {
  const { workspace, drills, totals } = await getDrillsData();

  const cards = [
    {
      label: "Drills",
      value: totals.drills.toString(),
      helper: "Available in library",
      icon: "solar:notebook-bookmark-bold",
    },
    {
      label: "Custom",
      value: totals.customDrills.toString(),
      helper: "Organization drills",
      icon: "solar:pen-new-square-bold",
      tone: "secondary" as const,
    },
    {
      label: "System",
      value: totals.systemDrills.toString(),
      helper: "Shared drills",
      icon: "solar:stars-bold",
      tone: "info" as const,
    },
    {
      label: "Used",
      value: drills
        .filter((drill) => drill.usageCount > 0)
        .length.toString(),
      helper: "Linked to plans",
      icon: "solar:link-round-bold",
      tone: "warning" as const,
    },
  ];

  return (
    <section className="bg-primary-50 px-5 py-6 md:px-8">
      <DashboardHero
        eyebrow="Team Operations"
        title="Drill Library"
        subtitle={`Reusable training drills for ${workspace.organization.name}.`}
        mascotSrc="/maskotlar/esnemee.png"
      />

      <div className="mt-4">
        <CreateDrillForm />
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <MetricCard key={card.label} {...card} />
        ))}
      </div>

      {drills.length > 0 ? (
        <div className="mt-4 grid gap-3 xl:grid-cols-2">
          {drills.map((drill) => (
            <article
              key={drill.id}
              className="rounded-2xl border border-border bg-card p-4"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <h2 className="text-base font-black text-foreground">
                    {drill.title}
                  </h2>
                  <p className="mt-1 text-sm font-semibold text-muted-foreground">
                    {formatSportType(drill.sport_type)} ·{" "}
                    {drillCategoryLabel(drill.category)} ·{" "}
                    {drillDifficultyLabel(drill.difficulty)}
                  </p>
                </div>
                <div className="rounded-xl bg-primary-soft px-3 py-1.5 text-xs font-extrabold text-primary-700">
                  {drill.is_system_drill ? "System" : "Custom"}
                </div>
              </div>

              <div className="mt-4 grid gap-2 md:grid-cols-4">
                <DetailStat
                  label="Duration"
                  value={drill.duration_min ? `${drill.duration_min} min` : "Not set"}
                />
                <DetailStat
                  label="Players"
                  value={
                    drill.player_count_min || drill.player_count_max
                      ? `${drill.player_count_min ?? "-"}-${drill.player_count_max ?? "-"}`
                      : "Not set"
                  }
                />
                <DetailStat label="Usage" value={drill.usageCount} />
                <DetailStat
                  label="Tags"
                  value={drill.tags?.length ? drill.tags.join(", ") : "Not set"}
                />
              </div>

              {drill.objective || drill.description ? (
                <p className="mt-3 text-sm font-semibold leading-6 text-muted-foreground">
                  {drill.objective ? `Objective: ${drill.objective}. ` : ""}
                  {drill.description ?? ""}
                </p>
              ) : null}
            </article>
          ))}
        </div>
      ) : (
        <EmptyStateCard
          title="No drills yet"
          description="Add your first drill to start building the training library."
          icon="solar:notebook-bookmark-bold"
        />
      )}
    </section>
  );
}
