import { DashboardHero } from "../../../../components/dashboard/dashboard-cards";
import { getCurrentWorkspace } from "../../../../lib/workspace";
import { OrganizationSettingsForm } from "./_components/organization-settings-form";

export default async function OrganizationSettingsPage() {
  const { organization, membership } = await getCurrentWorkspace();
  const canUpdate = membership.role === "owner" || membership.role === "admin";

  return (
    <section className="bg-primary-50 px-5 py-6 md:px-8">
      <DashboardHero
        eyebrow="Settings"
        title="Organization"
        subtitle="Update the active organization profile used across CoachOS."
        mascotSrc="/maskotlar/gozetleme.png"
      />

      <div className="mt-4">
        <OrganizationSettingsForm
          canUpdate={canUpdate}
          initialValues={{
            name: organization.name,
            type: organization.type,
            city: organization.city ?? "",
            country: organization.country ?? "",
          }}
        />
      </div>
    </section>
  );
}
