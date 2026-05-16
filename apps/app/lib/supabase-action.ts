import "server-only";

import { createSupabaseServerClient } from "./supabase-server";

export {
  formatSupabaseActionError,
  isSupabaseRlsError,
  SUPABASE_RLS_SETUP_HINT,
} from "./supabase-errors";

/** RLS-enforced client for authenticated workspace reads (Server Components, loaders). */
export async function createWorkspaceSupabase() {
  return createSupabaseServerClient();
}

/** Default Supabase client for server actions (RLS enforced via Clerk JWT). */
export async function createActionSupabase() {
  return createWorkspaceSupabase();
}
