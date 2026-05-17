"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
  rejectCoachNetworkApplication,
  requestCoachNetworkApplicationInfo,
} from "../../../../../actions/coach-network";

function fieldClassName() {
  return "mt-2 w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm font-medium text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-primary/15";
}

export function ApplicationDetailActions({
  applicationId,
  status,
}: {
  applicationId: string;
  status: string;
}) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const isClosed = status === "declined" || status === "accepted";

  function runAction(action: "reject" | "request_info") {
    setFeedback(null);
    setError(null);

    startTransition(async () => {
      const result =
        action === "reject"
          ? await rejectCoachNetworkApplication(applicationId, message)
          : await requestCoachNetworkApplicationInfo(applicationId, message);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setFeedback(
        action === "reject"
          ? "Application declined."
          : "Information request sent to athlete.",
      );
      setMessage("");
      router.refresh();
    });
  }

  if (isClosed) {
    return null;
  }

  return (
    <div className="mt-4 rounded-2xl border border-border bg-card p-5">
      <h2 className="text-sm font-extrabold uppercase tracking-wide text-muted-foreground">
        Coach actions
      </h2>
      <label className="mt-4 block text-xs font-bold uppercase tracking-wide text-muted-foreground">
        Message to athlete
      </label>
      <textarea
        className={`${fieldClassName()} min-h-24`}
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        placeholder="Explain your decision or what you need from the athlete."
      />
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={isPending}
          onClick={() => runAction("request_info")}
          className="rounded-xl border border-border px-4 py-2.5 text-xs font-extrabold transition-colors hover:border-primary/40 hover:bg-primary-soft disabled:opacity-60"
        >
          Request info
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={() => runAction("reject")}
          className="rounded-xl bg-destructive px-4 py-2.5 text-xs font-extrabold text-destructive-foreground disabled:opacity-60"
        >
          Decline
        </button>
      </div>
      {feedback ? (
        <p className="mt-3 rounded-xl border border-success/30 bg-success-soft px-3 py-2 text-sm font-bold text-success-foreground">
          {feedback}
        </p>
      ) : null}
      {error ? (
        <p className="mt-3 rounded-xl border border-destructive/30 bg-destructive-soft px-3 py-2 text-sm font-bold text-destructive-foreground">
          {error}
        </p>
      ) : null}
    </div>
  );
}
