"use client";

import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
  createAthleteInvite,
  deleteAthlete,
  updateAthlete,
  type UpdateAthleteInput,
} from "../../../actions/workspace";
import type { AthleteWithTeamName, AthleteTeamOption } from "../../../../lib/workspace";

function inputClassName() {
  return "w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm font-medium text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-primary/15";
}

export function AthleteRowActions({
  athlete,
  teams,
}: {
  athlete: AthleteWithTeamName;
  teams: AthleteTeamOption[];
}) {
  const router = useRouter();
  const [mode, setMode] = useState<"edit" | "delete" | "invite" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [invitePending, startInviteTransition] = useTransition();
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [inviteNotice, setInviteNotice] = useState<string | null>(null);
  const [form, setForm] = useState<UpdateAthleteInput>({
    athleteId: athlete.id,
    teamId: athlete.team_id,
    firstName: athlete.first_name,
    lastName: athlete.last_name ?? "",
    email: athlete.email ?? "",
    number: String(athlete.number ?? ""),
    position: athlete.position ?? "",
    dominantSide: athlete.dominant_side ?? "",
  });

  function closeModal() {
    setError(null);
    setMode(null);
    setInviteUrl(null);
    setInviteNotice(null);
  }

  function openInviteModal() {
    setError(null);
    setInviteUrl(null);
    setInviteNotice(null);
    setMode("invite");
    startInviteTransition(async () => {
      const result = await createAthleteInvite(athlete.id);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setInviteUrl(result.claimUrl ?? null);
      setInviteNotice(result.message ?? null);
    });
  }

  function submitUpdate() {
    setError(null);

    startTransition(async () => {
      const result = await updateAthlete(form);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setMode(null);
      router.refresh();
    });
  }

  function submitDelete() {
    setError(null);

    startTransition(async () => {
      const result = await deleteAthlete(athlete.id);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setMode(null);
      router.refresh();
    });
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        {athlete.user_id ? null : (
          <button
            type="button"
            onClick={openInviteModal}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs font-bold text-foreground transition-colors hover:border-primary"
          >
            <Icon icon="solar:letter-bold" className="size-3.5" />
            Invite
          </button>
        )}
        <button
          type="button"
          onClick={() => setMode("edit")}
          className="inline-flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs font-bold text-foreground transition-colors hover:border-primary"
        >
          <Icon icon="solar:pen-2-bold" className="size-3.5" />
          Edit
        </button>
        <button
          type="button"
          onClick={() => setMode("delete")}
          className="inline-flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs font-bold text-muted-foreground transition-colors hover:border-destructive hover:text-destructive-foreground"
        >
          <Icon icon="solar:trash-bin-trash-bold" className="size-3.5" />
          Delete
        </button>
      </div>

      {mode ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 px-4 py-6 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            aria-label="Close modal"
            onClick={closeModal}
            className="absolute inset-0 cursor-default"
          />

          <div className="relative z-10 w-full max-w-2xl rounded-3xl border border-border bg-card p-5 shadow-xl md:p-6">
            {mode === "edit" ? (
              <>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary-700">
                      <Icon icon="solar:pen-2-bold" className="size-5" />
                    </div>
                    <div>
                      <p className="text-base font-extrabold text-foreground">
                        Edit athlete
                      </p>
                      <p className="mt-1 text-sm font-medium text-muted-foreground">
                        Update athlete profile and team assignment.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs font-bold text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
                  >
                    <Icon icon="solar:close-circle-bold" className="size-3.5" />
                    Close
                  </button>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <select
                    className={`${inputClassName()} md:col-span-2`}
                    value={form.teamId}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        teamId: event.target.value,
                      }))
                    }
                  >
                    {teams.map((team) => (
                      <option key={team.id} value={team.id}>
                        {team.name}
                      </option>
                    ))}
                  </select>
                  <input
                    className={inputClassName()}
                    value={form.firstName}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        firstName: event.target.value,
                      }))
                    }
                    placeholder="First name"
                  />
                  <input
                    className={inputClassName()}
                    value={form.lastName}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        lastName: event.target.value,
                      }))
                    }
                    placeholder="Last name"
                  />
                  <input
                    type="email"
                    className={inputClassName()}
                    value={form.email}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        email: event.target.value,
                      }))
                    }
                    placeholder="athlete@example.com"
                  />
                  <input
                    type="number"
                    min="0"
                    step="1"
                    className={inputClassName()}
                    value={form.number}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        number: event.target.value,
                      }))
                    }
                    placeholder="Number"
                  />
                  <input
                    className={inputClassName()}
                    value={form.position}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        position: event.target.value,
                      }))
                    }
                    placeholder="Position / role"
                  />
                  <input
                    className={inputClassName()}
                    value={form.dominantSide}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        dominantSide: event.target.value,
                      }))
                    }
                    placeholder="Dominant side"
                  />
                </div>

                {error ? (
                  <div className="mt-5 rounded-2xl border border-destructive/30 bg-destructive-soft p-4 text-sm font-bold text-destructive-foreground">
                    {error}
                  </div>
                ) : null}

                <div className="mt-5 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-bold text-foreground transition-colors hover:border-primary"
                  >
                    <Icon icon="solar:close-circle-bold" className="size-4" />
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={submitUpdate}
                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-extrabold text-primary-foreground transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Icon icon="solar:diskette-bold" className="size-4" />
                    {isPending ? "Saving..." : "Save changes"}
                  </button>
                </div>
              </>
            ) : mode === "invite" ? (
              <>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary-700">
                      <Icon icon="solar:letter-bold" className="size-5" />
                    </div>
                    <div>
                      <p className="text-base font-extrabold text-foreground">
                        Athlete claim link
                      </p>
                      <p className="mt-1 text-sm font-medium text-muted-foreground">
                        If the athlete has an email address, OhHike sends the
                        invite automatically. The link below remains available
                        for WhatsApp, SMS, or team chat. It expires in 14 days.
                        Creating a new link replaces any pending invite for this
                        profile.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs font-bold text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
                  >
                    <Icon icon="solar:close-circle-bold" className="size-3.5" />
                    Close
                  </button>
                </div>

                {invitePending && !inviteUrl && !error ? (
                  <p className="mt-5 text-sm font-semibold text-muted-foreground">
                    Creating link…
                  </p>
                ) : null}

                {inviteUrl ? (
                  <div className="mt-5">
                    <label className="text-xs font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
                      Invite link
                    </label>
                    <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
                      <input
                        readOnly
                        className={inputClassName()}
                        value={inviteUrl}
                      />
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

                {inviteNotice ? (
                  <p className="mt-4 text-sm font-bold text-primary-700">
                    {inviteNotice}
                  </p>
                ) : null}

                {error ? (
                  <div className="mt-5 rounded-2xl border border-destructive/30 bg-destructive-soft p-4 text-sm font-bold text-destructive-foreground">
                    {error}
                  </div>
                ) : null}
              </>
            ) : (
              <>
                <div className="flex gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-destructive-soft text-destructive-foreground">
                    <Icon icon="solar:trash-bin-trash-bold" className="size-5" />
                  </div>
                  <div>
                    <p className="text-base font-extrabold text-foreground">
                      Delete athlete
                    </p>
                    <p className="mt-2 text-sm font-medium leading-6 text-muted-foreground">
                      This will delete <strong>{athlete.display_name ?? athlete.first_name}</strong>.
                    </p>
                  </div>
                </div>

                {error ? (
                  <div className="mt-5 rounded-2xl border border-destructive/30 bg-destructive-soft p-4 text-sm font-bold text-destructive-foreground">
                    {error}
                  </div>
                ) : null}

                <div className="mt-5 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-bold text-foreground transition-colors hover:border-primary"
                  >
                    <Icon icon="solar:close-circle-bold" className="size-4" />
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={submitDelete}
                    className="inline-flex items-center gap-2 rounded-xl bg-destructive px-4 py-2.5 text-sm font-extrabold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Icon icon="solar:trash-bin-trash-bold" className="size-4" />
                    {isPending ? "Deleting..." : "Delete athlete"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
