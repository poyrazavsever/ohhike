"use client";

import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

import {
  createSession,
  type CreateSessionInput,
} from "../../../actions/workspace";
import {
  SESSION_FOCUS_AREA_OPTIONS,
  SESSION_PLANNED_INTENSITY_OPTIONS,
} from "../../../../lib/coach-vocabulary";
import type { SessionType } from "../../../../lib/db.types";
import type { AthleteTeamOption } from "../../../../lib/workspace";

type AthleteOption = {
  id: string;
  team_id: string;
  first_name: string;
  last_name: string | null;
  number: number | null;
};

const sessionTypes: Array<{ label: string; value: SessionType }> = [
  { label: "Team training", value: "team_training" },
  { label: "Match", value: "match" },
  { label: "Friendly match", value: "friendly_match" },
  { label: "Recovery", value: "recovery" },
  { label: "Test day", value: "test_day" },
  { label: "Analysis meeting", value: "analysis_meeting" },
  { label: "Nutrition session", value: "nutrition_session" },
  { label: "Education session", value: "education_session" },
  { label: "Other", value: "other" },
];

function inputClassName() {
  return "w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm font-medium text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-primary/15";
}

function athleteName(athlete: AthleteOption) {
  return [
    athlete.number ? `#${athlete.number}` : null,
    athlete.first_name,
    athlete.last_name,
  ]
    .filter(Boolean)
    .join(" ");
}

export function CreateSessionForm({
  teams,
  athletes,
}: {
  teams: AthleteTeamOption[];
  athletes: AthleteOption[];
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState<CreateSessionInput>({
    teamId: teams[0]?.id ?? "",
    title: "",
    type: "team_training",
    scheduledAt: "",
    location: "",
    opponent: "",
    plannedDurationMin: "",
    plannedIntensity: "",
    focusArea: "",
    coachNotes: "",
    athleteIds: [],
  });

  const teamAthletes = useMemo(
    () => athletes.filter((athlete) => athlete.team_id === form.teamId),
    [athletes, form.teamId],
  );

  function resetForm() {
    setForm({
      teamId: teams[0]?.id ?? "",
      title: "",
      type: "team_training",
      scheduledAt: "",
      location: "",
      opponent: "",
      plannedDurationMin: "",
      plannedIntensity: "",
      focusArea: "",
      coachNotes: "",
      athleteIds: [],
    });
  }

  function closeModal() {
    setError(null);
    setIsOpen(false);
  }

  function toggleAthlete(athleteId: string) {
    setForm((current) => ({
      ...current,
      athleteIds: current.athleteIds.includes(athleteId)
        ? current.athleteIds.filter((id) => id !== athleteId)
        : [...current.athleteIds, athleteId],
    }));
  }

  function submit() {
    setError(null);

    startTransition(async () => {
      const result = await createSession(form);

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
        className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-extrabold text-primary-foreground transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Icon icon="solar:add-circle-bold" className="size-4" />
        Create session
      </button>

      {isOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 px-4 py-6 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-session-title"
        >
          <button
            type="button"
            aria-label="Close create session modal"
            onClick={closeModal}
            className="absolute inset-0 cursor-default"
          />

          <div className="relative z-10 max-h-[90svh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-border bg-card p-5 shadow-xl md:p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary-700">
                  <Icon icon="solar:clipboard-list-bold" className="size-5" />
                </div>
                <div>
                  <p id="create-session-title" className="text-base font-extrabold text-foreground">
                    Create session
                  </p>
                  <p className="mt-1 text-sm font-medium text-muted-foreground">
                    Plan training, matches or recovery work and draft attendance.
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
                className={`${inputClassName()} md:col-span-2`}
                value={form.title}
                onChange={(event) =>
                  setForm((current) => ({ ...current, title: event.target.value }))
                }
                placeholder="Session title"
              />
              <select
                className={inputClassName()}
                value={form.teamId}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    teamId: event.target.value,
                    athleteIds: [],
                  }))
                }
              >
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
              <select
                className={inputClassName()}
                value={form.type}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    type: event.target.value as SessionType,
                  }))
                }
              >
                {sessionTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              <input
                type="datetime-local"
                className={inputClassName()}
                value={form.scheduledAt}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    scheduledAt: event.target.value,
                  }))
                }
              />
              <input
                className={inputClassName()}
                value={form.location}
                onChange={(event) =>
                  setForm((current) => ({ ...current, location: event.target.value }))
                }
                placeholder="Location"
              />
              <input
                className={inputClassName()}
                value={form.opponent}
                onChange={(event) =>
                  setForm((current) => ({ ...current, opponent: event.target.value }))
                }
                placeholder="Opponent (for match)"
              />
              <input
                type="number"
                min="0"
                className={inputClassName()}
                value={form.plannedDurationMin}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    plannedDurationMin: event.target.value,
                  }))
                }
                placeholder="Duration minutes"
              />
              <select
                className={inputClassName()}
                value={form.plannedIntensity}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    plannedIntensity: event.target.value,
                  }))
                }
              >
                {SESSION_PLANNED_INTENSITY_OPTIONS.map((opt) => (
                  <option key={opt.value || "none"} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <select
                className={inputClassName()}
                value={form.focusArea}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    focusArea: event.target.value,
                  }))
                }
              >
                {SESSION_FOCUS_AREA_OPTIONS.map((opt) => (
                  <option key={opt.value || "none-focus"} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <textarea
                className={`${inputClassName()} min-h-24 resize-none md:col-span-2`}
                value={form.coachNotes}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    coachNotes: event.target.value,
                  }))
                }
                placeholder="Coach notes"
              />
            </div>

            <div className="mt-5 rounded-2xl border border-border bg-background p-4">
              <p className="text-sm font-extrabold text-foreground">
                Draft attendance
              </p>
              <p className="mt-1 text-xs font-medium text-muted-foreground">
                Select athletes to create attendance rows for this session.
              </p>
              <div className="mt-3 grid gap-2 md:grid-cols-2">
                {teamAthletes.length > 0 ? (
                  teamAthletes.map((athlete) => (
                    <label
                      key={athlete.id}
                      className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-sm font-semibold text-foreground"
                    >
                      <input
                        type="checkbox"
                        checked={form.athleteIds.includes(athlete.id)}
                        onChange={() => toggleAthlete(athlete.id)}
                      />
                      {athleteName(athlete)}
                    </label>
                  ))
                ) : (
                  <p className="text-sm font-medium text-muted-foreground">
                    No athletes in this team yet.
                  </p>
                )}
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
                onClick={submit}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-extrabold text-primary-foreground transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Icon icon="solar:diskette-bold" className="size-4" />
                {isPending ? "Creating..." : "Save session"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

