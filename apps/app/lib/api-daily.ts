import { fetchApi } from "./api-client";
import { getApiWorkspaceShellData } from "./api-workspace";
import type { ApiWellnessCheckin, ApiNutritionLog, ApiPersonalTraining } from "./api.types";

export interface AthleteDailyData {
  wellness: ApiWellnessCheckin[];
  nutrition: ApiNutritionLog[];
  training: ApiPersonalTraining[];
}

export async function getAthleteDailyData(): Promise<AthleteDailyData> {
  try {
    // 1. Önce giriş yapan sporcuyu bul (Profil sayfasında yazdığımız rotayı kullanarak)
    const athlete = await fetchApi("/athletes/me");
    
    // 2. O sporcunun günlük verilerini (son 7 gün) Express'ten çek
    if (athlete && athlete._id) {
      const dailyData: AthleteDailyData = await fetchApi(`/daily-data/${athlete._id}`);
      return dailyData;
    }
    
    return { wellness: [], nutrition: [], training: [] };
  } catch (error) {
    console.error("Failed to fetch daily data from API:", error);
    return { wellness: [], nutrition: [], training: [] };
  }
}

// Antrenörler için Takım Verileri
export async function getTeamWellness(): Promise<any[]> {
  try {
    const workspace = await getApiWorkspaceShellData();
    if (!workspace.teamId) return [];
    return await fetchApi(`/daily-data/team/${workspace.teamId}/wellness`);
  } catch (error) {
    return [];
  }
}

export async function getTeamNutrition(): Promise<any[]> {
  try {
    const workspace = await getApiWorkspaceShellData();
    if (!workspace.teamId) return [];
    return await fetchApi(`/daily-data/team/${workspace.teamId}/nutrition`);
  } catch (error) {
    return [];
  }
}

export async function getTeamTraining(): Promise<any[]> {
  try {
    const workspace = await getApiWorkspaceShellData();
    if (!workspace.teamId) return [];
    return await fetchApi(`/daily-data/team/${workspace.teamId}/training`);
  } catch (error) {
    return [];
  }
}
