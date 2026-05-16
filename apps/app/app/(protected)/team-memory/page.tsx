import {
  DashboardHero,
  MetricCard,
} from "../../../components/dashboard/dashboard-cards";
import { isGeminiConfigured } from "../../../lib/ai/gemini";
import {
  getTeamMemoryAssistantData,
  getTeamMemoryData,
} from "../../../lib/workspace";
import {
  memorySeverityLabel,
  observationCategoryLabel,
  teamPatternTypeLabel,
} from "../../../lib/coach-vocabulary";
import { TeamMemoryAssistant } from "./_components/team-memory-assistant";
import { TeamMemoryForms } from "./_components/team-memory-forms";

function formatDate(value: string | null) {
  if (!value) {
    return "Unknown";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
  }).format(new Date(value));
}

export default async function TeamMemoryPage({
  searchParams,
}: {
  searchParams: Promise<{ thread?: string }>;
}) {
  const { thread: threadParam } = await searchParams;
  const [{ workspace, observations, patterns, teams, athletes, totals }, assistant] =
    await Promise.all([
      getTeamMemoryData(),
      getTeamMemoryAssistantData(threadParam),
    ]);

  const activeThreadId = threadParam ?? null;
  const activeMessages = threadParam ? assistant.messages : [];

  const metricCards = [
    {
      label: "Observations",
      value: totals.observations.toString(),
      helper: `${totals.unresolvedObservations} unresolved`,
      icon: "solar:eye-bold",
    },
    {
      label: "Patterns",
      value: totals.patterns.toString(),
      helper: `${totals.activePatterns} active`,
      icon: "solar:stars-bold",
      tone: "info" as const,
    },
    {
      label: "Threads",
      value: assistant.threads.length.toString(),
      helper: "Assistant conversations",
      icon: "solar:chat-round-dots-bold",
      tone: "secondary" as const,
    },
    {
      label: "Athletes",
      value: athletes.length.toString(),
      helper: "Memory targets",
      icon: "solar:user-id-bold",
      tone: "warning" as const,
    },
  ];

  const geminiConfigured = isGeminiConfigured();

  return (
    <section className="bg-primary-50 px-5 py-6 md:px-8">
      <DashboardHero
        eyebrow="AI Intelligence"
        title="Team Memory"
        subtitle={`Ask Doctor Panda about coaching memory for ${workspace.organization.name}, or add observations and patterns below.`}
        mascotSrc="/maskotlar/gozetleme.png"
      />

      <TeamMemoryAssistant
        threads={assistant.threads}
        messages={activeMessages}
        teams={teams}
        athletes={athletes}
        initialThreadId={activeThreadId}
        geminiConfigured={geminiConfigured}
      />

      <div className="mt-4">
        <TeamMemoryForms teams={teams} athletes={athletes} />
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {metricCards.map((card) => (
          <MetricCard key={card.label} {...card} />
        ))}
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-sm font-black text-foreground">
            Athlete observations
          </p>
          <p className="mt-1 text-sm font-semibold text-muted-foreground">
            Manual and AI-created athlete context.
          </p>
          <div className="mt-4 grid gap-2">
            {observations.length > 0 ? (
              observations.map((observation) => (
                <article
                  key={observation.id}
                  className="rounded-xl border border-border bg-background p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-black text-foreground">
                        {observation.title ?? observation.athleteName}
                      </p>
                      <p className="mt-1 text-xs font-semibold text-muted-foreground">
                        {observation.athleteName} ·{" "}
                        {observation.teamName ?? "No team"} ·{" "}
                        {observationCategoryLabel(observation.category)} ·{" "}
                        {formatDate(observation.created_at)}
                      </p>
                    </div>
                    <div className="rounded-lg bg-primary-soft px-2.5 py-1 text-xs font-extrabold text-primary-700">
                      {memorySeverityLabel(observation.severity)}
                    </div>
                  </div>
                  <p className="mt-3 text-sm font-semibold leading-6 text-muted-foreground">
                    {observation.observation}
                  </p>
                </article>
              ))
            ) : (
              <p className="rounded-xl border border-dashed border-border bg-background p-4 text-center text-sm font-semibold text-muted-foreground">
                No athlete observations yet.
              </p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-sm font-black text-foreground">Team patterns</p>
          <p className="mt-1 text-sm font-semibold text-muted-foreground">
            Repeating themes and development areas.
          </p>
          <div className="mt-4 grid gap-2">
            {patterns.length > 0 ? (
              patterns.map((pattern) => (
                <article
                  key={pattern.id}
                  className="rounded-xl border border-border bg-background p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-black text-foreground">
                        {pattern.title}
                      </p>
                      <p className="mt-1 text-xs font-semibold text-muted-foreground">
                        {pattern.teamName ?? "No team"} ·{" "}
                        {teamPatternTypeLabel(pattern.pattern_type)}
                        {pattern.severity
                          ? ` · ${memorySeverityLabel(pattern.severity)}`
                          : ""}
                      </p>
                    </div>
                    <div className="rounded-lg bg-primary-soft px-2.5 py-1 text-xs font-extrabold text-primary-700">
                      {pattern.status ?? "active"}
                    </div>
                  </div>
                  <p className="mt-3 text-sm font-semibold leading-6 text-muted-foreground">
                    {pattern.description ?? "No description"}
                  </p>
                </article>
              ))
            ) : (
              <p className="rounded-xl border border-dashed border-border bg-background p-4 text-center text-sm font-semibold text-muted-foreground">
                No team patterns yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
