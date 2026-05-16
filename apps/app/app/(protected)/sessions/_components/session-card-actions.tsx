"use client";

import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

import {
  deleteSession,
  updateSession,
  updateSessionAttendance,
  type SessionAttendanceInput,
  type UpdateSessionInput,
} from "../../../actions/workspace";
import {
  sessionFocusAreaSelectOptions,
  sessionPlannedIntensitySelectOptions,
} from "../../../../lib/coach-vocabulary";
import type {
  SessionStatus,
  SessionType,
} from "../../../../lib/database.types";
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
}: {
  session: SessionWithMeta;
  teams: AthleteTeamOption[];
  athletes: AthleteOption[];
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
      router.refresh();
    });
  }

  function updateAttendanceEntry(
    athleteId: string,
    update: Partial<SessionAttendanceInput>,
  ) {
    setAttendanceEntries((current) =>
      current.map((entry) =>
        entry.athleteId === athleteId ? { ...entry, ...update } : entry,
      ),
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => {
          setEditForm(buildSessionForm(session));
          setEditOpen(true);
        }}
        className="inline-flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs font-bold text-foreground transition-colors hover:border-primary"
      >
        <Icon icon="solar:pen-bold" className="size-3.5" />
        Edit
      </button>
      <button
        type="button"
        onClick={() => {
          setAttendanceEntries(buildAttendanceEntries(session, athletes));
          setAttendanceOpen(true);
        }}
        className="inline-flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs font-bold text-foreground transition-colors hover:border-primary"
      >
        <Icon icon="solar:checklist-minimalistic-bold" className="size-3.5" />
        Attendance
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
            aria-label="Close edit session modal"
            onClick={closeModals}
            className="absolute inset-0 cursor-default"
          />
          <div className="relative z-10 max-h-[90svh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-border bg-card p-5 shadow-xl md:p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary-700">
                  <Icon icon="solar:pen-bold" className="size-5" />
                </div>
                <div>
                  <p className="text-base font-extrabold text-foreground">
                    Edit session
                  </p>
                  <p className="mt-1 text-sm font-medium text-muted-foreground">
                    Update session details without changing attendance state.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeModals}
                className="inline-flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs font-bold text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
              >
                <Icon icon="solar:close-circle-bold" className="size-3.5" />
                Close
              </button>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <input
                className={`${inputClassName()} md:col-span-2`}
                value={editForm.title}
                onChange={(event) =>
                  setEditForm((current) => ({
                    ...current,
                    title: event.target.value,
                  }))
                }
                placeholder="Session title"
              />
              <select
                className={inputClassName()}
                value={editForm.teamId}
                onChange={(event) =>
                  setEditForm((current) => ({
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
              <select
                className={inputClassName()}
                value={editForm.status}
                onChange={(event) =>
                  setEditForm((current) => ({
                    ...current,
                    status: event.target.value as SessionStatus,
                  }))
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
                  setEditForm((current) => ({
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
                value={editForm.scheduledAt}
                onChange={(event) =>
                  setEditForm((current) => ({
                    ...current,
                    scheduledAt: event.target.value,
                  }))
                }
              />
              <input
                className={inputClassName()}
                value={editForm.location}
                onChange={(event) =>
                  setEditForm((current) => ({
                    ...current,
                    location: event.target.value,
                  }))
                }
                placeholder="Location"
              />
              <input
                className={inputClassName()}
                value={editForm.opponent}
                onChange={(event) =>
                  setEditForm((current) => ({
                    ...current,
                    opponent: event.target.value,
                  }))
                }
                placeholder="Opponent"
              />
              <input
                type="number"
                min="0"
                className={inputClassName()}
                value={editForm.plannedDurationMin}
                onChange={(event) =>
                  setEditForm((current) => ({
                    ...current,
                    plannedDurationMin: event.target.value,
                  }))
                }
                placeholder="Duration minutes"
              />
              <select
                className={inputClassName()}
                value={editForm.plannedIntensity}
                onChange={(event) =>
                  setEditForm((current) => ({
                    ...current,
                    plannedIntensity: event.target.value,
                  }))
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
                  setEditForm((current) => ({
                    ...current,
                    focusArea: event.target.value,
                  }))
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
                  setEditForm((current) => ({
                    ...current,
                    coachNotes: event.target.value,
                  }))
                }
                placeholder="Coach notes"
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
                onClick={closeModals}
                className="rounded-xl border border-border px-4 py-2.5 text-sm font-bold text-foreground transition-colors hover:border-primary"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={saveSession}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-extrabold text-primary-foreground transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Icon icon="solar:diskette-bold" className="size-4" />
                {isPending ? "Saving..." : "Save changes"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {attendanceOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 px-4 py-6 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            aria-label="Close attendance modal"
            onClick={closeModals}
            className="absolute inset-0 cursor-default"
          />
          <div className="relative z-10 max-h-[90svh] w-full max-w-4xl overflow-y-auto rounded-3xl border border-border bg-card p-5 shadow-xl md:p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary-700">
                  <Icon
                    icon="solar:checklist-minimalistic-bold"
                    className="size-5"
                  />
                </div>
                <div>
                  <p className="text-base font-extrabold text-foreground">
                    Attendance
                  </p>
                  <p className="mt-1 text-sm font-medium text-muted-foreground">
                    Mark session roster, attendance, RPE and coach notes.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeModals}
                className="inline-flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs font-bold text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
              >
                <Icon icon="solar:close-circle-bold" className="size-3.5" />
                Close
              </button>
            </div>

            <div className="mt-5 grid gap-3">
              {selectedTeamAthletes.length > 0 ? (
                selectedTeamAthletes.map((athlete) => {
                  const entry = attendanceEntries.find(
                    (currentEntry) => currentEntry.athleteId === athlete.id,
                  );

                  if (!entry) {
                    return null;
                  }

                  return (
                    <div
                      key={athlete.id}
                      className="rounded-2xl border border-border bg-background p-4"
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <label className="flex items-center gap-2 text-sm font-extrabold text-foreground">
                          <input
                            type="checkbox"
                            checked={entry.included}
                            onChange={(event) =>
                              updateAttendanceEntry(athlete.id, {
                                included: event.target.checked,
                              })
                            }
                          />
                          {athleteName(athlete)}
                        </label>
                        <label className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                          <input
                            type="checkbox"
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

                      <div className="mt-3 grid gap-3 md:grid-cols-5">
                        <input
                          type="number"
                          min="0"
                          disabled={!entry.included}
                          className={inputClassName()}
                          value={entry.minutesPlayed}
                          onChange={(event) =>
                            updateAttendanceEntry(athlete.id, {
                              minutesPlayed: event.target.value,
                            })
                          }
                          placeholder="Minutes"
                        />
                        <input
                          type="number"
                          min="1"
                          max="10"
                          disabled={!entry.included}
                          className={inputClassName()}
                          value={entry.rpe}
                          onChange={(event) =>
                            updateAttendanceEntry(athlete.id, {
                              rpe: event.target.value,
                            })
                          }
                          placeholder="RPE"
                        />
                        <input
                          disabled={!entry.included || entry.attended}
                          className={inputClassName()}
                          value={entry.absenceReason}
                          onChange={(event) =>
                            updateAttendanceEntry(athlete.id, {
                              absenceReason: event.target.value,
                            })
                          }
                          placeholder="Absence reason"
                        />
                        <label className="flex items-center gap-2 rounded-xl border border-input bg-card px-3.5 py-2.5 text-sm font-bold text-muted-foreground">
                          <input
                            type="checkbox"
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
                        <input
                          disabled={!entry.included || !entry.painReported}
                          className={inputClassName()}
                          value={entry.painArea}
                          onChange={(event) =>
                            updateAttendanceEntry(athlete.id, {
                              painArea: event.target.value,
                            })
                          }
                          placeholder="Pain area"
                        />
                      </div>
                      <textarea
                        disabled={!entry.included}
                        className={`${inputClassName()} mt-3 min-h-20 resize-none`}
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
                <div className="rounded-2xl border border-dashed border-border bg-background p-5 text-center text-sm font-medium text-muted-foreground">
                  No athletes in this team yet.
                </div>
              )}
            </div>

            {error ? (
              <div className="mt-5 rounded-2xl border border-destructive/30 bg-destructive-soft p-4 text-sm font-bold text-destructive-foreground">
                {error}
              </div>
            ) : null}

            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeModals}
                className="rounded-xl border border-border px-4 py-2.5 text-sm font-bold text-foreground transition-colors hover:border-primary"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={saveAttendance}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-extrabold text-primary-foreground transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Icon icon="solar:diskette-bold" className="size-4" />
                {isPending ? "Saving..." : "Save attendance"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {deleteOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 px-4 py-6 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            aria-label="Close delete session modal"
            onClick={closeModals}
            className="absolute inset-0 cursor-default"
          />
          <div className="relative z-10 w-full max-w-md rounded-3xl border border-border bg-card p-5 shadow-xl md:p-6">
            <div className="flex gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-destructive-soft text-destructive">
                <Icon icon="solar:trash-bin-trash-bold" className="size-5" />
              </div>
              <div>
                <p className="text-base font-extrabold text-foreground">
                  Delete session?
                </p>
                <p className="mt-1 text-sm font-medium text-muted-foreground">
                  This will also delete attendance rows for this session.
                </p>
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
                onClick={closeModals}
                className="rounded-xl border border-border px-4 py-2.5 text-sm font-bold text-foreground transition-colors hover:border-primary"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={confirmDelete}
                className="inline-flex items-center gap-2 rounded-xl bg-destructive px-4 py-2.5 text-sm font-extrabold text-destructive-foreground transition-colors hover:bg-destructive/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Icon icon="solar:trash-bin-trash-bold" className="size-4" />
                {isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
