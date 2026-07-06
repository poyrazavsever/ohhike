// @ts-nocheck
import "server-only";

import { createDbAdminClient } from "./db-admin";

export type AthleteInvitePreviewResult =
  | {
      ok: true;
      athleteFirstName: string;
      organizationName: string;
      expiresAt: string | null;
    }
  | {
      ok: false;
      reason: "not_found" | "expired" | "already_claimed";
    };

export async function getAthleteInvitePreview(
  token: string,
): Promise<AthleteInvitePreviewResult> {
  const trimmed = token?.trim();
  if (!trimmed) {
    return { ok: false, reason: "not_found" };
  }

  const db = createDbAdminClient();

  const { data: invite, error: inviteError } = await db
    .from("athlete_invites")
    .select("athlete_id, organization_id, expires_at, accepted_at")
    .eq("token", trimmed)
    .maybeSingle();

  if (inviteError || !invite) {
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

  const { data: athlete } = await db
    .from("athletes")
    .select("first_name, user_id")
    .eq("id", invite.athlete_id)
    .maybeSingle();

  if (!athlete || athlete.user_id) {
    return { ok: false, reason: "already_claimed" };
  }

  const { data: organization } = await db
    .from("organizations")
    .select("name")
    .eq("id", invite.organization_id)
    .maybeSingle();

  return {
    ok: true,
    athleteFirstName: athlete.first_name,
    organizationName: organization?.name ?? "your team",
    expiresAt: invite.expires_at,
  };
}

