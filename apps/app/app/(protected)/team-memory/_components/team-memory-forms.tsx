"use client";

import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

import {
  createAthleteObservation,
  createTeamPattern,
  type CreateAthleteObservationInput,
  type CreateTeamPatternInput,
} from "../../../actions/workspace";
import type { AthleteTeamOption } from "../../../../lib/workspace";

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

function emptyObservation(teamId: string, athleteId: string): CreateAthleteObservationInput {
  return {
    teamId,
    athleteId,
    title: "",
    category: "",
    severity: "",
    observation: "",
    recommendation: "",
  };
}

function emptyPattern(teamId: string): CreateTeamPatternInput {
  return {
    teamId,
    patternType: "",
    title: "",
    description: "",
    severity: "",
  };
}

export function TeamMemoryForms({
  teams,
  athletes,
}: {
  teams: AthleteTeamOption[];
  athletes: AthleteOption[];
}) {
  const router = useRouter();
  const [mode, setMode] = useState<"observation" | "pattern" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [observationForm, setObservationForm] =
    useState<CreateAthleteObservationInput>(
      emptyObservation(teams[0]?.id ?? "", athletes[0]?.id ?? ""),
    );
  const [patternForm, setPatternForm] = useState<CreateTeamPatternInput>(
    emptyPattern(teams[0]?.id ?? ""),
  );

  const teamAthletes = useMemo(
    () =>
      athletes.filter((athlete) => athlete.team_id === observationForm.teamId),
    [athletes, observationForm.teamId],
  );

  function closeModal() {
    setError(null);
    setMode(null);
  }

  function submitObservation() {
    setError(null);
    startTransition(async () => {
      const result = await createAthleteObservation(observationForm);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      closeModal();
      router.refresh();
    });
  }

  function submitPattern() {
    setError(null);
    startTransition(async () => {
      const result = await createTeamPattern(patternForm);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      closeModal();
      router.refresh();
    });
  }

  return (
    <div className="mt-6 flex flex-wrap justify-end gap-3">
      <button
        type="button"
        disabled={teams.length === 0 || athletes.length === 0}
        onClick={() => {
          setObservationForm(emptyObservation(teams[0]?.id ?? "", athletes[0]?.id ?? ""));
          setMode("observation");
        }}
        className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-extrabold text-primary-foreground transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Icon icon="solar:user-speak-bold" className="size-4" />
        Add observation
      </button>
      <button
        type="button"
        disabled={teams.length === 0}
        onClick={() => {
          setPatternForm(emptyPattern(teams[0]?.id ?? ""));
          setMode("pattern");
        }}
        className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-bold text-foreground transition-colors hover:border-primary disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Icon icon="solar:stars-bold" className="size-4" />
        Add pattern
      </button>

      {mode ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 px-4 py-6 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            aria-label="Close team memory modal"
            onClick={closeModal}
            className="absolute inset-0 cursor-default"
          />
          <div className="relative z-10 max-h-[90svh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-border bg-card p-5 shadow-xl md:p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary-700">
                  <Icon
                    icon={mode === "observation" ? "solar:user-speak-bold" : "solar:stars-bold"}
                    className="size-5"
                  />
                </div>
                <div>
                  <p className="text-base font-extrabold text-foreground">
                    {mode === "observation" ? "Add athlete observation" : "Add team pattern"}
                  </p>
                  <p className="mt-1 text-sm font-medium text-muted-foreground">
                    Capture durable coaching context for future analysis.
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

            {mode === "observation" ? (
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <select
                  className={inputClassName()}
                  value={observationForm.teamId}
                  onChange={(event) =>
                    setObservationForm((current) => {
                      const nextTeamId = event.target.value;
                      const nextAthlete = athletes.find(
                        (athlete) => athlete.team_id === nextTeamId,
                      );
                      return {
                        ...current,
                        teamId: nextTeamId,
                        athleteId: nextAthlete?.id ?? "",
                      };
                    })
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
                  value={observationForm.athleteId}
                  onChange={(event) =>
                    setObservationForm((current) => ({
                      ...current,
                      athleteId: event.target.value,
                    }))
                  }
                >
                  {teamAthletes.map((athlete) => (
                    <option key={athlete.id} value={athlete.id}>
                      {athleteName(athlete)}
                    </option>
                  ))}
                </select>
                <input
                  className={inputClassName()}
                  value={observationForm.title}
                  onChange={(event) =>
                    setObservationForm((current) => ({
                      ...current,
                      title: event.target.value,
                    }))
                  }
                  placeholder="Title"
                />
                <input
                  className={inputClassName()}
                  value={observationForm.category}
                  onChange={(event) =>
                    setObservationForm((current) => ({
                      ...current,
                      category: event.target.value,
                    }))
                  }
                  placeholder="Category"
                />
                <input
                  className={inputClassName()}
                  value={observationForm.severity}
                  onChange={(event) =>
                    setObservationForm((current) => ({
                      ...current,
                      severity: event.target.value,
                    }))
                  }
                  placeholder="Severity"
                />
                <textarea
                  className={`${inputClassName()} min-h-24 resize-none md:col-span-2`}
                  value={observationForm.observation}
                  onChange={(event) =>
                    setObservationForm((current) => ({
                      ...current,
                      observation: event.target.value,
                    }))
                  }
                  placeholder="Observation"
                />
                <textarea
                  className={`${inputClassName()} min-h-24 resize-none md:col-span-2`}
                  value={observationForm.recommendation}
                  onChange={(event) =>
                    setObservationForm((current) => ({
                      ...current,
                      recommendation: event.target.value,
                    }))
                  }
                  placeholder="Recommendation"
                />
              </div>
            ) : (
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <select
                  className={inputClassName()}
                  value={patternForm.teamId}
                  onChange={(event) =>
                    setPatternForm((current) => ({
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
                  value={patternForm.patternType}
                  onChange={(event) =>
                    setPatternForm((current) => ({
                      ...current,
                      patternType: event.target.value,
                    }))
                  }
                  placeholder="Pattern type"
                />
                <input
                  className={inputClassName()}
                  value={patternForm.title}
                  onChange={(event) =>
                    setPatternForm((current) => ({
                      ...current,
                      title: event.target.value,
                    }))
                  }
                  placeholder="Title"
                />
                <input
                  className={inputClassName()}
                  value={patternForm.severity}
                  onChange={(event) =>
                    setPatternForm((current) => ({
                      ...current,
                      severity: event.target.value,
                    }))
                  }
                  placeholder="Severity"
                />
                <textarea
                  className={`${inputClassName()} min-h-28 resize-none md:col-span-2`}
                  value={patternForm.description}
                  onChange={(event) =>
                    setPatternForm((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  placeholder="Description"
                />
              </div>
            )}

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
                onClick={mode === "observation" ? submitObservation : submitPattern}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-extrabold text-primary-foreground transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Icon icon="solar:diskette-bold" className="size-4" />
                {isPending ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
