import { notFound } from "next/navigation";

import { ConversationThread } from "../../_components/conversation-thread";
import {
  getMarketplaceConversationMessages,
  listMarketplaceConversationsForUser,
} from "../../../../actions/coach-network-messages";

type CoachConversationPageProps = {
  params: Promise<{ conversationId: string }>;
};

export default async function CoachConversationPage({
  params,
}: CoachConversationPageProps) {
  const { conversationId } = await params;
  const conversations = await listMarketplaceConversationsForUser();
  const conversation = conversations.find((row) => row.id === conversationId);

  if (!conversation) {
    notFound();
  }

  const messages = await getMarketplaceConversationMessages(conversationId);

  return (
    <main className="mx-auto max-w-3xl px-5 py-8 md:px-8">
      <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
        {conversation.label}
      </p>
      <ConversationThread
        conversationId={conversationId}
        initialMessages={messages}
        backHref="/coach-network/messages"
      />
    </main>
  );
}
