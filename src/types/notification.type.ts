export interface TAppNotification {
  _id: string;
  recipient: string;
  actor?: { _id: string; name: string; image?: string } | string;
  type: string;
  title: string;
  body?: string | null;
  link?: string | null;
  entityType?: string | null;
  entityId?: string | null;
  groupId?: string | null;
  readAt?: string | null;
  createdAt: string;
}
