"use client";

import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { syncStravaConnection } from "../../../actions/workspace";

export function StravaSyncButton({ connectionId }: { connectionId: string }) {
  const router = useRouter();
  const [notice, setNotice] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function sync() {
    setNotice(null);

    startTransition(async () => {
      const result = await syncStravaConnection(connectionId);
      setNotice(result.ok ? result.message ?? "Sync complete." : result.error);

      if (result.ok) {
        router.refresh();
      }
    });
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        type="button"
        onClick={sync}
        disabled={isPending}
        className="inline-flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs font-bold text-foreground transition-colors hover:border-primary disabled:opacity-60"
      >
        <Icon icon="solar:refresh-bold" className="size-3.5" />
        {isPending ? "Syncing..." : "Sync Strava"}
      </button>
      {notice ? (
        <p className="text-xs font-semibold text-muted-foreground">{notice}</p>
      ) : null}
    </div>
  );
}
