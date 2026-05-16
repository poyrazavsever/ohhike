import { PageHeader } from "../../../../components/layout/page-header";
import { getCurrentWorkspace } from "../../../../lib/workspace";
import { OrganizationSettingsForm } from "./_components/organization-settings-form";

export default async function OrganizationSettingsPage() {
  const { organization, membership } = await getCurrentWorkspace();
  const canUpdate = membership.role === "owner" || membership.role === "admin";

  return (
    <section className="px-5 py-8 md:px-8">
      <PageHeader
        eyebrow="Settings"
        title="Organization"
        description="Update the active organization profile used across CoachOS."
      />

      <OrganizationSettingsForm
        canUpdate={canUpdate}
        initialValues={{
          name: organization.name,
          type: organization.type,
          city: organization.city ?? "",
          country: organization.country ?? "",
        }}
      />
    </section>
  );
}
