import { fetchApi } from "./api-client";
import { getApiWorkspaceShellData } from "./api-workspace";
import type { ApiAthlete } from "./api.types";

export async function getTeamAthletes(): Promise<ApiAthlete[]> {
  try {
    const workspace = await getApiWorkspaceShellData();
    
    // Eğer kullanıcının aktif bir takımı yoksa boş liste dön
    if (!workspace.teamId) {
      return [];
    }

    const athletes: ApiAthlete[] = await fetchApi(`/athletes/team/${workspace.teamId}`);
    return athletes;
  } catch (error) {
    console.error("Failed to fetch team athletes from API:", error);
    return [];
  }
}

// Sporcunun kendi paneline girdiğinde çalışacak Portal verisi
export async function getApiAthletePortalContext() {
  try {
    const workspace = await getApiWorkspaceShellData();
    
    // Express'ten giriş yapan sporcuyu getir
    const athlete = await fetchApi("/athletes/me");
    
    // Populate edildiği için team_id objesinden ismi çekiyoruz
    const teamName = athlete.team_id?.name || workspace.teamName;
    
    return {
      workspace,
      athlete,
      teamName
    };
  } catch (error) {
    console.error("Failed to load athlete portal context:", error);
    throw new Error("Sadece sporcular bu alana erişebilir.");
  }
}
