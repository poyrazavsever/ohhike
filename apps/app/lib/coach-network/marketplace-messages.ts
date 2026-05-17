export const MARKETPLACE_MESSAGE_MAX_LENGTH = 4000;
export const MARKETPLACE_MESSAGE_MIN_INTERVAL_MS = 800;

export type MarketplaceMessageView = {
  id: string;
  conversationId: string;
  senderUserId: string;
  body: string;
  messageType: string;
  createdAt: string | null;
};

export type MarketplaceConversationView = {
  id: string;
  conversationType: string;
  lastMessageAt: string | null;
  preview: string | null;
  label: string;
};

export function conversationTypeLabel(type: string) {
  switch (type) {
    case "application":
      return "Application";
    case "offer":
      return "Coaching offer";
    case "proof":
      return "Training proof";
    case "coaching":
      return "Coaching";
    default:
      return "Conversation";
  }
}
