import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";

import { ConversationThread } from "../../../_components/conversation-thread";
import {
  getMarketplaceConversationMessages,
  listMarketplaceConversationsForUser,
} from "../../../../actions/coach-network-messages";

type AthleteConversationPageProps = {
  params: Promise<{ conversationId: string }>;
};

export default async function AthleteConversationPage({
  params,
}: AthleteConversationPageProps) {
  const { userId } = await auth();
  if (!userId) {
    redirect("/login?redirect_url=/athlete/messages");
  }

  const { conversationId } = await params;
  const conversations = await listMarketplaceConversationsForUser();
  const conversation = conversations.find((row) => row.id === conversationId);

  if (!conversation) {
    notFound();
  }

  const messages = await getMarketplaceConversationMessages(conversationId);

  return (
    <main className="mx-auto max-w-4xl px-5 py-12 md:px-8">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
        {conversation.label}
      </p>
      <ConversationThread
        conversationId={conversationId}
        initialMessages={messages}
        backHref="/athlete/messages"
      />
    </main>
  );
}
