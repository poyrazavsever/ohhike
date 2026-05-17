import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";

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

export default async function AthleteMessagesPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/login?redirect_url=/athlete/messages");
  }

  const conversations = await listMarketplaceConversationsForUser();

  return (
    <main className="mx-auto max-w-3xl px-5 py-16 md:px-8">
      <h1 className="text-3xl font-extrabold text-foreground">Messages</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Conversations with coaches from applications, offers, and proof reviews.
        New messages appear in real time when Supabase Realtime is enabled.
      </p>

      {conversations.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-border bg-card px-6 py-10 text-center">
          <p className="text-sm font-semibold text-muted-foreground">
            No conversations yet. Apply to a coach to start messaging.
          </p>
          <Link
            href="/find-coach"
            className="mt-4 inline-flex text-sm font-bold text-primary"
          >
            Find a coach →
          </Link>
        </div>
      ) : (
        <ul className="mt-8 space-y-3">
          {conversations.map((conversation) => (
            <li key={conversation.id}>
              <Link
                href={`/athlete/messages/${conversation.id}`}
                className="block rounded-2xl border border-border bg-card px-5 py-4 transition-colors hover:bg-muted/40"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-extrabold text-foreground">{conversation.label}</p>
                    {conversation.preview ? (
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                        {conversation.preview}
                      </p>
                    ) : null}
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {formatWhen(conversation.lastMessageAt)}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
