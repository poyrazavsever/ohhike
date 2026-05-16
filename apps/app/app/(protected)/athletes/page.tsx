import { PageHeader } from "../../../components/layout/page-header";

export default function AthletesPage() {
  return (
    <section className="px-5 py-8 md:px-8">
      <PageHeader
        eyebrow="Team Operations"
        title="Athletes"
        description="Track athlete profiles, claim status, readiness signals and invite flows from one place."
      />

      <div className="mt-6 rounded-3xl border border-dashed border-border bg-card p-8 text-center">
        <p className="text-sm font-bold text-foreground">
          No athletes loaded yet
        </p>
        <p className="mt-2 text-sm font-medium text-muted-foreground">
          Add athletes during onboarding or from this page in the next phase.
        </p>
      </div>
    </section>
  );
}
