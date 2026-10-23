import { TUser } from "./user.type";
import { TChat } from "./chat.type";

export type TMessageType =
  | "TEXT"
  | "IMAGE"
  | "VOICE"
  | "LOCATION"
  | "EMOJI"
  | "VIEW_ONCE_IMAGE"
  | "LIVE_LOCATION";

export interface TMessageMediaMeta {
  durationSeconds?: number;
  width?: number;
  height?: number;
  thumbnailUrl?: string;
}

export interface TMessageLocation {
  lat: number;
  lng: number;
  label?: string;
}

/** LIVE_LOCATION session metadata (server-set window). */
export interface TMessageLiveLocation {
  expiresAt: string;
}

/** Read-safe preview of the message a reply points at. */
export interface TMessageReplyPreview {
  _id: string;
  sender: { _id: string; name: string; image?: string | null };
  content: string;
  messageType?: TMessageType;
  isDeleted?: boolean;
}

export interface TMessage {
  _id: string;
  sender: TUser;
  content: string;
  chat: TChat;
  readBy: TUser[];
  messageType?: TMessageType;
  mediaUrl?: string | null;
  mediaMeta?: TMessageMediaMeta | null;
  location?: TMessageLocation | null;
  /** LIVE_LOCATION only: sharing window; position updates refresh `location`. */
  liveLocation?: TMessageLiveLocation | null;
  /** Flattened reply reference with an embedded preview. */
  replyTo?: TMessageReplyPreview | null;
  isEdited?: boolean;
  editedAt?: string | null;
  isDeleted?: boolean;
  deletedAt?: string | null;
  /** VIEW_ONCE only: true once the recipient has consumed the media. */
  viewOnceOpened?: boolean;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

/** Legacy in-chat notification shape (chat context). */
export interface TNotification {
  id: string;
  message: string;
  type: string;
}
