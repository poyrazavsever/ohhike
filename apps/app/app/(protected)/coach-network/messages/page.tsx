import Link from "next/link";

import { listMarketplaceConversationsForUser } from "../../../actions/coach-network-messages";
import {
  DashboardHero,
  EmptyStateCard,
  MetricCard,
} from "../../../../components/dashboard/dashboard-cards";

function formatWhen(value: string | null) {
  if (!value) {
    return "—";
  }
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function CoachNetworkMessagesPage() {
  const conversations = await listMarketplaceConversationsForUser();
  const activeCount = conversations.filter((conversation) =>
    Boolean(conversation.lastMessageAt),
  ).length;

  return (
    <section className="bg-primary-50 px-5 py-6 md:px-8">
      <DashboardHero
        eyebrow="Coach Network"
        title="Messages"
        subtitle="Track conversations started from applications, offers and proof review threads."
        mascotSrc="/maskotlar/hazirlik.png"
      />

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <MetricCard
          label="Conversations"
          value={conversations.length.toString()}
          helper="Marketplace threads"
          icon="solar:chat-round-dots-bold"
        />
        <MetricCard
          label="Active"
          value={activeCount.toString()}
          helper="Have message history"
          icon="solar:chat-line-bold"
          tone="secondary"
        />
        <MetricCard
          label="Latest"
          value={
            conversations[0]?.lastMessageAt
              ? formatWhen(conversations[0].lastMessageAt)
              : "-"
          }
          helper="Most recent activity"
          icon="solar:clock-circle-bold"
          tone="info"
        />
      </div>

      {conversations.length === 0 ? (
        <EmptyStateCard
          title="No conversations yet"
          description="Threads start when an athlete applies or when you send an offer."
          icon="solar:chat-round-dots-bold"
        />
      ) : (
        <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-card">
          <div className="hidden grid-cols-[1.35fr_auto] gap-4 border-b border-border px-4 py-3 text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-muted-foreground md:grid">
            <span>Conversation</span>
            <span>Last activity</span>
          </div>
          <ul className="divide-y divide-border">
            {conversations.map((conversation) => (
              <li key={conversation.id}>
                <Link
                  href={`/coach-network/messages/${conversation.id}`}
                  className="grid gap-3 px-4 py-3 transition-colors hover:bg-background md:grid-cols-[1.35fr_auto] md:items-center md:gap-4"
                >
                  <div>
                    <p className="text-sm font-black text-foreground">
                      {conversation.label}
                    </p>
                    {conversation.preview ? (
                      <p className="mt-1 line-clamp-1 text-xs font-semibold text-muted-foreground">
                        {conversation.preview}
                      </p>
                    ) : null}
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground">
                    {formatWhen(conversation.lastMessageAt)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
