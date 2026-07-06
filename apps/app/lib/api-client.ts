import { cookies } from "next/headers";

const API_BASE_URL = "http://localhost:3002/api/v1";

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  // Sunucu (Server) ortamında çalıştığımız için next/headers kullanılarak çerez okunur
  const cookieStore = await cookies();
  const token = cookieStore.get("ohhike_token")?.value;

  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `API Error: ${response.status}`);
  }

  return response.json();
}
