"use client";

import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { createTeam, type CreateTeamInput } from "../../../actions/workspace";
import type { SportType } from "../../../../lib/database.types";

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

export function CreateTeamForm() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState<CreateTeamInput>({
    name: "",
    sportType: "football",
    ageGroup: "",
    level: "",
    seasonGoal: "",
    weeklyTrainingCount: "",
  });

  function resetForm() {
    setForm({
      name: "",
      sportType: "football",
      ageGroup: "",
      level: "",
      seasonGoal: "",
      weeklyTrainingCount: "",
    });
  }

  function submit() {
    setError(null);

    startTransition(async () => {
      const result = await createTeam(form);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      resetForm();
      setIsOpen(false);
      router.refresh();
    });
  }

  function closeModal() {
    setError(null);
    setIsOpen(false);
  }

  return (
    <div className="mt-6 flex justify-end">
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-extrabold text-primary-foreground transition-colors hover:bg-primary-hover"
      >
        <Icon icon="solar:add-circle-bold" className="size-4" />
        Create team
      </button>

      {isOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 px-4 py-6 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-team-title"
        >
          <button
            type="button"
            aria-label="Close create team modal"
            onClick={closeModal}
            className="absolute inset-0 cursor-default"
          />

          <div className="relative z-10 w-full max-w-2xl rounded-3xl border border-border bg-card p-5 shadow-xl md:p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary-700">
                  <Icon icon="solar:users-group-rounded-bold" className="size-5" />
                </div>
                <div>
                <p
                  id="create-team-title"
                  className="text-base font-extrabold text-foreground"
                >
                  Create team
                </p>
                <p className="mt-1 text-sm font-medium text-muted-foreground">
                  Add another team under the active organization.
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
                  setForm((current) => ({ ...current, name: event.target.value }))
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
                placeholder="Age group, e.g. U17"
              />
              <input
                className={inputClassName()}
                value={form.level}
                onChange={(event) =>
                  setForm((current) => ({ ...current, level: event.target.value }))
                }
                placeholder="Level, e.g. Academy"
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
                onClick={submit}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-extrabold text-primary-foreground transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Icon icon="solar:diskette-bold" className="size-4" />
                {isPending ? "Creating..." : "Save team"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
