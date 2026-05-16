import { describe, expect, it } from "vitest";

import {
  isSupabaseAdminOnlyModule,
  SUPABASE_ADMIN_ONLY_MODULES,
} from "./supabase-admin-allowlist";

describe("SUPABASE_ADMIN_ONLY_MODULES", () => {
  it("lists bootstrap and invite modules that bypass RLS", () => {
    expect(SUPABASE_ADMIN_ONLY_MODULES).toContain("lib/audit-log");
    expect(SUPABASE_ADMIN_ONLY_MODULES).toContain("lib/athlete-invite");
    expect(SUPABASE_ADMIN_ONLY_MODULES).toContain(
      "app/api/webhooks/clerk",
    );
  });

  it("does not treat workspace loaders as admin-only", () => {
    expect(isSupabaseAdminOnlyModule("lib/workspace")).toBe(false);
  });
});
