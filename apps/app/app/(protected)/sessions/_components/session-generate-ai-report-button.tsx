"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { generateSessionAiReport } from "../../../actions/workspace";

export function SessionGenerateAiReportButton({
  sessionId,
  existingReportId,
}: {
  sessionId: string;
  existingReportId?: string | null;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function generate() {
    setError(null);

    startTransition(async () => {
      const result = await generateSessionAiReport(sessionId);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      router.refresh();
    });
  }

  return (
    <div className="rounded-3xl border border-border bg-card p-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-extrabold text-foreground">
            AI session analysis
          </p>
          <p className="mt-1 text-xs font-medium text-muted-foreground">
            Doctor Panda summarizes attendance, load, readiness signals and coach
            notes from this session.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {existingReportId ? (
            <Link
              href="/ai-reports"
              className="inline-flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs font-bold text-foreground transition-colors hover:border-primary"
            >
              <Icon icon="solar:document-text-bold" className="size-3.5" />
              View in AI Reports
            </Link>
          ) : null}
          <button
            type="button"
            disabled={isPending}
            onClick={generate}
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-extrabold text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-60"
          >
            <Icon icon="solar:magic-stick-3-bold" className="size-3.5" />
            {isPending
              ? "Generating…"
              : existingReportId
                ? "Regenerate analysis"
                : "Generate AI analysis"}
          </button>
        </div>
      </div>
      {error ? (
        <p className="mt-3 text-xs font-bold text-destructive">{error}</p>
      ) : null}
    </div>
  );
}
