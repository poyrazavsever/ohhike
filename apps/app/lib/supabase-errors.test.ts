import { describe, expect, it } from "vitest";

import {
  formatSupabaseActionError,
  isSupabaseRlsError,
  SUPABASE_RLS_SETUP_HINT,
} from "./supabase-errors";

describe("isSupabaseRlsError", () => {
  it("detects permission and JWT failures", () => {
    expect(isSupabaseRlsError("permission denied for table athletes")).toBe(
      true,
    );
    expect(isSupabaseRlsError("new row violates row-level security policy")).toBe(
      true,
    );
    expect(isSupabaseRlsError("invalid claim: sub")).toBe(true);
    expect(isSupabaseRlsError("column fatigue does not exist")).toBe(false);
  });
});

describe("formatSupabaseActionError", () => {
  it("returns Clerk JWT setup hint for RLS errors", () => {
    expect(formatSupabaseActionError("permission denied")).toBe(
      SUPABASE_RLS_SETUP_HINT,
    );
  });

  it("prefers schema alignment hint when provided", () => {
    expect(
      formatSupabaseActionError("permission denied", {
        schemaAlignHint: "Run migration 009.",
      }),
    ).toBe("Run migration 009.");
  });
});
