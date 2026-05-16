import { DashboardHero } from "../../../../../components/dashboard/dashboard-cards";
import { getWorkspaceShellData } from "../../../../../lib/workspace";
import { NewOrganizationForm } from "./_components/new-organization-form";

export default async function NewOrganizationPage() {
  const workspace = await getWorkspaceShellData();

  return (
    <section className="bg-primary-50 px-5 py-6 md:px-8">
      <DashboardHero
        eyebrow="Settings"
        title="New organization"
        subtitle="Create another organization and its first team. Available on Pro and Pro Plus plans."
        mascotSrc="/maskotlar/basardin.png"
      />

      <div className="mt-4">
        <NewOrganizationForm canCreate={workspace.canCreateOrganization} />
      </div>
    </section>
  );
}
