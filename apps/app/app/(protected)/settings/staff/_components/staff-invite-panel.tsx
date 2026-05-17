"use client";

import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
  createStaffInvite,
  revokeStaffInvite,
  type CreateStaffInviteInput,
} from "../../../../actions/workspace";
import {
  INVITABLE_ORGANIZATION_ROLES,
  formatOrganizationRole,
} from "../../../../../lib/org-roles";
import type { AthleteTeamOption, StaffInviteRow } from "../../../../../lib/workspace";

function inputClassName() {
  return "w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm font-medium text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-primary/15";
}

function formatExpiry(iso: string | null) {
  if (!iso) {
    return "No expiry";
  }
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
  }).format(new Date(iso));
}

export function StaffInvitePanel({
  teams,
  pendingInvites,
}: {
  teams: AthleteTeamOption[];
  pendingInvites: StaffInviteRow[];
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState<CreateStaffInviteInput>({
    role: "assistant_coach",
    email: "",
    teamId: "",
  });

  function submitInvite() {
    setError(null);
    setNotice(null);
    setInviteUrl(null);

    startTransition(async () => {
      const result = await createStaffInvite({
        role: form.role,
        email: form.email?.trim() || undefined,
        teamId: form.teamId || undefined,
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setInviteUrl(result.claimUrl ?? null);
      setNotice(result.message ?? null);
      router.refresh();
    });
  }

  function revoke(inviteId: string) {
    setError(null);

    startTransition(async () => {
      const result = await revokeStaffInvite(inviteId);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      router.refresh();
    });
  }

  return (
    <div className="mt-4 space-y-4">
      <div className="rounded-3xl border border-border bg-card p-5">
        <p className="text-sm font-extrabold text-foreground">Invite staff</p>
        <p className="mt-1 text-xs font-medium text-muted-foreground">
          Add an email to send the invite automatically. The generated link
          remains available for manual sharing when needed.
        </p>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <select
            className={inputClassName()}
            value={form.role}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                role: event.target.value as CreateStaffInviteInput["role"],
              }))
            }
          >
            {INVITABLE_ORGANIZATION_ROLES.map((role) => (
              <option key={role} value={role}>
                {formatOrganizationRole(role)}
              </option>
            ))}
          </select>
          <input
            type="email"
            className={inputClassName()}
            value={form.email}
            onChange={(event) =>
              setForm((current) => ({ ...current, email: event.target.value }))
            }
            placeholder="Email (recommended)"
          />
          <select
            className={`${inputClassName()} md:col-span-2`}
            value={form.teamId}
            onChange={(event) =>
              setForm((current) => ({ ...current, teamId: event.target.value }))
            }
          >
            <option value="">All teams (organization access)</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={isPending}
            onClick={submitInvite}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-extrabold text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-60"
          >
            <Icon icon="solar:user-plus-bold" className="size-4" />
            {isPending ? "Creating…" : "Create invite link"}
          </button>
        </div>

        {inviteUrl ? (
          <div className="mt-4">
            <label className="text-xs font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
              Invite link
            </label>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
              <input readOnly className={inputClassName()} value={inviteUrl} />
              <button
                type="button"
                onClick={() => {
                  void navigator.clipboard.writeText(inviteUrl);
                }}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-extrabold text-primary-foreground transition-colors hover:bg-primary-hover"
              >
                <Icon icon="solar:copy-bold" className="size-4" />
                Copy
              </button>
            </div>
          </div>
        ) : null}

        {error ? (
          <p className="mt-4 text-sm font-bold text-destructive">{error}</p>
        ) : null}
        {notice ? (
          <p className="mt-4 text-sm font-bold text-primary-700">{notice}</p>
        ) : null}
      </div>

      {pendingInvites.length > 0 ? (
        <div className="rounded-3xl border border-border bg-card p-5">
          <p className="text-sm font-extrabold text-foreground">Pending invites</p>
          <ul className="mt-4 space-y-3">
            {pendingInvites.map((invite) => (
              <li
                key={invite.id}
                className="flex flex-col gap-2 rounded-2xl border border-border bg-background px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm font-bold text-foreground">
                    {formatOrganizationRole(invite.role)}
                    {invite.teamName ? ` · ${invite.teamName}` : ""}
                  </p>
                  <p className="mt-1 text-xs font-medium text-muted-foreground">
                    {invite.email ?? "No email on file"} · expires{" "}
                    {formatExpiry(invite.expires_at)}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => revoke(invite.id)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-destructive/30 px-3 py-2 text-xs font-bold text-destructive transition-colors hover:bg-destructive-soft disabled:opacity-60"
                >
                  Revoke
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
