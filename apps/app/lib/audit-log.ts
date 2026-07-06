// @ts-nocheck
import "server-only";

import type { OrganizationRole } from "./db.types";
import { isCoachStaffRole } from "./org-roles";
import { createDbAdminClient } from "./db-admin";

type WorkspaceAuditLogInput = {
  organizationId: string;
  userId: string;
  role: OrganizationRole;
  action: string;
  entityType: string;
  entityId?: string | null;
};

/** Audit writes stay on admin client; RLS only allows owner/admin inserts. */
export async function writeWorkspaceAuditLog(input: WorkspaceAuditLogInput) {
  if (!isCoachStaffRole(input.role)) {
    return;
  }

  const db = createDbAdminClient();

  await db.from("audit_logs").insert({
    organization_id: input.organizationId,
    user_id: input.userId,
    action: input.action,
    entity_type: input.entityType,
    entity_id: input.entityId ?? null,
  });
}

