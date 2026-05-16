import {
  severityTone,
  type ParsedObservation,
} from "../../../../lib/ai-report-display";

export function AiReportObservationSection({
  title,
  items,
}: {
  title: string;
  items: ParsedObservation[];
}) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="rounded-3xl border border-border bg-card p-5">
      <p className="text-sm font-extrabold text-foreground">{title}</p>
      <ul className="mt-4 space-y-3">
        {items.map((item, index) => (
          <li
            key={`${title}-${index}`}
            className="rounded-2xl border border-border bg-background px-4 py-3"
          >
            <div className="flex flex-wrap items-center gap-2">
              {item.category ? (
                <span className="rounded-lg bg-muted px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                  {item.category}
                </span>
              ) : null}
              {item.athlete_reference ? (
                <span className="text-xs font-bold text-foreground">
                  {item.athlete_reference}
                </span>
              ) : null}
              {item.severity ? (
                <span
                  className={`rounded-lg px-2 py-0.5 text-[10px] font-extrabold uppercase ${severityTone(item.severity)}`}
                >
                  {item.severity}
                </span>
              ) : null}
            </div>
            <p className="mt-2 text-sm font-semibold leading-6 text-foreground">
              {item.observation}
            </p>
            {item.evidence ? (
              <p className="mt-2 text-xs font-medium text-muted-foreground">
                Evidence: {item.evidence}
              </p>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
