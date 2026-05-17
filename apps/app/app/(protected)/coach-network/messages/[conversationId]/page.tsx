import { notFound } from "next/navigation";

import { ConversationThread } from "../../_components/conversation-thread";
import { DashboardHero } from "../../../../../components/dashboard/dashboard-cards";
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
    <section className="bg-primary-50 px-5 py-6 md:px-8">
      <DashboardHero
        eyebrow="Coach Network"
        title={conversation.label}
        subtitle="Follow the full marketplace conversation history in one place."
        mascotSrc="/maskotlar/hazirlik.png"
      />
      <ConversationThread
        conversationId={conversationId}
        initialMessages={messages}
        backHref="/coach-network/messages"
      />
    </section>
  );
}
