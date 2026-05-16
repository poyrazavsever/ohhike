"use client";

import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { deleteAiReport } from "../../../actions/workspace";

export function AiReportDetailActions({ reportId }: { reportId: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function remove() {
    if (!window.confirm("Delete this AI report? This cannot be undone.")) {
      return;
    }

    setError(null);

    startTransition(async () => {
      const result = await deleteAiReport(reportId);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      router.push(result.redirectTo ?? "/ai-reports");
      router.refresh();
    });
  }

  return (
    <div>
      <button
        type="button"
        disabled={isPending}
        onClick={remove}
        className="inline-flex items-center gap-1.5 rounded-xl border border-destructive/30 px-3 py-2 text-xs font-bold text-destructive transition-colors hover:bg-destructive-soft disabled:opacity-60"
      >
        <Icon icon="solar:trash-bin-trash-bold" className="size-3.5" />
        {isPending ? "Deleting…" : "Delete report"}
      </button>
      {error ? (
        <p className="mt-2 text-xs font-bold text-destructive">{error}</p>
      ) : null}
    </div>
  );
}
