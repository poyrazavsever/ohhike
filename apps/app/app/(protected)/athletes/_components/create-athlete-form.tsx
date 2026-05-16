"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

import {
  createAthlete,
  type CreateAthleteInput,
} from "../../../actions/workspace";
import type { SportType } from "../../../../lib/database.types";
import type { AthleteTeamOption } from "../../../../lib/workspace";

const sportFieldConfig: Record<
  SportType,
  {
    numberPlaceholder: string;
    positionLabel: string;
    positionPlaceholder: string;
    positionOptions: string[];
    dominantSideLabel: string;
    dominantSideOptions: string[];
  }
> = {
  football: {
    numberPlaceholder: "8",
    positionLabel: "Position",
    positionPlaceholder: "Midfielder",
    positionOptions: ["Goalkeeper", "Defender", "Full-back", "Midfielder", "Winger", "Forward", "Striker"],
    dominantSideLabel: "Dominant foot",
    dominantSideOptions: ["Right foot", "Left foot", "Both"],
  },
  basketball: {
    numberPlaceholder: "11",
    positionLabel: "Position",
    positionPlaceholder: "Guard",
    positionOptions: ["Point guard", "Shooting guard", "Wing", "Forward", "Center"],
    dominantSideLabel: "Dominant hand",
    dominantSideOptions: ["Right hand", "Left hand", "Both"],
  },
  volleyball: {
    numberPlaceholder: "7",
    positionLabel: "Role",
    positionPlaceholder: "Outside hitter",
    positionOptions: ["Setter", "Outside hitter", "Opposite", "Middle blocker", "Libero"],
    dominantSideLabel: "Dominant hand",
    dominantSideOptions: ["Right hand", "Left hand", "Both"],
  },
  handball: {
    numberPlaceholder: "9",
    positionLabel: "Position",
    positionPlaceholder: "Back",
    positionOptions: ["Goalkeeper", "Wing", "Back", "Center back", "Pivot"],
    dominantSideLabel: "Dominant hand",
    dominantSideOptions: ["Right hand", "Left hand", "Both"],
  },
  running: {
    numberPlaceholder: "21",
    positionLabel: "Discipline",
    positionPlaceholder: "Middle distance",
    positionOptions: ["Sprint", "Middle distance", "Long distance", "Trail", "Road"],
    dominantSideLabel: "Preferred side",
    dominantSideOptions: ["Right", "Left", "Balanced"],
  },
  fitness: {
    numberPlaceholder: "4",
    positionLabel: "Focus area",
    positionPlaceholder: "Strength",
    positionOptions: ["Strength", "Conditioning", "Mobility", "Recovery"],
    dominantSideLabel: "Dominant side",
    dominantSideOptions: ["Right", "Left", "Balanced"],
  },
  tennis: {
    numberPlaceholder: "3",
    positionLabel: "Play style",
    positionPlaceholder: "Baseline",
    positionOptions: ["Baseline", "Serve and volley", "All-court", "Counterpuncher"],
    dominantSideLabel: "Dominant hand",
    dominantSideOptions: ["Right hand", "Left hand", "Both"],
  },
  swimming: {
    numberPlaceholder: "5",
    positionLabel: "Stroke",
    positionPlaceholder: "Freestyle",
    positionOptions: ["Freestyle", "Backstroke", "Breaststroke", "Butterfly", "Medley"],
    dominantSideLabel: "Dominant side",
    dominantSideOptions: ["Right", "Left", "Balanced"],
  },
  martial_arts: {
    numberPlaceholder: "12",
    positionLabel: "Style",
    positionPlaceholder: "Striker",
    positionOptions: ["Striker", "Grappler", "All-rounder", "Defensive"],
    dominantSideLabel: "Stance",
    dominantSideOptions: ["Orthodox", "Southpaw", "Switch"],
  },
  esports: {
    numberPlaceholder: "10",
    positionLabel: "Role",
    positionPlaceholder: "Support",
    positionOptions: ["Captain", "Entry", "Support", "Flex", "IGL"],
    dominantSideLabel: "Dominant hand",
    dominantSideOptions: ["Right hand", "Left hand", "Both"],
  },
  other: {
    numberPlaceholder: "1",
    positionLabel: "Role",
    positionPlaceholder: "Role",
    positionOptions: ["Starter", "Rotation", "Development", "Other"],
    dominantSideLabel: "Dominant side",
    dominantSideOptions: ["Right", "Left", "Balanced"],
  },
};

function inputClassName() {
  return "w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm font-medium text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-primary/15";
}

export function CreateAthleteForm({ teams }: { teams: AthleteTeamOption[] }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState<CreateAthleteInput>({
    teamId: teams[0]?.id ?? "",
    firstName: "",
    lastName: "",
    email: "",
    number: "",
    position: "",
    dominantSide: "",
  });

  const selectedTeam = useMemo(
    () => teams.find((team) => team.id === form.teamId) ?? teams[0],
    [form.teamId, teams],
  );
  const fieldConfig = sportFieldConfig[selectedTeam?.sport_type ?? "football"];

  function resetForm() {
    setForm({
      teamId: teams[0]?.id ?? "",
      firstName: "",
      lastName: "",
      email: "",
      number: "",
      position: "",
      dominantSide: "",
    });
  }

  function closeModal() {
    setError(null);
    setIsOpen(false);
  }

  function submit() {
    setError(null);

    startTransition(async () => {
      const result = await createAthlete(form);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      resetForm();
      setIsOpen(false);
      router.refresh();
    });
  }

  return (
    <div className="mt-6 flex justify-end">
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        disabled={teams.length === 0}
        className="rounded-xl bg-primary px-4 py-2.5 text-sm font-extrabold text-primary-foreground transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
      >
        Add athlete
      </button>

      {isOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 px-4 py-6 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-athlete-title"
        >
          <button
            type="button"
            aria-label="Close add athlete modal"
            onClick={closeModal}
            className="absolute inset-0 cursor-default"
          />

          <div className="relative z-10 w-full max-w-2xl rounded-3xl border border-border bg-card p-5 shadow-xl md:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p id="create-athlete-title" className="text-base font-extrabold text-foreground">
                  Add athlete
                </p>
                <p className="mt-1 text-sm font-medium text-muted-foreground">
                  Create a coach-managed athlete profile. Account claiming comes later.
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-xl border border-border px-3 py-2 text-xs font-bold text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
              >
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
                    position: "",
                    dominantSide: "",
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
                  setForm((current) => ({ ...current, firstName: event.target.value }))
                }
                placeholder="First name"
              />
              <input
                className={inputClassName()}
                value={form.lastName}
                onChange={(event) =>
                  setForm((current) => ({ ...current, lastName: event.target.value }))
                }
                placeholder="Last name"
              />
              <input
                type="email"
                className={inputClassName()}
                value={form.email}
                onChange={(event) =>
                  setForm((current) => ({ ...current, email: event.target.value }))
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
                  setForm((current) => ({ ...current, number: event.target.value }))
                }
                placeholder={fieldConfig.numberPlaceholder}
              />
              <select
                className={inputClassName()}
                value={form.position}
                onChange={(event) =>
                  setForm((current) => ({ ...current, position: event.target.value }))
                }
                aria-label={fieldConfig.positionLabel}
              >
                <option value="">{fieldConfig.positionPlaceholder}</option>
                {fieldConfig.positionOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <select
                className={inputClassName()}
                value={form.dominantSide}
                onChange={(event) =>
                  setForm((current) => ({ ...current, dominantSide: event.target.value }))
                }
                aria-label={fieldConfig.dominantSideLabel}
              >
                <option value="">{fieldConfig.dominantSideLabel}</option>
                {fieldConfig.dominantSideOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
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
                className="rounded-xl border border-border px-4 py-2.5 text-sm font-bold text-foreground transition-colors hover:border-primary"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={submit}
                className="rounded-xl bg-primary px-4 py-2.5 text-sm font-extrabold text-primary-foreground transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isPending ? "Adding..." : "Save athlete"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
