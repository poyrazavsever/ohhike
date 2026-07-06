import { fetchApi } from "./api-client";
import { getApiWorkspaceShellData } from "./api-workspace";
import type { ApiSession } from "./api.types";

export async function getTeamSessions(): Promise<ApiSession[]> {
  try {
    const workspace = await getApiWorkspaceShellData();
    
    if (!workspace.teamId) {
      return [];
    }

    const sessions: ApiSession[] = await fetchApi(`/sessions/team/${workspace.teamId}`);
    return sessions;
  } catch (error) {
    console.error("Failed to fetch team sessions from API:", error);
    return [];
  }
}
