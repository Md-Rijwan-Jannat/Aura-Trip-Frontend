export type TGroupRole = 'OWNER' | 'ADMIN' | 'MODERATOR' | 'MEMBER';
export type TGroupVisibility = 'PUBLIC' | 'PRIVATE';
export type TGroupJoinPolicy = 'OPEN' | 'REQUEST' | 'CLOSED';
export type TGroupPostPermission = 'ALL_MEMBERS' | 'ADMINS';
export type TGroupMembershipStatus =
  | 'APPROVED'
  | 'PENDING'
  | 'REJECTED'
  | 'LEFT'
  | 'BANNED'
  | 'NONE';
export type TGroupModerationStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'REMOVED';

export const GROUP_CATEGORIES = [
  'Travel Tips',
  'Backpacking',
  'Photography',
  'Food & Travel',
  'Adventure',
  'Local Travel',
  'Travel Companions',
] as const;

export interface TGroup {
  _id: string;
  name: string;
  slug: string;
  description: string;
  purpose?: string | null;
  category: string;
  visibility: TGroupVisibility;
  image?: string | null;
  coverImage?: string | null;
  location?: string | null;
  rules: string[];
  joinPolicy: TGroupJoinPolicy;
  postPermission: TGroupPostPermission;
  postApprovalEnabled: boolean;
  chatEnabled: boolean;
  notifyOnNewPost: boolean;
  owner: { _id: string; name: string; image?: string; email?: string } | string;
  memberCount: number;
  pendingCount: number;
  chat?: string | null;
  bannedUsers: string[];
  mutedUsers: string[];
  isDeleted: boolean;
  myStatus?: TGroupMembershipStatus;
  myRole?: TGroupRole | null;
  createdAt: string;
  updatedAt: string;
}

export interface TGroupMembership {
  _id: string;
  group: string;
  user: { _id: string; name: string; image?: string; email?: string };
  role: TGroupRole;
  status: TGroupMembershipStatus;
  mutedNotifications?: boolean;
  bannedAt?: string | null;
  joinedAt?: string | null;
  requestedAt?: string | null;
  reviewedAt?: string | null;
  createdAt: string;
}

export interface TGroupInvite {
  _id: string;
  group: string;
  createdBy?: { _id: string; name: string } | string;
  label?: string | null;
  status: 'ACTIVE' | 'REVOKED';
  maxUses: number | null;
  usedCount: number;
  requiresApproval: boolean;
  expiresAt: string | null;
  createdAt: string;
}

export interface TGroupAuditEntry {
  _id: string;
  group: string;
  actor?: { _id: string; name: string; image?: string } | string;
  action: string;
  targetType?: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface TGroupFeedContext {
  myRole: TGroupRole | null;
  myStatus: TGroupMembershipStatus | null;
  isStaff: boolean;
  postApprovalEnabled: boolean;
  postPermission: TGroupPostPermission;
  chatEnabled: boolean;
  visibility: TGroupVisibility;
  canPost: boolean;
}

export interface TInvitePreview {
  state: 'VALID' | 'EXPIRED' | 'REVOKED' | 'EXHAUSTED' | 'GROUP_UNAVAILABLE';
  group: {
    _id: string;
    name: string;
    slug: string;
    description: string;
    category: string;
    visibility: TGroupVisibility;
    image?: string | null;
    coverImage?: string | null;
    memberCount: number;
    joinPolicy: TGroupJoinPolicy;
  };
}
