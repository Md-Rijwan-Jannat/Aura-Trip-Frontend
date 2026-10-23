import { TUser } from "./user.type";

export type TMediaLayout =
  | "AUTO"
  | "SINGLE"
  | "SPLIT"
  | "FEATURE"
  | "GRID"
  | "MOSAIC";

/** Layout chips shared by the create/edit composers (2+ images). */
export const MEDIA_LAYOUT_OPTIONS: {
  key: TMediaLayout;
  label: string;
  hint: string;
}[] = [
  { key: "AUTO", label: "Auto", hint: "✦" },
  { key: "SPLIT", label: "Split", hint: "▌▐" },
  { key: "FEATURE", label: "Feature", hint: "▦" },
  { key: "GRID", label: "Grid", hint: "⊞" },
  { key: "MOSAIC", label: "Mosaic", hint: "▥" },
];

export type TCommentSortMode = "TOP" | "NEWEST" | "OLDEST";
export type TCommentHighlightMode = "AUTO" | "MANUAL";

export interface TCommentSettings {
  sortMode: TCommentSortMode;
  highlightMode: TCommentHighlightMode;
  highlightedComment: string | null;
}

export interface TPost {
  [x: string]: any;
  _id: string;
  user: TUser;
  images: string[];
  title: string;
  description: string;
  comments: any[];
  status: string;
  category: string;
  reportCount: number;
  likes: any[];
  dislikes: any[];
  isDeleted: boolean;
  report: any[];
  createdAt: string;
  updatedAt: string;
  /** Multi-image grid layout (AUTO = pick from image count). */
  mediaLayout?: TMediaLayout;
  /** Owner's single profile pin. */
  pinned?: boolean;
  pinnedAt?: string | null;
  /** Owner's single profile highlight. */
  featured?: boolean;
  featuredAt?: string | null;
  /** Community-group pin (independent of the profile pin). */
  groupPinnedAt?: string | null;
  isEdited?: boolean;
  editedAt?: string | null;
  commentSettings?: TCommentSettings;
}
