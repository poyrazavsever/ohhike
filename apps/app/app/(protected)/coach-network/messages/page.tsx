import Link from "next/link";

import { listMarketplaceConversationsForUser } from "../../../actions/coach-network-messages";

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

  return (
    <main className="mx-auto max-w-4xl px-5 py-8 md:px-8">
      <h1 className="text-2xl font-extrabold text-foreground">Messages</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Conversations with remote athletes from applications, offers, and proofs.
      </p>

      {conversations.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-dashed border-border bg-card px-6 py-12 text-center text-sm font-semibold text-muted-foreground">
          No conversations yet. They start when an athlete applies or you send an offer.
        </div>
      ) : (
        <ul className="mt-8 divide-y divide-border rounded-3xl border border-border bg-card">
          {conversations.map((conversation) => (
            <li key={conversation.id}>
              <Link
                href={`/coach-network/messages/${conversation.id}`}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 transition-colors hover:bg-muted/40"
              >
                <div>
                  <p className="font-extrabold text-foreground">{conversation.label}</p>
                  {conversation.preview ? (
                    <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
                      {conversation.preview}
                    </p>
                  ) : null}
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatWhen(conversation.lastMessageAt)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
