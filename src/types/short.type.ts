export type TShortAudience = 'PUBLIC' | 'FOLLOWERS' | 'PRIVATE';
export type TShortStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'PUBLISHED'
  | 'FAILED'
  | 'REMOVED';

export interface TShort {
  _id: string;
  user: { _id: string; name: string; image?: string; verified?: boolean } | string;
  video: string;
  coverImage?: string | null;
  title?: string | null;
  caption?: string | null;
  location?: string | null;
  hashtags: string[];
  audience: TShortAudience;
  group?: string | null;
  duration?: number | null;
  sizeBytes?: number | null;
  status: TShortStatus;
  moderationStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'REMOVED';
  views: string[];
  likes: string[];
  reportCount: number;
  isDeleted: boolean;
  likedByMe?: boolean;
  viewedByMe?: boolean;
  createdAt: string;
  updatedAt: string;
}
