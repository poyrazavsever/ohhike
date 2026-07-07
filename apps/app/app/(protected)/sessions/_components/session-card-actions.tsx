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
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  deleteSession,
  updateSession,
  updateSessionAttendance,
  type SessionAttendanceInput,
  type UpdateSessionInput,
} from "../../../actions/workspace";
import {
  absenceReasonSelectOptions,
  bodyPainAreaSelectOptions,
  sessionFocusAreaSelectOptions,
  sessionPlannedIntensitySelectOptions,
} from "../../../../lib/coach-vocabulary";
import type {
  SessionStatus,
  SessionType,
} from "../../../../lib/db.types";
import type {
  AthleteTeamOption,
  SessionWithMeta,
} from "../../../../lib/workspace";

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

const sessionStatuses: Array<{ label: string; value: SessionStatus }> = [
  { label: "Draft", value: "draft" },
  { label: "Planned", value: "planned" },
  { label: "In progress", value: "in_progress" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
];

function inputClassName() {
  return "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";
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

function athleteName(athlete: AthleteOption) {
  return [
    athlete.number ? `#${athlete.number}` : null,
    athlete.first_name,
    athlete.last_name,
  ]
    .filter(Boolean)
    .join(" ");
}

function buildSessionForm(session: SessionWithMeta): UpdateSessionInput {
  return {
    sessionId: session.id,
    teamId: session.team_id,
    title: session.title,
    type: session.type,
    status: session.status ?? "planned",
    scheduledAt: toDatetimeLocal(session.scheduled_at),
    location: session.location ?? "",
    opponent: session.opponent ?? "",
    plannedDurationMin: session.planned_duration_min?.toString() ?? "",
    plannedIntensity: session.planned_intensity?.toString() ?? "",
    focusArea: session.focus_area ?? "",
    coachNotes: session.coach_notes ?? "",
    athleteIds: session.attendance.map((entry) => entry.athlete_id),
  };
}

function buildAttendanceEntries(
  session: SessionWithMeta,
  athletes: AthleteOption[],
): SessionAttendanceInput[] {
  return athletes
    .filter((athlete) => athlete.team_id === session.team_id)
    .map((athlete) => {
      const attendance = session.attendance.find(
        (entry) => entry.athlete_id === athlete.id,
      );

      return {
        athleteId: athlete.id,
        included: Boolean(attendance),
        attended: attendance?.attended ?? false,
        absenceReason: attendance?.absence_reason ?? "",
        minutesPlayed: attendance?.minutes_played?.toString() ?? "",
        rpe: attendance?.rpe?.toString() ?? "",
        coachNote: attendance?.coach_note ?? "",
        painReported: attendance?.pain_reported ?? false,
        painArea: attendance?.pain_area ?? "",
      };
    });
}

export function SessionCardActions({
  session,
  teams,
  athletes,
  redirectAfterDelete,
}: {
  session: SessionWithMeta;
  teams: AthleteTeamOption[];
  athletes: AthleteOption[];
  redirectAfterDelete?: string;
}) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [attendanceOpen, setAttendanceOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<UpdateSessionInput>(
    buildSessionForm(session),
  );
  const [attendanceEntries, setAttendanceEntries] = useState<
    SessionAttendanceInput[]
  >(() => buildAttendanceEntries(session, athletes));
  const [isPending, startTransition] = useTransition();

  const selectedTeamAthletes = useMemo(
    () => athletes.filter((athlete) => athlete.team_id === session.team_id),
    [athletes, session.team_id],
  );

  const focusSelectOptions = useMemo(
    () => sessionFocusAreaSelectOptions(editForm.focusArea),
    [editForm.focusArea],
  );

  const intensitySelectOptions = useMemo(
    () => sessionPlannedIntensitySelectOptions(editForm.plannedIntensity),
    [editForm.plannedIntensity],
  );

  function closeModals() {
    setError(null);
    setEditOpen(false);
    setAttendanceOpen(false);
    setDeleteOpen(false);
  }

  function saveSession() {
    setError(null);

    startTransition(async () => {
      const result = await updateSession(editForm);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      closeModals();
      router.refresh();
    });
  }

  function saveAttendance() {
    setError(null);

    startTransition(async () => {
      const result = await updateSessionAttendance({
        sessionId: session.id,
        entries: attendanceEntries,
      });

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
      const result = await deleteSession(session.id);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      closeModals();

      if (redirectAfterDelete) {
        router.push(redirectAfterDelete);
        return;
      }

      router.refresh();
    });
  }

  function updateAttendanceEntry(
    athleteId: string,
    update: Partial<SessionAttendanceInput>,
  ) {
    setAttendanceEntries((current) =>
      current.map((entry) => {
        if (entry.athleteId !== athleteId) {
          return entry;
        }
        const next = { ...entry, ...update };
        if (update.attended === true) {
          next.absenceReason = "";
        }
        if (update.painReported === false) {
          next.painArea = "";
        }
        return next;
      }),
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          setEditForm(buildSessionForm(session));
          setEditOpen(true);
        }}
        className="gap-1.5 h-8 font-bold"
      >
        <Icon icon="solar:pen-bold" className="size-3.5" />
        Edit
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          setAttendanceEntries(buildAttendanceEntries(session, athletes));
          setAttendanceOpen(true);
        }}
        className="gap-1.5 h-8 font-bold"
      >
        <Icon icon="solar:checklist-minimalistic-bold" className="size-3.5" />
        Attendance
      </Button>
      <Button
        variant="destructive"
        size="sm"
        onClick={() => setDeleteOpen(true)}
        className="gap-1.5 h-8 font-bold"
      >
        <Icon icon="solar:trash-bin-trash-bold" className="size-3.5" />
        Delete
      </Button>

      <Dialog open={editOpen} onOpenChange={(val) => { if (!val) closeModals(); }}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto p-6 gap-6">
          <DialogHeader className="flex flex-row items-center gap-4 space-y-0">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Icon icon="solar:pen-bold" className="size-6" />
            </div>
            <div>
              <DialogTitle className="text-xl font-extrabold text-foreground">
                Edit session
              </DialogTitle>
              <DialogDescription className="mt-1 text-sm font-medium text-muted-foreground">
                Update session details without changing attendance state.
              </DialogDescription>
            </div>
          </DialogHeader>

          <div className="grid gap-4 md:grid-cols-2 mt-2">
            <Input
              className="md:col-span-2 h-11"
              value={editForm.title}
              onChange={(event) =>
                setEditForm((current) => ({ ...current, title: event.target.value }))
              }
              placeholder="Session title"
            />
            <select
              className={inputClassName()}
              value={editForm.teamId}
              onChange={(event) =>
                setEditForm((current) => ({ ...current, teamId: event.target.value }))
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
              value={editForm.status}
              onChange={(event) =>
                setEditForm((current) => ({ ...current, status: event.target.value as SessionStatus }))
              }
            >
              {sessionStatuses.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
            <select
              className={inputClassName()}
              value={editForm.type}
              onChange={(event) =>
                setEditForm((current) => ({ ...current, type: event.target.value as SessionType }))
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
              value={editForm.scheduledAt}
              onChange={(event) =>
                setEditForm((current) => ({ ...current, scheduledAt: event.target.value }))
              }
            />
            <Input
              className="h-11"
              value={editForm.location}
              onChange={(event) =>
                setEditForm((current) => ({ ...current, location: event.target.value }))
              }
              placeholder="Location"
            />
            <Input
              className="h-11"
              value={editForm.opponent}
              onChange={(event) =>
                setEditForm((current) => ({ ...current, opponent: event.target.value }))
              }
              placeholder="Opponent"
            />
            <Input
              type="number"
              min="0"
              className="h-11"
              value={editForm.plannedDurationMin}
              onChange={(event) =>
                setEditForm((current) => ({ ...current, plannedDurationMin: event.target.value }))
              }
              placeholder="Duration minutes"
            />
            <select
              className={inputClassName()}
              value={editForm.plannedIntensity}
              onChange={(event) =>
                setEditForm((current) => ({ ...current, plannedIntensity: event.target.value }))
              }
            >
              {intensitySelectOptions.map((opt) => (
                <option key={opt.value || "intensity-none"} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <select
              className={inputClassName()}
              value={editForm.focusArea}
              onChange={(event) =>
                setEditForm((current) => ({ ...current, focusArea: event.target.value }))
              }
            >
              {focusSelectOptions.map((opt) => (
                <option key={opt.value || "focus-none"} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <textarea
              className={`${inputClassName()} min-h-24 resize-none md:col-span-2`}
              value={editForm.coachNotes}
              onChange={(event) =>
                setEditForm((current) => ({ ...current, coachNotes: event.target.value }))
              }
              placeholder="Coach notes"
            />
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
              onClick={closeModals}
              className="font-bold h-11 px-6 rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={isPending}
              onClick={saveSession}
              className="gap-2 font-bold h-11 px-6 rounded-xl"
            >
              <Icon icon="solar:diskette-bold" className="size-5" />
              {isPending ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={attendanceOpen} onOpenChange={(val) => { if (!val) closeModals(); }}>
        <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-y-auto p-6 gap-6">
          <DialogHeader className="flex flex-row items-center gap-4 space-y-0">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Icon icon="solar:checklist-minimalistic-bold" className="size-6" />
            </div>
            <div>
              <DialogTitle className="text-xl font-extrabold text-foreground">
                Attendance
              </DialogTitle>
              <DialogDescription className="mt-1 text-sm font-medium text-muted-foreground">
                Mark session roster, attendance, RPE and coach notes.
              </DialogDescription>
            </div>
          </DialogHeader>

          <div className="mt-2 grid gap-4">
            {selectedTeamAthletes.length > 0 ? (
              selectedTeamAthletes.map((athlete) => {
                const entry = attendanceEntries.find(
                  (currentEntry) => currentEntry.athleteId === athlete.id,
                );

                if (!entry) return null;

                return (
                  <div
                    key={athlete.id}
                    className="rounded-2xl border bg-card p-4 shadow-sm"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <label className="flex items-center gap-3 text-sm font-extrabold text-foreground cursor-pointer">
                        <input
                          type="checkbox"
                          className="size-4 rounded border-primary text-primary focus:ring-primary"
                          checked={entry.included}
                          onChange={(event) =>
                            updateAttendanceEntry(athlete.id, {
                              included: event.target.checked,
                            })
                          }
                        />
                        {athleteName(athlete)}
                      </label>
                      <label className="flex items-center gap-3 text-xs font-bold text-muted-foreground cursor-pointer">
                        <input
                          type="checkbox"
                          className="size-4 rounded border-primary text-primary focus:ring-primary disabled:opacity-50"
                          checked={entry.attended}
                          disabled={!entry.included}
                          onChange={(event) =>
                            updateAttendanceEntry(athlete.id, {
                              attended: event.target.checked,
                            })
                          }
                        />
                        Attended
                      </label>
                    </div>

                    <div className="mt-4 grid gap-3 md:grid-cols-5">
                      <Input
                        type="number"
                        min="0"
                        disabled={!entry.included}
                        value={entry.minutesPlayed}
                        onChange={(event) =>
                          updateAttendanceEntry(athlete.id, {
                            minutesPlayed: event.target.value,
                          })
                        }
                        placeholder="Minutes"
                      />
                      <select
                        disabled={!entry.included}
                        className={inputClassName()}
                        value={entry.rpe}
                        onChange={(event) =>
                          updateAttendanceEntry(athlete.id, {
                            rpe: event.target.value,
                          })
                        }
                      >
                        {sessionPlannedIntensitySelectOptions(entry.rpe).map(
                          (opt) => (
                            <option
                              key={`rpe-${athlete.id}-${opt.value || "none"}`}
                              value={opt.value}
                            >
                              {opt.label}
                            </option>
                          ),
                        )}
                      </select>
                      <select
                        disabled={!entry.included || entry.attended}
                        className={inputClassName()}
                        value={entry.absenceReason}
                        onChange={(event) =>
                          updateAttendanceEntry(athlete.id, {
                            absenceReason: event.target.value,
                          })
                        }
                      >
                        {absenceReasonSelectOptions(entry.absenceReason).map(
                          (opt) => (
                            <option
                              key={`absence-${athlete.id}-${opt.value || "none"}`}
                              value={opt.value}
                            >
                              {opt.label}
                            </option>
                          ),
                        )}
                      </select>
                      <label className="flex items-center gap-2 rounded-md border border-input bg-card px-3 py-2 text-sm font-bold text-muted-foreground cursor-pointer">
                        <input
                          type="checkbox"
                          className="size-4 rounded border-primary text-primary focus:ring-primary disabled:opacity-50"
                          disabled={!entry.included}
                          checked={entry.painReported}
                          onChange={(event) =>
                            updateAttendanceEntry(athlete.id, {
                              painReported: event.target.checked,
                            })
                          }
                        />
                        Pain
                      </label>
                      <select
                        disabled={!entry.included || !entry.painReported}
                        className={inputClassName()}
                        value={entry.painArea}
                        onChange={(event) =>
                          updateAttendanceEntry(athlete.id, {
                            painArea: event.target.value,
                          })
                        }
                      >
                        {bodyPainAreaSelectOptions(entry.painArea).map(
                          (opt) => (
                            <option
                              key={`pain-${athlete.id}-${opt.value || "none"}`}
                              value={opt.value}
                            >
                              {opt.label}
                            </option>
                          ),
                        )}
                      </select>
                    </div>
                    <textarea
                      disabled={!entry.included}
                      className={`${inputClassName()} mt-3 min-h-16 resize-none`}
                      value={entry.coachNote}
                      onChange={(event) =>
                        updateAttendanceEntry(athlete.id, {
                          coachNote: event.target.value,
                        })
                      }
                      placeholder="Coach note"
                    />
                  </div>
                );
              })
            ) : (
              <div className="rounded-2xl border border-dashed border-border bg-background p-6 text-center text-sm font-medium text-muted-foreground">
                No athletes in this team yet.
              </div>
            )}
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
              onClick={closeModals}
              className="font-bold h-11 px-6 rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={isPending}
              onClick={saveAttendance}
              className="gap-2 font-bold h-11 px-6 rounded-xl"
            >
              <Icon icon="solar:diskette-bold" className="size-5" />
              {isPending ? "Saving..." : "Save attendance"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={(val) => { if (!val) closeModals(); }}>
        <DialogContent className="sm:max-w-md p-6 gap-6">
          <div className="flex gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
              <Icon icon="solar:trash-bin-trash-bold" className="size-6" />
            </div>
            <div className="pt-1">
              <DialogTitle className="text-xl font-extrabold text-foreground">
                Delete session?
              </DialogTitle>
              <DialogDescription className="mt-1 text-sm font-medium text-muted-foreground">
                This will also delete attendance rows for this session.
              </DialogDescription>
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
              onClick={closeModals}
              className="font-bold h-11 px-6 rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={isPending}
              onClick={confirmDelete}
              className="gap-2 font-bold h-11 px-6 rounded-xl"
            >
              <Icon icon="solar:trash-bin-trash-bold" className="size-5" />
              {isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
