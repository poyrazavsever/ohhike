"use client";

import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
  createPersonalTraining,
  type CreatePersonalTrainingInput,
} from "../../../actions/workspace";
import { personalTrainingTypeSelectOptions } from "../../../../lib/coach-vocabulary";

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

function athleteName(athlete: AthleteOption) {
  return [
    athlete.number ? `#${athlete.number}` : null,
    athlete.first_name,
    athlete.last_name,
  ]
    .filter(Boolean)
    .join(" ");
}

function toDatetimeLocal(value?: string) {
  if (!value) {
    return new Date(Date.now() - new Date().getTimezoneOffset() * 60_000)
      .toISOString()
      .slice(0, 16);
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 16);
}

function emptyForm(athleteId: string): CreatePersonalTrainingInput {
  return {
    athleteId,
    title: "",
    trainingType: "",
    startedAt: toDatetimeLocal(),
    durationMin: "",
    distanceKm: "",
    rpe: "",
    notes: "",
  };
}

export function CreatePersonalTrainingForm({
  athletes,
}: {
  athletes: AthleteOption[];
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<CreatePersonalTrainingInput>(
    emptyForm(athletes[0]?.id ?? ""),
  );
  const [isPending, startTransition] = useTransition();

  const typeOptions = personalTrainingTypeSelectOptions(form.trainingType);

  function closeModal() {
    setError(null);
    setIsOpen(false);
  }

  function submit() {
    setError(null);

    startTransition(async () => {
      const result = await createPersonalTraining(form);

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
        <Icon icon="solar:running-bold" className="size-4" />
        Log personal training
      </button>

      {isOpen ? (
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
          <div className="relative z-10 max-h-[90svh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-border bg-card p-5 shadow-xl md:p-6">
            <p className="text-base font-extrabold text-foreground">
              Log personal training
            </p>
            <p className="mt-1 text-sm font-medium text-muted-foreground">
              Record work outside scheduled team sessions.
            </p>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
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
              <select
                className={inputClassName()}
                value={form.trainingType}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    trainingType: event.target.value,
                  }))
                }
              >
                {typeOptions.map((option) => (
                  <option key={option.value || "type"} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <input
                className={`${inputClassName()} md:col-span-2`}
                value={form.title}
                onChange={(event) =>
                  setForm((current) => ({ ...current, title: event.target.value }))
                }
                placeholder="Title (e.g. Extra shooting, gym session)"
              />
              <input
                type="datetime-local"
                className={inputClassName()}
                value={form.startedAt}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    startedAt: event.target.value,
                  }))
                }
              />
              <input
                type="number"
                min="1"
                max="600"
                className={inputClassName()}
                value={form.durationMin}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    durationMin: event.target.value,
                  }))
                }
                placeholder="Duration (minutes)"
              />
              <input
                type="number"
                min="0"
                step="0.1"
                className={inputClassName()}
                value={form.distanceKm}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    distanceKm: event.target.value,
                  }))
                }
                placeholder="Distance (km, optional)"
              />
              <input
                type="number"
                min="1"
                max="10"
                className={inputClassName()}
                value={form.rpe}
                onChange={(event) =>
                  setForm((current) => ({ ...current, rpe: event.target.value }))
                }
                placeholder="RPE 1-10"
              />
              <textarea
                className={`${inputClassName()} min-h-20 resize-none md:col-span-2`}
                value={form.notes}
                onChange={(event) =>
                  setForm((current) => ({ ...current, notes: event.target.value }))
                }
                placeholder="Notes"
              />
            </div>

            {error ? (
              <p className="mt-4 text-sm font-bold text-destructive">{error}</p>
            ) : null}

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={closeModal}
                className="rounded-xl border border-border px-4 py-2.5 text-sm font-bold text-foreground"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={submit}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-extrabold text-primary-foreground disabled:opacity-60"
              >
                {isPending ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
