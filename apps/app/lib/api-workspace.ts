import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { fetchApi } from "./api-client";
import { ACTIVE_ORGANIZATION_COOKIE, WorkspaceShellData } from "./workspace";
import type { ApiOrganization, ApiOrgMember, ApiTeam } from "./api.types";

interface PopulatedWorkspace {
  organization: ApiOrganization;
  membership: ApiOrgMember;
}

export async function getApiWorkspaceShellData(): Promise<WorkspaceShellData> {
  const cookieStore = await cookies();
  const activeOrganizationId = cookieStore.get(ACTIVE_ORGANIZATION_COOKIE)?.value;

  try {
    // 1. Kullanıcının ait olduğu organizasyonları getir
    const workspaces: PopulatedWorkspace[] = await fetchApi("/organizations");

    if (!workspaces || workspaces.length === 0) {
      redirect("/onboarding");
    }

    // 2. Aktif organizasyonu bul (çerezden veya varsayılan ilk)
    const activeWorkspace =
      workspaces.find((ws) => ws.organization._id === activeOrganizationId) ??
      workspaces[0];

    if (!activeWorkspace) {
      redirect("/onboarding");
    }

    // 3. Aktif organizasyonun takımlarını getir
    const teams: ApiTeam[] = await fetchApi(`/teams/${activeWorkspace.organization._id}`);
    const activeTeam = teams.length > 0 ? teams[0] : null;

    // 4. Sidebar'ın beklediği WorkspaceShellData formatına çevir
    return {
      organizationId: activeWorkspace.organization._id,
      organizationName: activeWorkspace.organization.name,
      teamName: activeTeam?.name ?? null,
      plan: "pro_team", // Şimdilik varsayılan Pro Team
      role: activeWorkspace.membership.role as any, // 'owner' | 'admin' vs.
      canCreateOrganization: true,
      features: {
        aiReports: false,
        teamMemory: false,
        trainingPlanner: true,
        wearables: false,
        pdfExport: false,
        coachMarketplace: false,
      },
      organizations: workspaces.map((ws) => ({
        id: ws.organization._id,
        name: ws.organization.name,
        role: ws.membership.role as any,
        isActive: ws.organization._id === activeWorkspace.organization._id,
      })),
    };
  } catch (error) {
    console.error("API Error in getApiWorkspaceShellData:", error);
    redirect("/login");
  }
}
