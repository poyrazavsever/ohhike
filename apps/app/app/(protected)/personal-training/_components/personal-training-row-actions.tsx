"use client";

import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
  deletePersonalTraining,
  updatePersonalTraining,
  type UpdatePersonalTrainingInput,
} from "../../../actions/workspace";
import { personalTrainingTypeSelectOptions } from "../../../../lib/coach-vocabulary";
import type { PersonalTrainingWithAthlete } from "../../../../lib/workspace";

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

function toDatetimeLocal(value: string | null) {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 16);
}

function buildForm(
  training: PersonalTrainingWithAthlete,
): UpdatePersonalTrainingInput {
  return {
    trainingId: training.id,
    athleteId: training.athlete_id,
    title: training.title ?? "",
    trainingType: training.training_type ?? "",
    startedAt: toDatetimeLocal(training.started_at),
    durationMin: training.duration_min?.toString() ?? "",
    distanceKm: training.distance_km?.toString() ?? "",
    rpe: training.rpe?.toString() ?? "",
    notes: training.notes ?? "",
    coachReviewed: training.coach_reviewed ?? false,
    coachNote: training.coach_note ?? "",
  };
}

export function PersonalTrainingRowActions({
  training,
  athletes,
  canCoachReview,
}: {
  training: PersonalTrainingWithAthlete;
  athletes: AthleteOption[];
  canCoachReview: boolean;
}) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<UpdatePersonalTrainingInput>(() =>
    buildForm(training),
  );
  const [isPending, startTransition] = useTransition();

  const typeOptions = personalTrainingTypeSelectOptions(form.trainingType);

  function closeModals() {
    setError(null);
    setEditOpen(false);
    setDeleteOpen(false);
  }

  function save() {
    setError(null);

    startTransition(async () => {
      const result = await updatePersonalTraining(form);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      closeModals();
      router.refresh();
    });
  }

  function confirmDelete() {
    setError(null);

    startTransition(async () => {
      const result = await deletePersonalTraining(training.id);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      closeModals();
      router.refresh();
    });
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => {
          setForm(buildForm(training));
          setEditOpen(true);
        }}
        className="inline-flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs font-bold text-foreground transition-colors hover:border-primary"
      >
        <Icon icon="solar:pen-bold" className="size-3.5" />
        Edit
      </button>
      <button
        type="button"
        onClick={() => setDeleteOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-xl border border-destructive/30 px-3 py-2 text-xs font-bold text-destructive transition-colors hover:bg-destructive-soft"
      >
        <Icon icon="solar:trash-bin-trash-bold" className="size-3.5" />
        Delete
      </button>

      {editOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 px-4 py-6 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            aria-label="Close edit modal"
            onClick={closeModals}
            className="absolute inset-0 cursor-default"
          />
          <div className="relative z-10 max-h-[90svh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-border bg-card p-5 shadow-xl">
            <p className="text-base font-extrabold text-foreground">
              Edit personal training
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
                    {[athlete.first_name, athlete.last_name]
                      .filter(Boolean)
                      .join(" ")}
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
                className={inputClassName()}
                value={form.durationMin}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    durationMin: event.target.value,
                  }))
                }
                placeholder="Minutes"
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
                placeholder="RPE"
              />
              <textarea
                className={`${inputClassName()} min-h-20 resize-none md:col-span-2`}
                value={form.notes}
                onChange={(event) =>
                  setForm((current) => ({ ...current, notes: event.target.value }))
                }
              />
              {canCoachReview ? (
                <>
                  <label className="flex items-center gap-2 text-sm font-bold text-foreground md:col-span-2">
                    <input
                      type="checkbox"
                      checked={form.coachReviewed ?? false}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          coachReviewed: event.target.checked,
                        }))
                      }
                    />
                    Mark as coach reviewed
                  </label>
                  <textarea
                    className={`${inputClassName()} min-h-16 resize-none md:col-span-2`}
                    value={form.coachNote}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        coachNote: event.target.value,
                      }))
                    }
                    placeholder="Coach note"
                  />
                </>
              ) : null}
            </div>
            {error ? (
              <p className="mt-4 text-sm font-bold text-destructive">{error}</p>
            ) : null}
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={closeModals}
                className="rounded-xl border border-border px-4 py-2.5 text-sm font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={save}
                className="rounded-xl bg-primary px-4 py-2.5 text-sm font-extrabold text-primary-foreground disabled:opacity-60"
              >
                {isPending ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {deleteOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 px-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            aria-label="Close delete modal"
            onClick={closeModals}
            className="absolute inset-0 cursor-default"
          />
          <div className="relative z-10 w-full max-w-md rounded-3xl border border-border bg-card p-5 shadow-xl">
            <p className="text-base font-extrabold text-foreground">
              Delete this entry?
            </p>
            <p className="mt-2 text-sm font-medium text-muted-foreground">
              {training.title} · {training.athleteName}
            </p>
            {error ? (
              <p className="mt-3 text-sm font-bold text-destructive">{error}</p>
            ) : null}
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={closeModals}
                className="rounded-xl border border-border px-4 py-2.5 text-sm font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={confirmDelete}
                className="rounded-xl bg-destructive px-4 py-2.5 text-sm font-extrabold text-destructive-foreground disabled:opacity-60"
              >
                {isPending ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
