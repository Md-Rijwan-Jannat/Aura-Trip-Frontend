import { TMessageType, TMessageLocation } from "@/src/types";

/** Structural shape shared by full messages and chat `latestMessage`. */
type TPreviewSource = {
  messageType?: TMessageType;
  content?: string;
  isDeleted?: boolean;
  location?: TMessageLocation | null;
};

/** Human-readable chat-list preview for every supported message type. */
export const messagePreview = (message?: TPreviewSource | null): string => {
  if (!message) return "No messages yet";
  if (message.isDeleted) return "This message was deleted";

  switch (message.messageType) {
    case "IMAGE":
      return message.content ? `📷 ${message.content}` : "📷 Photo";
    case "VIEW_ONCE_IMAGE":
      return "👁️ View-once photo";
    case "VOICE":
      return "🎤 Voice message";
    case "LOCATION":
      return message.location?.label
        ? `📍 ${message.location.label}`
        : "📍 Location";
    case "LIVE_LOCATION":
      return message.location?.label
        ? `📡 ${message.location.label}`
        : "📡 Live location";
    case "EMOJI":
      return message.content || "";
    case "TEXT":
    default:
      return message.content || "No messages yet";
  }
};
