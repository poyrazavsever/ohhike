import { PageHeader } from "../../../../../components/layout/page-header";
import { getWorkspaceShellData } from "../../../../../lib/workspace";
import { NewOrganizationForm } from "./_components/new-organization-form";

export default async function NewOrganizationPage() {
  const workspace = await getWorkspaceShellData();

  return (
    <section className="px-5 py-8 md:px-8">
      <PageHeader
        eyebrow="Settings"
        title="New organization"
        description="Create another organization and its first team. Available on Pro and Pro Plus plans."
      />

      <NewOrganizationForm canCreate={workspace.canCreateOrganization} />
    </section>
  );
}
