export type TReactionType =
  | "like"
  | "love"
  | "care"
  | "haha"
  | "wow"
  | "sad"
  | "angry";

/** Reactable targets accepted by `/react/:targetType/:targetId`. */
export type TReactionTarget = "post" | "comment" | "short";

export const REACTION_TYPES: TReactionType[] = [
  "like",
  "love",
  "care",
  "haha",
  "wow",
  "sad",
  "angry",
];

export const REACTION_EMOJI: Record<TReactionType, string> = {
  like: "👍",
  love: "❤️",
  care: "🤗",
  haha: "😂",
  wow: "😮",
  sad: "😢",
  angry: "😡",
};

export const REACTION_LABEL: Record<TReactionType, string> = {
  like: "Like",
  love: "Love",
  care: "Care",
  haha: "Haha",
  wow: "Wow",
  sad: "Sad",
  angry: "Angry",
};

export interface TReactionSummary {
  targetType: string;
  targetId: string;
  counts: Partial<Record<TReactionType, number>>;
  total: number;
  myReaction: TReactionType | null;
}
