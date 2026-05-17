"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

import {
  addCompletedDateToAssignment,
  computeProgramAdherence,
  parseCoachingProgramMetadata,
  toIsoDateString,
  type CoachingProgramMetadata,
} from "../../lib/coach-network/program-assignments";
import type { Json } from "../../lib/database.types";
import { writeWorkspaceAuditLog } from "../../lib/audit-log";
import { isCoachStaffRole } from "../../lib/org-roles";
import { createSupabaseAdminClient } from "../../lib/supabase-admin";
import { getCurrentWorkspace } from "../../lib/workspace";

type ActionResult = { ok: true } | { ok: false; error: string };

export type AssignCoachingProgramInput = {
  relationshipId: string;
  title: string;
  description?: string;
  startsAt: string;
  endsAt: string;
  dailyFocus?: string;
};

async function requireCoachStaff() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("You must be signed in.");
  }

  const workspace = await getCurrentWorkspace();
  if (!isCoachStaffRole(workspace.membership.role)) {
    throw new Error("Only coaching staff can manage programs.");
  }

  return { userId, workspace };
}

function cleanString(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export async function getRemoteCoachingRelationshipDetail(relationshipId: string) {
  const { workspace } = await requireCoachStaff();
  const supabase = createSupabaseAdminClient();

  const { data: relationship, error } = await supabase
    .from("remote_coaching_relationships")
    .select("*")
    .eq("id", relationshipId)
    .eq("organization_id", workspace.organization.id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!relationship?.athlete_id) {
    return null;
  }

  const [{ data: athlete }, { data: assignments }] = await Promise.all([
    supabase
      .from("athletes")
      .select("id, display_name, first_name, last_name, email")
      .eq("id", relationship.athlete_id)
      .maybeSingle(),
    supabase
      .from("coaching_program_assignments")
      .select("*")
      .eq("relationship_id", relationshipId)
      .order("created_at", { ascending: false }),
  ]);

  const activeAssignment =
    (assignments ?? []).find((row) => row.status === "active") ?? null;

  return {
    relationship,
    athlete: athlete ?? null,
    assignments: assignments ?? [],
    activeAssignment,
    adherence: activeAssignment
      ? computeProgramAdherence(activeAssignment)
      : null,
  };
}

export async function assignCoachingProgram(
  input: AssignCoachingProgramInput,
): Promise<ActionResult> {
  try {
    const { userId, workspace } = await requireCoachStaff();
    const title = input.title.trim();

    if (!title) {
      return { ok: false, error: "Program title is required." };
    }

    if (!input.startsAt || !input.endsAt) {
      return { ok: false, error: "Start and end dates are required." };
    }

    if (input.endsAt < input.startsAt) {
      return { ok: false, error: "End date must be on or after start date." };
    }

    const supabase = createSupabaseAdminClient();
    const { data: relationship, error: relationshipError } = await supabase
      .from("remote_coaching_relationships")
      .select("id, athlete_id, organization_id, status, payment_status")
      .eq("id", input.relationshipId)
      .eq("organization_id", workspace.organization.id)
      .maybeSingle();

    if (relationshipError || !relationship?.athlete_id) {
      return { ok: false, error: "Remote athlete relationship not found." };
    }

    if (relationship.status !== "active") {
      return {
        ok: false,
        error: "Programs can only be assigned to active relationships.",
      };
    }

    const metadata: CoachingProgramMetadata = {
      completed_dates: [],
      daily_focus: cleanString(input.dailyFocus) ?? undefined,
    };

    await supabase
      .from("coaching_program_assignments")
      .update({ status: "cancelled", updated_at: new Date().toISOString() })
      .eq("relationship_id", relationship.id)
      .eq("status", "active");

    const { error: insertError } = await supabase
      .from("coaching_program_assignments")
      .insert({
        relationship_id: relationship.id,
        organization_id: relationship.organization_id,
        athlete_id: relationship.athlete_id,
        assigned_by: userId,
        title,
        description: cleanString(input.description),
        program_metadata: metadata as Json,
        status: "active",
        starts_at: input.startsAt,
        ends_at: input.endsAt,
      });

    if (insertError) {
      return { ok: false, error: insertError.message };
    }

    await writeWorkspaceAuditLog({
      organizationId: workspace.organization.id,
      userId,
      role: workspace.membership.role,
      action: "coach_network.program.assigned",
      entityType: "coaching_program_assignment",
      entityId: relationship.id,
    });

    revalidatePath("/coach-network/remote-athletes");
    revalidatePath(`/coach-network/remote-athletes/${relationship.id}`);
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Could not assign program.",
    };
  }
}

export async function listRemoteAthletesWithProgramAdherence() {
  const { workspace } = await requireCoachStaff();
  const supabase = createSupabaseAdminClient();

  const { data: relationships, error } = await supabase
    .from("remote_coaching_relationships")
    .select("*")
    .eq("organization_id", workspace.organization.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const rows = relationships ?? [];
  const athleteIds = rows
    .map((row) => row.athlete_id)
    .filter((id): id is string => Boolean(id));
  const relationshipIds = rows.map((row) => row.id);

  const [{ data: athletes }, { data: assignments }] = await Promise.all([
    athleteIds.length > 0
      ? supabase
          .from("athletes")
          .select("id, display_name, first_name, last_name, email, user_id")
          .in("id", athleteIds)
      : { data: [] },
    relationshipIds.length > 0
      ? supabase
          .from("coaching_program_assignments")
          .select("*")
          .in("relationship_id", relationshipIds)
          .eq("status", "active")
      : { data: [] },
  ]);

  const athleteById = new Map((athletes ?? []).map((a) => [a.id, a]));
  const assignmentByRelationship = new Map(
    (assignments ?? []).map((a) => [a.relationship_id, a]),
  );

  return rows.map((row) => {
    const activeAssignment = assignmentByRelationship.get(row.id) ?? null;
    return {
      ...row,
      athlete: row.athlete_id ? athleteById.get(row.athlete_id) ?? null : null,
      activeAssignment,
      adherence: activeAssignment
        ? computeProgramAdherence(activeAssignment)
        : null,
    };
  });
}

export async function getActiveProgramAssignmentForAthlete(athleteId: string) {
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("coaching_program_assignments")
    .select("*")
    .eq("athlete_id", athleteId)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function markProgramDayComplete(
  assignmentId: string,
  date?: string,
): Promise<ActionResult> {
  const { userId } = await auth();
  if (!userId) {
    return { ok: false, error: "You must be signed in." };
  }

  try {
    const supabase = createSupabaseAdminClient();
    const targetDate = date?.trim() || toIsoDateString(new Date());

    const { data: assignment } = await supabase
      .from("coaching_program_assignments")
      .select("athlete_id, relationship_id")
      .eq("id", assignmentId)
      .maybeSingle();

    if (!assignment) {
      return { ok: false, error: "Program not found." };
    }

    const { data: athlete } = await supabase
      .from("athletes")
      .select("user_id")
      .eq("id", assignment.athlete_id)
      .maybeSingle();

    if (!athlete || athlete.user_id !== userId) {
      return { ok: false, error: "You can only update your own program." };
    }

    const result = await addCompletedDateToAssignment(
      supabase,
      assignmentId,
      targetDate,
    );

    if (!result.ok) {
      return result;
    }

    revalidatePath("/athlete/home");
    revalidatePath("/coach-network/remote-athletes");
    revalidatePath(
      `/coach-network/remote-athletes/${assignment.relationship_id}`,
    );
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error ? error.message : "Could not mark day complete.",
    };
  }
}
