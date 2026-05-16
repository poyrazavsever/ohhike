"use client";

import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
  createAiReport,
  type CreateAiReportInput,
} from "../../../actions/workspace";
import type { AiReportType } from "../../../../lib/database.types";
import type { AthleteTeamOption } from "../../../../lib/workspace";

type AthleteOption = {
  id: string;
  team_id: string;
  first_name: string;
  last_name: string | null;
  number: number | null;
};

type SessionOption = {
  id: string;
  team_id: string;
  title: string;
};

const reportTypes: Array<{ label: string; value: AiReportType }> = [
  { label: "Session analysis", value: "session_analysis" },
  { label: "Match analysis", value: "match_analysis" },
  { label: "Training analysis", value: "training_analysis" },
  { label: "Player development", value: "player_development" },
  { label: "Weekly team report", value: "weekly_team_report" },
  { label: "Load report", value: "load_report" },
  { label: "Readiness report", value: "readiness_report" },
  { label: "Nutrition report", value: "nutrition_report" },
  { label: "Scout report", value: "scout_report" },
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

function emptyForm(): CreateAiReportInput {
  return {
    title: "",
    reportType: "session_analysis",
    teamId: "",
    athleteId: "",
    sessionId: "",
    summary: "",
  };
}

export function CreateAiReportForm({
  teams,
  athletes,
  sessions,
}: {
  teams: AthleteTeamOption[];
  athletes: AthleteOption[];
  sessions: SessionOption[];
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<CreateAiReportInput>(() => emptyForm());
  const [isPending, startTransition] = useTransition();

  function closeModal() {
    setError(null);
    setIsOpen(false);
  }

  function submit() {
    setError(null);

    startTransition(async () => {
      const result = await createAiReport(form);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setForm(emptyForm());
      closeModal();
      router.refresh();
    });
  }

  return (
    <div className="mt-6 flex justify-end">
      <button
        type="button"
        onClick={() => {
          setForm(emptyForm());
          setIsOpen(true);
        }}
        className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-extrabold text-primary-foreground transition-colors hover:bg-primary-hover"
      >
        <Icon icon="solar:document-add-bold" className="size-4" />
        Add report
      </button>

      {isOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 px-4 py-6 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            aria-label="Close create AI report modal"
            onClick={closeModal}
            className="absolute inset-0 cursor-default"
          />

          <div className="relative z-10 max-h-[90svh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-border bg-card p-5 shadow-xl md:p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary-700">
                  <Icon icon="solar:document-add-bold" className="size-5" />
                </div>
                <div>
                  <p className="text-base font-extrabold text-foreground">
                    Add AI report draft
                  </p>
                  <p className="mt-1 text-sm font-medium text-muted-foreground">
                    Register a report placeholder before generation is automated.
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
                  setForm((current) => ({
                    ...current,
                    title: event.target.value,
                  }))
                }
                placeholder="Report title"
              />
              <select
                className={inputClassName()}
                value={form.reportType}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    reportType: event.target.value as AiReportType,
                  }))
                }
              >
                {reportTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              <select
                className={inputClassName()}
                value={form.teamId}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    teamId: event.target.value,
                  }))
                }
              >
                <option value="">No team</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
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
                <option value="">No athlete</option>
                {athletes.map((athlete) => (
                  <option key={athlete.id} value={athlete.id}>
                    {athleteName(athlete)}
                  </option>
                ))}
              </select>
              <select
                className={inputClassName()}
                value={form.sessionId}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    sessionId: event.target.value,
                  }))
                }
              >
                <option value="">No session</option>
                {sessions.map((session) => (
                  <option key={session.id} value={session.id}>
                    {session.title}
                  </option>
                ))}
              </select>
              <textarea
                className={`${inputClassName()} min-h-28 resize-none md:col-span-2`}
                value={form.summary}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    summary: event.target.value,
                  }))
                }
                placeholder="Draft summary"
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
                {isPending ? "Saving..." : "Save report"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
