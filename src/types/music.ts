/**
 * Music system types for Aura Trip
 */

export enum MusicProvider {
  JAMENDO = "JAMENDO",
  FREE_MUSIC_ARCHIVE = "FREE_MUSIC_ARCHIVE",
  INTERNAL = "INTERNAL",
}

export enum MusicLicense {
  CC_BY = "CC_BY",
  CC_BY_SA = "CC_BY_SA",
  CC_BY_ND = "CC_BY_ND",
  CC_BY_NC = "CC_BY_NC",
  CC0 = "CC0",
  ROYALTY_FREE = "ROYALTY_FREE",
  CUSTOM = "CUSTOM",
}

export enum MusicMood {
  HAPPY = "HAPPY",
  SAD = "SAD",
  ENERGETIC = "ENERGETIC",
  CALM = "CALM",
  ROMANTIC = "ROMANTIC",
  EPIC = "EPIC",
  DARK = "DARK",
  UPLIFTING = "UPLIFTING",
  CHILL = "CHILL",
  DRAMATIC = "DRAMATIC",
}

export enum MusicGenre {
  POP = "POP",
  ROCK = "ROCK",
  ELECTRONIC = "ELECTRONIC",
  JAZZ = "JAZZ",
  CLASSICAL = "CLASSICAL",
  HIP_HOP = "HIP_HOP",
  AMBIENT = "AMBIENT",
  FOLK = "FOLK",
  INDIE = "INDIE",
  WORLD = "WORLD",
  ACOUSTIC = "ACOUSTIC",
  INSTRUMENTAL = "INSTRUMENTAL",
}

export interface IMusicTrack {
  _id: string;
  provider: MusicProvider;
  providerTrackId: string;
  title: string;
  artist: string;
  album?: string;
  duration: number; // seconds
  artworkUrl?: string;
  previewUrl: string;
  downloadUrl?: string;
  genre?: MusicGenre;
  mood?: MusicMood;
  language?: string;
  license: MusicLicense;
  attributionRequired: boolean;
  attributionText?: string;
  commercialUse: boolean;
  usageCount: number;
  popularityScore: number;
  lastFetched: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMusicAttachment {
  _id: string;
  track: IMusicTrack;
  startTime: number;
  endTime: number;
  volume: number;
  contentType: "post" | "story" | "short";
  contentId: string;
  user: string;
  fadeIn: boolean;
  fadeOut: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMusicSearchQuery {
  query?: string;
  genre?: MusicGenre;
  mood?: MusicMood;
  language?: string;
  minDuration?: number;
  maxDuration?: number;
  provider?: MusicProvider;
  limit?: number;
  offset?: number;
}

export interface IMusicSearchResult {
  tracks: IMusicTrack[];
  total: number;
  hasMore: boolean;
}

export interface MusicSelection {
  track: IMusicTrack;
  startTime: number;
  endTime: number;
  volume: number;
  fadeIn: boolean;
  fadeOut: boolean;
}

export type ContentType = "post" | "story" | "short";

// Duration limits for different content types
export const MUSIC_DURATION_LIMITS = {
  post: { min: 1, max: 600 },
  story: { min: 1, max: 15 },
  short: { min: 1, max: 60 },
} as const;

// Genre labels for display
export const GENRE_LABELS: Record<MusicGenre, string> = {
  [MusicGenre.POP]: "Pop",
  [MusicGenre.ROCK]: "Rock",
  [MusicGenre.ELECTRONIC]: "Electronic",
  [MusicGenre.JAZZ]: "Jazz",
  [MusicGenre.CLASSICAL]: "Classical",
  [MusicGenre.HIP_HOP]: "Hip Hop",
  [MusicGenre.AMBIENT]: "Ambient",
  [MusicGenre.FOLK]: "Folk",
  [MusicGenre.INDIE]: "Indie",
  [MusicGenre.WORLD]: "World",
  [MusicGenre.ACOUSTIC]: "Acoustic",
  [MusicGenre.INSTRUMENTAL]: "Instrumental",
};

// Mood labels for display
export const MOOD_LABELS: Record<MusicMood, string> = {
  [MusicMood.HAPPY]: "Happy",
  [MusicMood.SAD]: "Sad",
  [MusicMood.ENERGETIC]: "Energetic",
  [MusicMood.CALM]: "Calm",
  [MusicMood.ROMANTIC]: "Romantic",
  [MusicMood.EPIC]: "Epic",
  [MusicMood.DARK]: "Dark",
  [MusicMood.UPLIFTING]: "Uplifting",
  [MusicMood.CHILL]: "Chill",
  [MusicMood.DRAMATIC]: "Dramatic",
};

// License display info
export const LICENSE_INFO: Record<
  MusicLicense,
  {
    label: string;
    description: string;
    requiresAttribution: boolean;
    allowsCommercial: boolean;
  }
> = {
  [MusicLicense.CC_BY]: {
    label: "CC BY",
    description: "Free to use with attribution",
    requiresAttribution: true,
    allowsCommercial: true,
  },
  [MusicLicense.CC_BY_SA]: {
    label: "CC BY-SA",
    description: "Free to use with attribution, share-alike",
    requiresAttribution: true,
    allowsCommercial: true,
  },
  [MusicLicense.CC_BY_ND]: {
    label: "CC BY-ND",
    description: "Free to use with attribution, no derivatives",
    requiresAttribution: true,
    allowsCommercial: true,
  },
  [MusicLicense.CC_BY_NC]: {
    label: "CC BY-NC",
    description: "Free for non-commercial use with attribution",
    requiresAttribution: true,
    allowsCommercial: false,
  },
  [MusicLicense.CC0]: {
    label: "CC0",
    description: "Public domain, no restrictions",
    requiresAttribution: false,
    allowsCommercial: true,
  },
  [MusicLicense.ROYALTY_FREE]: {
    label: "Royalty Free",
    description: "Free to use with attribution",
    requiresAttribution: true,
    allowsCommercial: true,
  },
  [MusicLicense.CUSTOM]: {
    label: "Custom License",
    description: "Check specific terms",
    requiresAttribution: true,
    allowsCommercial: false,
  },
};
