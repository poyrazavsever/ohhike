import { PageHeader } from "../../../components/layout/page-header";

export default function TeamsPage() {
  return (
    <section className="px-5 py-8 md:px-8">
      <PageHeader
        eyebrow="Team Operations"
        title="Teams"
        description="Create and manage organization teams, sport type, age group, staff access and season goals."
      />

      <div className="mt-6 rounded-3xl border border-dashed border-border bg-card p-8 text-center">
        <p className="text-sm font-bold text-foreground">No teams loaded yet</p>
        <p className="mt-2 text-sm font-medium text-muted-foreground">
          The first team will be created during onboarding.
        </p>
      </div>
    </section>
  );
}
