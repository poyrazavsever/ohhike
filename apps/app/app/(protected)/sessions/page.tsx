import { PageHeader } from "../../../components/layout/page-header";

export default function SessionsPage() {
  return (
    <section className="px-5 py-8 md:px-8">
      <PageHeader
        eyebrow="Training Workflow"
        title="Sessions"
        description="Plan training sessions, matches, attendance, RPE collection and AI report readiness."
      />

      <div className="mt-6 rounded-3xl border border-dashed border-border bg-card p-8 text-center">
        <p className="text-sm font-bold text-foreground">
          Session workflow is coming next
        </p>
        <p className="mt-2 text-sm font-medium text-muted-foreground">
          Foundation routes are ready; session CRUD starts after team and athlete operations.
        </p>
      </div>
    </section>
  );
}
