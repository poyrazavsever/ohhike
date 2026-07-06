"use client";

import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
  deleteTeam,
  updateTeam,
  type UpdateTeamInput,
} from "../../../actions/workspace";
import type { SportType } from "../../../../lib/db.types";
import type { TeamWithEntitlement } from "../../../../lib/workspace";

const sportTypes: Array<{ label: string; value: SportType }> = [
  { label: "Football", value: "football" },
  { label: "Basketball", value: "basketball" },
  { label: "Volleyball", value: "volleyball" },
  { label: "Handball", value: "handball" },
  { label: "Running", value: "running" },
  { label: "Fitness", value: "fitness" },
  { label: "Tennis", value: "tennis" },
  { label: "Swimming", value: "swimming" },
  { label: "Martial arts", value: "martial_arts" },
  { label: "Esports", value: "esports" },
  { label: "Other", value: "other" },
];

function inputClassName() {
  return "w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm font-medium text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-primary/15";
}

export function TeamCardActions({ team }: { team: TeamWithEntitlement }) {
  const router = useRouter();
  const [mode, setMode] = useState<"edit" | "delete" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState<UpdateTeamInput>({
    teamId: team.id,
    name: team.name,
    sportType: team.sport_type,
    ageGroup: team.age_group ?? "",
    level: team.level ?? "",
    seasonGoal: team.season_goal ?? "",
    weeklyTrainingCount: String(team.weekly_training_count ?? ""),
  });

  function closeModal() {
    setError(null);
    setMode(null);
  }

  function submitUpdate() {
    setError(null);

    startTransition(async () => {
      const result = await updateTeam(form);

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
      const result = await deleteTeam(team.id);

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
      <div className="flex items-center gap-2">
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
                      Edit team
                    </p>
                    <p className="mt-1 text-sm font-medium text-muted-foreground">
                      Update team details and training setup.
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
                  <input
                    className={inputClassName()}
                    value={form.name}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        name: event.target.value,
                      }))
                    }
                    placeholder="Team name"
                  />
                  <select
                    className={inputClassName()}
                    value={form.sportType}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        sportType: event.target.value as SportType,
                      }))
                    }
                  >
                    {sportTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  <input
                    className={inputClassName()}
                    value={form.ageGroup}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        ageGroup: event.target.value,
                      }))
                    }
                    placeholder="Age group"
                  />
                  <input
                    className={inputClassName()}
                    value={form.level}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        level: event.target.value,
                      }))
                    }
                    placeholder="Level"
                  />
                  <input
                    type="number"
                    min="0"
                    step="1"
                    className={inputClassName()}
                    value={form.weeklyTrainingCount}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        weeklyTrainingCount: event.target.value,
                      }))
                    }
                    placeholder="Weekly training count"
                  />
                  <input
                    className={inputClassName()}
                    value={form.seasonGoal}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        seasonGoal: event.target.value,
                      }))
                    }
                    placeholder="Season goal"
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
            ) : (
              <>
                <div className="flex gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-destructive-soft text-destructive-foreground">
                    <Icon icon="solar:trash-bin-trash-bold" className="size-5" />
                  </div>
                  <div>
                    <p className="text-base font-extrabold text-foreground">
                      Delete team
                    </p>
                <p className="mt-2 text-sm font-medium leading-6 text-muted-foreground">
                  This will delete <strong>{team.name}</strong>. Teams with
                  athletes cannot be deleted until athletes are moved or removed.
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
                    {isPending ? "Deleting..." : "Delete team"}
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

