import { TUser } from "./user.type";
import { TMessageType, TMessageLocation } from "./message.type";

export interface TChat {
  _id: string;
  chatName: string;
  isGroupChat: boolean;
  users: TUser[];
  latestMessage: TLatestMessage;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface TLatestMessage {
  _id: string;
  sender: TUser;
  content: string;
  chat: string;
  readBy: string[];
  messageType?: TMessageType;
  location?: TMessageLocation | null;
  mediaUrl?: string | null;
  isDeleted?: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}
