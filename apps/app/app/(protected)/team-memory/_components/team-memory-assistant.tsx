"use client";

import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

import {
  sendTeamMemoryMessage,
  type SendTeamMemoryMessageInput,
} from "../../../actions/workspace";
import type { AthleteTeamOption } from "../../../../lib/workspace";

const SUGGESTED_QUESTIONS = [
  "What problems have we logged most often this month?",
  "Which athletes had the highest fatigue signals recently?",
  "What team patterns are still active?",
  "Summarize the latest AI session reports for this team.",
];

type AthleteOption = {
  id: string;
  team_id: string;
  first_name: string;
  last_name: string | null;
  number: number | null;
};

type ThreadRow = {
  id: string;
  title: string | null;
  team_id: string | null;
  athlete_id: string | null;
  created_at: string | null;
};

type MessageRow = {
  id: string;
  role: string;
  content: string;
  metadata: Record<string, unknown> | null;
  created_at: string | null;
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

function formatTime(iso: string | null) {
  if (!iso) {
    return "";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(iso));
}

export function TeamMemoryAssistant({
  threads,
  messages,
  teams,
  athletes,
  initialThreadId,
  geminiConfigured,
}: {
  threads: ThreadRow[];
  messages: MessageRow[];
  teams: AthleteTeamOption[];
  athletes: AthleteOption[];
  initialThreadId: string | null;
  geminiConfigured: boolean;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [threadId, setThreadId] = useState(initialThreadId ?? "");
  const [message, setMessage] = useState("");
  const [filters, setFilters] = useState<{
    teamId: string;
    athleteId: string;
  }>({
    teamId: "",
    athleteId: "",
  });

  const filteredAthletes = useMemo(() => {
    if (!filters.teamId) {
      return athletes;
    }

    return athletes.filter((athlete) => athlete.team_id === filters.teamId);
  }, [athletes, filters.teamId]);

  function submit(questionText?: string) {
    const text = (questionText ?? message).trim();

    if (!text) {
      return;
    }

    setError(null);

    const payload: SendTeamMemoryMessageInput = {
      threadId: threadId || undefined,
      message: text,
      teamId: filters.teamId || undefined,
      athleteId: filters.athleteId || undefined,
    };

    startTransition(async () => {
      const result = await sendTeamMemoryMessage(payload);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setMessage("");

      if (result.threadId) {
        setThreadId(result.threadId);
        router.push(`/team-memory?thread=${result.threadId}`);
        return;
      }

      router.refresh();
    });
  }

  function selectThread(id: string) {
    setThreadId(id);
    setError(null);
    router.push(`/team-memory?thread=${id}`);
  }

  function startNewThread() {
    setThreadId("");
    setMessage("");
    setError(null);
    router.push("/team-memory");
  }

  return (
    <div className="rounded-3xl border border-border bg-card p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary-700">
            <Icon icon="solar:chat-round-dots-bold" className="size-5" />
          </div>
          <div>
            <p className="text-base font-extrabold text-foreground">
              Team Memory Assistant
            </p>
            <p className="mt-1 max-w-2xl text-sm font-medium text-muted-foreground">
              Ask Doctor Panda about observations, patterns, AI reports, sessions
              and check-ins. Answers cite retrieved team memory only.
            </p>
            <p className="mt-2 text-xs font-semibold text-muted-foreground">
              {geminiConfigured
                ? "Gemini enabled — hybrid keyword + vector retrieval."
                : "Rule-based answers — set GEMINI_API_KEY for richer LLM replies and vector search."}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={startNewThread}
          className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-border px-3 py-2 text-xs font-bold text-foreground transition-colors hover:border-primary"
        >
          <Icon icon="solar:add-circle-bold" className="size-4" />
          New thread
        </button>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <select
          className={inputClassName()}
          value={filters.teamId}
          onChange={(event) =>
            setFilters({ teamId: event.target.value, athleteId: "" })
          }
        >
          <option value="">All teams</option>
          {teams.map((team) => (
            <option key={team.id} value={team.id}>
              {team.name}
            </option>
          ))}
        </select>
        <select
          className={inputClassName()}
          value={filters.athleteId}
          onChange={(event) =>
            setFilters((current) => ({
              ...current,
              athleteId: event.target.value,
            }))
          }
        >
          <option value="">All athletes</option>
          {filteredAthletes.map((athlete) => (
            <option key={athlete.id} value={athlete.id}>
              {athleteName(athlete)}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {SUGGESTED_QUESTIONS.map((question) => (
          <button
            key={question}
            type="button"
            disabled={isPending}
            onClick={() => submit(question)}
            className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-bold text-foreground transition-colors hover:border-primary hover:bg-primary-soft disabled:opacity-60"
          >
            {question}
          </button>
        ))}
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="rounded-2xl border border-border bg-background p-3">
          <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
            Past threads
          </p>
          <ul className="mt-3 max-h-64 space-y-1 overflow-y-auto">
            {threads.length === 0 ? (
              <li className="text-xs font-medium text-muted-foreground">
                No conversations yet.
              </li>
            ) : (
              threads.map((thread) => (
                <li key={thread.id}>
                  <button
                    type="button"
                    onClick={() => selectThread(thread.id)}
                    className={`w-full rounded-xl px-3 py-2 text-left text-xs font-bold transition-colors ${
                      threadId === thread.id
                        ? "bg-primary-soft text-primary-700"
                        : "text-foreground hover:bg-muted"
                    }`}
                  >
                    {thread.title ?? "Untitled thread"}
                  </button>
                </li>
              ))
            )}
          </ul>
        </aside>

        <div className="flex min-h-[320px] flex-col rounded-2xl border border-border bg-background">
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.length === 0 ? (
              <p className="text-sm font-medium text-muted-foreground">
                Ask a question to search your team&apos;s coaching memory.
              </p>
            ) : (
              messages.map((entry) => {
                const isUser = entry.role === "user";
                const sources =
                  entry.metadata &&
                  Array.isArray(entry.metadata.sources)
                    ? (entry.metadata.sources as Array<{
                        title?: string;
                        type?: string;
                      }>)
                    : [];

                return (
                  <div
                    key={entry.id}
                    className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[92%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                        isUser
                          ? "bg-primary text-primary-foreground"
                          : "border border-border bg-card text-foreground"
                      }`}
                    >
                      <p className="whitespace-pre-wrap font-medium">
                        {entry.content}
                      </p>
                      {!isUser && sources.length > 0 ? (
                        <div className="mt-3 border-t border-border/60 pt-2">
                          <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
                            Sources
                          </p>
                          <ul className="mt-1 space-y-1">
                            {sources.slice(0, 4).map((source, index) => (
                              <li
                                key={`${entry.id}-source-${index}`}
                                className="text-xs font-semibold text-muted-foreground"
                              >
                                {source.title ?? "Memory item"}
                                {source.type ? ` · ${source.type}` : ""}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                      <p
                        className={`mt-2 text-[10px] font-semibold ${
                          isUser
                            ? "text-primary-foreground/80"
                            : "text-muted-foreground"
                        }`}
                      >
                        {formatTime(entry.created_at)}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="border-t border-border p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
              <textarea
                className={`${inputClassName()} min-h-[72px] resize-none`}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="e.g. Which athletes showed high fatigue this week?"
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    submit();
                  }
                }}
              />
              <button
                type="button"
                disabled={isPending || !message.trim()}
                onClick={() => submit()}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-extrabold text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-60"
              >
                <Icon icon="solar:plain-2-bold" className="size-4" />
                {isPending ? "Thinking…" : "Ask"}
              </button>
            </div>
            {error ? (
              <p className="mt-3 text-sm font-bold text-destructive">{error}</p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
