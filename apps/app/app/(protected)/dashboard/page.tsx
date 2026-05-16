import { PageHeader } from "../../../components/layout/page-header";

const cards = [
  "Team readiness",
  "Today sessions",
  "Missing check-ins",
  "AI focus",
];

export default function DashboardPage() {
  return (
    <section className="px-5 py-8 md:px-8">
      <PageHeader
        eyebrow="Coach Workspace"
        title="Coach Dashboard"
        description="Your team operations hub will surface readiness, sessions, risk alerts and AI coaching context here."
      />

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card}
            className="rounded-3xl border border-border bg-card p-5"
          >
            <p className="text-sm font-bold text-foreground">{card}</p>
            <p className="mt-2 text-xs font-medium leading-5 text-muted-foreground">
              Data will appear after onboarding creates your first team.
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
