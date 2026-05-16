import "server-only";

import type { OrganizationRole } from "./database.types";
import { formatOrganizationRole } from "./org-roles";
import { createSupabaseAdminClient } from "./supabase-admin";

export type StaffInvitePreviewResult =
  | {
      ok: true;
      organizationName: string;
      roleLabel: string;
      expiresAt: string | null;
    }
  | {
      ok: false;
      reason: "not_found" | "expired" | "already_claimed";
    };

export async function getStaffInvitePreview(
  token: string,
): Promise<StaffInvitePreviewResult> {
  const trimmed = token?.trim();
  if (!trimmed) {
    return { ok: false, reason: "not_found" };
  }

  const supabase = createSupabaseAdminClient();

  const { data: invite, error } = await supabase
    .from("organization_staff_invites")
    .select("organization_id, role, expires_at, accepted_at")
    .eq("token", trimmed)
    .maybeSingle();

  if (error || !invite) {
    return { ok: false, reason: "not_found" };
  }

  if (invite.accepted_at) {
    return { ok: false, reason: "already_claimed" };
  }

  if (
    invite.expires_at &&
    new Date(invite.expires_at).getTime() < Date.now()
  ) {
    return { ok: false, reason: "expired" };
  }

  const { data: organization } = await supabase
    .from("organizations")
    .select("name")
    .eq("id", invite.organization_id)
    .maybeSingle();

  return {
    ok: true,
    organizationName: organization?.name ?? "Organization",
    roleLabel: formatOrganizationRole(invite.role as OrganizationRole),
    expiresAt: invite.expires_at,
  };
}
