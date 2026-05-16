import "server-only";

import type { OrganizationRole } from "./database.types";
import { isCoachStaffRole } from "./org-roles";
import { createSupabaseAdminClient } from "./supabase-admin";

type WorkspaceAuditLogInput = {
  organizationId: string;
  userId: string;
  role: OrganizationRole;
  action: string;
  entityType: string;
  entityId?: string | null;
};

/** Service-role audit insert (RLS has no general insert policy on audit_logs). */
export async function writeAuditLogEntry(input: {
  organizationId: string | null;
  userId: string;
  action: string;
  entityType: string;
  entityId?: string | null;
}) {
  const supabase = createSupabaseAdminClient();

  await supabase.from("audit_logs").insert({
    organization_id: input.organizationId,
    user_id: input.userId,
    action: input.action,
    entity_type: input.entityType,
    entity_id: input.entityId ?? null,
  });
}

/** Coach/staff actions only; athletes and non-staff roles are skipped. */
export async function writeWorkspaceAuditLog(input: WorkspaceAuditLogInput) {
  if (!isCoachStaffRole(input.role)) {
    return;
  }

  await writeAuditLogEntry({
    organizationId: input.organizationId,
    userId: input.userId,
    action: input.action,
    entityType: input.entityType,
    entityId: input.entityId,
  });
}
