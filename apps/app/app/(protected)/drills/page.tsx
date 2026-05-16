import { PageHeader } from "../../../components/layout/page-header";
import { getDrillsData } from "../../../lib/workspace";
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
    },
    {
      label: "Custom",
      value: totals.customDrills.toString(),
      helper: "Organization drills",
    },
    {
      label: "System",
      value: totals.systemDrills.toString(),
      helper: "Shared drills",
    },
    {
      label: "Used",
      value: drills
        .filter((drill) => drill.usageCount > 0)
        .length.toString(),
      helper: "Linked to plans",
    },
  ];

  return (
    <section className="px-5 py-8 md:px-8">
      <PageHeader
        eyebrow="Team Operations"
        title="Drill Library"
        description={`Reusable training drills for ${workspace.organization.name}.`}
      />

      <CreateDrillForm />

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

      {drills.length > 0 ? (
        <div className="mt-6 grid gap-4 xl:grid-cols-2">
          {drills.map((drill) => (
            <article
              key={drill.id}
              className="rounded-3xl border border-border bg-card p-5"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <h2 className="text-lg font-extrabold text-foreground">
                    {drill.title}
                  </h2>
                  <p className="mt-2 text-sm font-medium text-muted-foreground">
                    {formatSportType(drill.sport_type)} ·{" "}
                    {drill.category ?? "No category"} ·{" "}
                    {drill.difficulty ?? "No difficulty"}
                  </p>
                </div>
                <div className="rounded-2xl bg-primary-soft px-4 py-2 text-xs font-extrabold text-primary-700">
                  {drill.is_system_drill ? "System" : "Custom"}
                </div>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-4">
                <div className="rounded-2xl bg-background p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
                    Duration
                  </p>
                  <p className="mt-2 text-sm font-extrabold text-foreground">
                    {drill.duration_min ? `${drill.duration_min} min` : "Not set"}
                  </p>
                </div>
                <div className="rounded-2xl bg-background p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
                    Players
                  </p>
                  <p className="mt-2 text-sm font-extrabold text-foreground">
                    {drill.player_count_min || drill.player_count_max
                      ? `${drill.player_count_min ?? "-"}-${drill.player_count_max ?? "-"}`
                      : "Not set"}
                  </p>
                </div>
                <div className="rounded-2xl bg-background p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
                    Usage
                  </p>
                  <p className="mt-2 text-sm font-extrabold text-foreground">
                    {drill.usageCount}
                  </p>
                </div>
                <div className="rounded-2xl bg-background p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
                    Tags
                  </p>
                  <p className="mt-2 truncate text-sm font-extrabold text-foreground">
                    {drill.tags?.length ? drill.tags.join(", ") : "Not set"}
                  </p>
                </div>
              </div>

              {drill.objective || drill.description ? (
                <p className="mt-4 text-sm font-medium leading-6 text-muted-foreground">
                  {drill.objective ? `Objective: ${drill.objective}. ` : ""}
                  {drill.description ?? ""}
                </p>
              ) : null}
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-3xl border border-dashed border-border bg-card p-8 text-center">
          <p className="text-sm font-bold text-foreground">No drills yet</p>
          <p className="mt-2 text-sm font-medium text-muted-foreground">
            Add your first drill to start building the training library.
          </p>
        </div>
      )}
    </section>
  );
}
