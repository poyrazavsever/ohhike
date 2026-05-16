"use client";

import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

import {
  upsertReadinessCheckin,
  type UpsertReadinessCheckinInput,
} from "../../../actions/workspace";

type AthleteOption = {
  id: string;
  team_id: string;
  first_name: string;
  last_name: string | null;
  number: number | null;
};

function inputClassName() {
  return "w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm font-medium text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-primary/15";
}

function today() {
  return new Date().toISOString().slice(0, 10);
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

function emptyForm(athleteId: string): UpsertReadinessCheckinInput {
  return {
    athleteId,
    checkinDate: today(),
    sleepQuality: "",
    sleepHours: "",
    fatigue: "",
    muscleSoreness: "",
    stress: "",
    mood: "",
    painArea: "",
    notes: "",
  };
}

export function ReadinessCheckinForm({
  athletes,
}: {
  athletes: AthleteOption[];
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<UpsertReadinessCheckinInput>(
    emptyForm(athletes[0]?.id ?? ""),
  );
  const [isPending, startTransition] = useTransition();

  const selectedAthlete = useMemo(
    () => athletes.find((athlete) => athlete.id === form.athleteId),
    [athletes, form.athleteId],
  );

  function closeModal() {
    setError(null);
    setIsOpen(false);
  }

  function submit() {
    setError(null);

    startTransition(async () => {
      const result = await upsertReadinessCheckin(form);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setForm(emptyForm(athletes[0]?.id ?? ""));
      closeModal();
      router.refresh();
    });
  }

  return (
    <div className="mt-6 flex justify-end">
      <button
        type="button"
        onClick={() => {
          setForm(emptyForm(athletes[0]?.id ?? ""));
          setIsOpen(true);
        }}
        disabled={athletes.length === 0}
        className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-extrabold text-primary-foreground transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Icon icon="solar:pulse-2-bold" className="size-4" />
        Add check-in
      </button>

      {isOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 px-4 py-6 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            aria-label="Close readiness check-in modal"
            onClick={closeModal}
            className="absolute inset-0 cursor-default"
          />

          <div className="relative z-10 max-h-[90svh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-border bg-card p-5 shadow-xl md:p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary-700">
                  <Icon icon="solar:pulse-2-bold" className="size-5" />
                </div>
                <div>
                  <p className="text-base font-extrabold text-foreground">
                    Readiness check-in
                  </p>
                  <p className="mt-1 text-sm font-medium text-muted-foreground">
                    Track sleep, fatigue, soreness, stress and mood for one athlete.
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
                className={inputClassName()}
                value={form.athleteId}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    athleteId: event.target.value,
                  }))
                }
              >
                {athletes.map((athlete) => (
                  <option key={athlete.id} value={athlete.id}>
                    {athleteName(athlete)}
                  </option>
                ))}
              </select>
              <input
                type="date"
                className={inputClassName()}
                value={form.checkinDate}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    checkinDate: event.target.value,
                  }))
                }
              />
              <input
                type="number"
                min="1"
                max="10"
                className={inputClassName()}
                value={form.sleepQuality}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    sleepQuality: event.target.value,
                  }))
                }
                placeholder="Sleep quality 1-10"
              />
              <input
                type="number"
                min="0"
                step="0.25"
                className={inputClassName()}
                value={form.sleepHours}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    sleepHours: event.target.value,
                  }))
                }
                placeholder="Sleep hours"
              />
              <input
                type="number"
                min="1"
                max="10"
                className={inputClassName()}
                value={form.fatigue}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    fatigue: event.target.value,
                  }))
                }
                placeholder="Fatigue 1-10"
              />
              <input
                type="number"
                min="1"
                max="10"
                className={inputClassName()}
                value={form.muscleSoreness}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    muscleSoreness: event.target.value,
                  }))
                }
                placeholder="Muscle soreness 1-10"
              />
              <input
                type="number"
                min="1"
                max="10"
                className={inputClassName()}
                value={form.stress}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    stress: event.target.value,
                  }))
                }
                placeholder="Stress 1-10"
              />
              <input
                type="number"
                min="1"
                max="10"
                className={inputClassName()}
                value={form.mood}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    mood: event.target.value,
                  }))
                }
                placeholder="Mood 1-10"
              />
              <input
                className={inputClassName()}
                value={form.painArea}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    painArea: event.target.value,
                  }))
                }
                placeholder="Pain area"
              />
              <textarea
                className={`${inputClassName()} min-h-24 resize-none md:col-span-2`}
                value={form.notes}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    notes: event.target.value,
                  }))
                }
                placeholder="Notes"
              />
            </div>

            {selectedAthlete ? (
              <p className="mt-4 text-xs font-medium text-muted-foreground">
                Existing check-in for the same athlete and date will be updated.
              </p>
            ) : null}

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
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-extrabold text-primary-foreground transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Icon icon="solar:diskette-bold" className="size-4" />
                {isPending ? "Saving..." : "Save check-in"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
