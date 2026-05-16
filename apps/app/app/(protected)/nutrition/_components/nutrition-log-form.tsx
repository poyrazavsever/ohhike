"use client";

import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
  upsertNutritionLog,
  type UpsertNutritionLogInput,
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

function emptyForm(athleteId: string): UpsertNutritionLogInput {
  return {
    athleteId,
    logDate: today(),
    hydrationScore: "",
    mealQuality: "",
    proteinServings: "",
    carbsTiming: "",
    supplements: "",
    notes: "",
  };
}

export function NutritionLogForm({ athletes }: { athletes: AthleteOption[] }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<UpsertNutritionLogInput>(
    emptyForm(athletes[0]?.id ?? ""),
  );
  const [isPending, startTransition] = useTransition();

  function closeModal() {
    setError(null);
    setIsOpen(false);
  }

  function submit() {
    setError(null);

    startTransition(async () => {
      const result = await upsertNutritionLog(form);

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
        <Icon icon="solar:cup-hot-bold" className="size-4" />
        Add nutrition log
      </button>

      {isOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 px-4 py-6 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            aria-label="Close nutrition log modal"
            onClick={closeModal}
            className="absolute inset-0 cursor-default"
          />

          <div className="relative z-10 max-h-[90svh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-border bg-card p-5 shadow-xl md:p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary-700">
                  <Icon icon="solar:cup-hot-bold" className="size-5" />
                </div>
                <div>
                  <p className="text-base font-extrabold text-foreground">
                    Nutrition log
                  </p>
                  <p className="mt-1 text-sm font-medium text-muted-foreground">
                    Track hydration, meal quality, protein and nutrition notes.
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
                value={form.logDate}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    logDate: event.target.value,
                  }))
                }
              />
              <input
                type="number"
                min="1"
                max="10"
                className={inputClassName()}
                value={form.hydrationScore}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    hydrationScore: event.target.value,
                  }))
                }
                placeholder="Hydration 1-10"
              />
              <input
                type="number"
                min="1"
                max="10"
                className={inputClassName()}
                value={form.mealQuality}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    mealQuality: event.target.value,
                  }))
                }
                placeholder="Meal quality 1-10"
              />
              <input
                type="number"
                min="0"
                className={inputClassName()}
                value={form.proteinServings}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    proteinServings: event.target.value,
                  }))
                }
                placeholder="Protein servings"
              />
              <input
                className={inputClassName()}
                value={form.carbsTiming}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    carbsTiming: event.target.value,
                  }))
                }
                placeholder="Carbs timing"
              />
              <textarea
                className={`${inputClassName()} min-h-24 resize-none md:col-span-2`}
                value={form.supplements}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    supplements: event.target.value,
                  }))
                }
                placeholder="Supplements"
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

            <p className="mt-4 text-xs font-medium text-muted-foreground">
              Existing nutrition log for the same athlete and date will be updated.
            </p>

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
                {isPending ? "Saving..." : "Save log"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
