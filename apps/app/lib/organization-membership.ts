// @ts-nocheck
import { createDbAdminClient } from "./db-admin";

export async function hasActiveOrganizationMembership(userId: string) {
  const db = createDbAdminClient();

  const { data, error } = await db
    .from("organization_members")
    .select("id")
    .eq("user_id", userId)
    .eq("is_active", true)
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load organization membership: ${error.message}`);
  }

  return Boolean(data);
}

