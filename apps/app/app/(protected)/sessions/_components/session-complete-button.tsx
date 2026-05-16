"use client";

import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { completeSession } from "../../../actions/workspace";
import type { SessionStatus } from "../../../../lib/database.types";

export function SessionCompleteButton({
  sessionId,
  status,
}: {
  sessionId: string;
  status: SessionStatus | null;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (status === "completed" || status === "cancelled") {
    return null;
  }

  function handleComplete() {
    setError(null);

    startTransition(async () => {
      const result = await completeSession(sessionId);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      router.refresh();
    });
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        type="button"
        disabled={isPending}
        onClick={handleComplete}
        className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-extrabold text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-60"
      >
        <Icon icon="solar:check-circle-bold" className="size-3.5" />
        {isPending ? "Completing…" : "Mark session complete"}
      </button>
      {error ? (
        <p className="text-xs font-bold text-destructive">{error}</p>
      ) : null}
    </div>
  );
}
