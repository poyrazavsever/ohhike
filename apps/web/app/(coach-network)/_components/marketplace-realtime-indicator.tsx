import type { MarketplaceRealtimeStatus } from "../../../hooks/use-marketplace-conversation-realtime";

const labels: Record<MarketplaceRealtimeStatus, string> = {
  idle: "Connecting…",
  connecting: "Connecting…",
  subscribed: "Live",
  error: "Realtime off",
  unavailable: "Sign in for live updates",
};

export function MarketplaceRealtimeIndicator({
  status,
  statusDetail,
}: {
  status: MarketplaceRealtimeStatus;
  statusDetail: string | null;
}) {
  const label = labels[status];
  const isLive = status === "subscribed";
  const isWarning = status === "error" || status === "unavailable";

  return (
    <div
      className="mb-3 flex flex-wrap items-center gap-2"
      title={statusDetail ?? undefined}
    >
      <span
        className={
          isLive
            ? "inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-1 text-[11px] font-bold text-emerald-700"
            : isWarning
              ? "inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-2.5 py-1 text-[11px] font-bold text-amber-800"
              : "inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-[11px] font-bold text-muted-foreground"
        }
      >
        <span
          className={
            isLive
              ? "size-1.5 rounded-full bg-emerald-500 animate-pulse"
              : "size-1.5 rounded-full bg-muted-foreground/50"
          }
        />
        {label}
      </span>
      {statusDetail && isWarning ? (
        <span className="text-[11px] text-muted-foreground">{statusDetail}</span>
      ) : null}
    </div>
  );
}
