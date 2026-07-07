"use client";

import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
  return "flex h-11 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";
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
      <Dialog open={isOpen} onOpenChange={(val) => {
        if (!val) closeModal();
        else setIsOpen(true);
      }}>
        <DialogTrigger asChild>
          <Button disabled={teams.length === 0} size="lg" className="gap-2 font-bold rounded-xl shadow-md">
            <Icon icon="solar:add-circle-bold" className="size-5" />
            Create session
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto p-6 gap-6">
          <DialogHeader className="flex flex-row items-center gap-4 space-y-0">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Icon icon="solar:clipboard-list-bold" className="size-6" />
            </div>
            <div>
              <DialogTitle className="text-xl font-extrabold text-foreground">
                Create session
              </DialogTitle>
              <DialogDescription className="mt-1 text-sm font-medium text-muted-foreground">
                Plan training, matches or recovery work and draft attendance.
              </DialogDescription>
            </div>
          </DialogHeader>

          <div className="grid gap-4 md:grid-cols-2 mt-2">
            <Input
              className="h-11 md:col-span-2"
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
            <Input
              type="datetime-local"
              className="h-11"
              value={form.scheduledAt}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  scheduledAt: event.target.value,
                }))
              }
            />
            <Input
              className="h-11"
              value={form.location}
              onChange={(event) =>
                setForm((current) => ({ ...current, location: event.target.value }))
              }
              placeholder="Location"
            />
            <Input
              className="h-11"
              value={form.opponent}
              onChange={(event) =>
                setForm((current) => ({ ...current, opponent: event.target.value }))
              }
              placeholder="Opponent (for match)"
            />
            <Input
              type="number"
              min="0"
              className="h-11"
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

          <div className="mt-2 rounded-2xl border bg-muted/30 p-5">
            <p className="text-sm font-extrabold text-foreground">
              Draft attendance
            </p>
            <p className="mt-1 text-xs font-medium text-muted-foreground">
              Select athletes to create attendance rows for this session.
            </p>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {teamAthletes.length > 0 ? (
                teamAthletes.map((athlete) => (
                  <label
                    key={athlete.id}
                    className="flex cursor-pointer items-center gap-3 rounded-xl border bg-card px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    <input
                      type="checkbox"
                      className="size-4 rounded border-primary text-primary focus:ring-primary"
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
            <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm font-bold text-destructive">
              {error}
            </div>
          ) : null}

          <DialogFooter className="mt-2 flex items-center justify-end gap-3 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={closeModal}
              className="font-bold h-11 px-6 rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={isPending}
              onClick={submit}
              className="gap-2 font-bold h-11 px-6 rounded-xl"
            >
              <Icon icon="solar:diskette-bold" className="size-5" />
              {isPending ? "Creating..." : "Save session"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
