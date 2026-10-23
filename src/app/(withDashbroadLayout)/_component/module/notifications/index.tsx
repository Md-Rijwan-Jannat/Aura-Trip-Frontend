'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Avatar } from '@nextui-org/avatar';
import {
  FaCheckDouble,
  FaUserPlus,
  FaThumbsUp,
  FaComment,
  FaUsers,
  FaVideo,
  FaShieldHalved,
  FaBell,
} from 'react-icons/fa6';
import { motion } from 'framer-motion';
import {
  useGetNotificationsQuery,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
} from '@/src/redux/features/notification/notificationApi';
import { TAppNotification } from '@/src/types';
import {
  CommunityButton,
  EmptyState,
  ListSkeleton,
  formatRelative,
} from '@/src/components/ui/communityKit';

function typeIcon(type: string) {
  switch (type) {
    case 'GROUP_JOIN_REQUEST':
    case 'GROUP_JOINED':
      return <FaUserPlus />;
    case 'GROUP_POST_APPROVED':
    case 'GROUP_POST_REJECTED':
    case 'GROUP_POST_REMOVED':
      return <FaShieldHalved />;
    case 'GROUP_POST_CREATED':
      return <FaComment />;
    case 'GROUP_NEW_MEMBER':
      return <FaUsers />;
    case 'SHORT_LIKED':
      return <FaThumbsUp />;
    case 'SHORT_CREATED':
      return <FaVideo />;
    default:
      return <FaBell />;
  }
}

const TYPE_TINT: Record<string, string> = {
  GROUP_JOIN_REQUEST: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  GROUP_POST_APPROVED:
    'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  GROUP_POST_REJECTED:
    'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300',
  GROUP_POST_REMOVED:
    'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300',
  GROUP_JOINED: 'bg-sage-100 text-sage-700 dark:bg-sage-500/15 dark:text-sage-300',
  GROUP_NEW_MEMBER:
    'bg-sage-100 text-sage-700 dark:bg-sage-500/15 dark:text-sage-300',
  SHORT_LIKED: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
};

export default function Notification() {
  const router = useRouter();
  const { data, isLoading } = useGetNotificationsQuery({ limit: 50 });
  const [markAll, { isLoading: markingAll }] =
    useMarkAllNotificationsReadMutation();
  const [markRead] = useMarkNotificationReadMutation();

  const notifications: TAppNotification[] = (data?.data as TAppNotification[]) || [];
  const unreadCount = notifications.filter((n) => !n.readAt).length;

  const handleClick = (n: TAppNotification) => {
    if (!n.readAt) markRead(n._id);
    if (n.link) router.push(n.link);
  };

  return (
    <div className="flex flex-col space-y-3 p-4 mx-auto w-full">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold text-default-800">Notifications</h2>
          {unreadCount > 0 && (
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-sage-600 text-white">
              {unreadCount} new
            </span>
          )}
        </div>
        <CommunityButton
          variant="ghost"
          size="sm"
          startContent={<FaCheckDouble />}
          isDisabled={unreadCount === 0}
          isLoading={markingAll}
          onPress={() => markAll(undefined)}
        >
          Mark all read
        </CommunityButton>
      </div>

      {isLoading ? (
        <ListSkeleton count={4} />
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={<FaBell />}
          title="All caught up"
          description="Group activity, likes, and moderation updates will show up here."
        />
      ) : (
        <div className="space-y-1.5">
          {notifications.map((notification, i) => {
            const actor =
              typeof notification.actor === 'string' ? null : notification.actor;
            const unread = !notification.readAt;

            return (
              <motion.button
                key={notification._id}
                type="button"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: Math.min(i * 0.03, 0.3) }}
                onClick={() => handleClick(notification)}
                className={`w-full text-left rounded-xl border flex flex-row items-center gap-3 px-3 sm:px-4 py-3 min-w-0 cursor-pointer transition-all duration-200 ${
                  unread
                    ? 'bg-sage-50 border-sage-200 dark:bg-sage-500/10 dark:border-sage-500/30 hover:border-sage-300'
                    : 'bg-surface border-borderSubtle hover:border-sage-200'
                }`}
              >
                {actor ? (
                  <Avatar
                    radius="full"
                    className="w-10 h-10 flex-shrink-0"
                    name={(actor.name || notification.title)?.charAt(0)?.toUpperCase()}
                    src={actor.image || undefined}
                  />
                ) : (
                  <span
                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-sm ${
                      TYPE_TINT[notification.type] ||
                      'bg-default-100 text-default-500'
                    }`}
                  >
                    {typeIcon(notification.type)}
                  </span>
                )}

                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm truncate ${
                      unread ? 'font-bold text-default-900' : 'font-semibold text-default-700'
                    }`}
                  >
                    {notification.title}
                  </p>
                  {notification.body ? (
                    <p className="text-xs text-default-500 truncate">
                      {notification.body}
                    </p>
                  ) : null}
                  <p className="text-[11px] text-default-400 mt-0.5">
                    {formatRelative(notification.createdAt)}
                  </p>
                </div>

                {unread ? (
                  <span className="w-2.5 h-2.5 rounded-full bg-sage-500 flex-shrink-0" />
                ) : (
                  <span className="text-[11px] text-default-400 flex-shrink-0">
                    View
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>
      )}
    </div>
  );
}
