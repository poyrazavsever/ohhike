import { PageHeader } from "../../../../components/layout/page-header";

export default function BillingSettingsPage() {
  return (
    <section className="px-5 py-8 md:px-8">
      <PageHeader
        eyebrow="Settings"
        title="Billing"
        description="Team-level Basic, Pro and Pro Plus entitlements will be managed from this page."
      />

      <div className="mt-6 rounded-3xl border border-border bg-card p-6">
        <p className="text-sm font-bold text-foreground">Current model</p>
        <p className="mt-2 text-sm font-medium leading-6 text-muted-foreground">
          Billing is team-based. Feature gates will read from
          team_billing_entitlements for the active team.
        </p>
      </div>
    </section>
  );
}
