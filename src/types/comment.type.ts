import { TUser } from "./user.type";

export interface TComment {
  _id: string;
  user: TUser;
  post: string;
  short?: string;
  text: string;
  images: any[];
  likes: any[];
  dislikes: any[];
  replies: any[];
  /** Parent comment id for nested replies (absent = top-level). */
  parentComment?: string | null;
  isDeleted: boolean;
  editedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  __v: number;
}
