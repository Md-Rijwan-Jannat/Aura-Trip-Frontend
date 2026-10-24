"use client";

import React, { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useSocket } from "@/src/context/socketProvider";
import { Avatar } from "@nextui-org/avatar";
import { FaCheckDouble, FaUserPlus, FaThumbsUp, FaComment, FaUsers, FaVideo, FaShieldHalved } from "react-icons/fa6";
import { FaRegBell, FaCog } from "react-icons/fa";
import {
  useGetNotificationsQuery,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
  useDeleteNotificationMutation,
  useGetUnreadNotificationCountQuery,
} from "@/src/redux/features/notification/notificationApi";
import { TAppNotification } from "@/src/types";
import { CommunityButton, EmptyState, ListSkeleton, formatRelative } from "@/src/components/ui/communityKit";

function typeIcon(type: string) {
  switch (type) {
    case "GROUP_JOIN_REQUEST":
    case "GROUP_JOINED":
      return <FaUserPlus />;
    case "GROUP_POST_APPROVED":
    case "GROUP_POST_REJECTED":
    case "GROUP_POST_REMOVED":
      return <FaShieldHalved />;
    case "GROUP_POST_CREATED":
      return <FaComment />;
    case "GROUP_NEW_MEMBER":
      return <FaUsers />;
    case "SHORT_LIKED":
      return <FaThumbsUp />;
    case "SHORT_CREATED":
      return <FaVideo />;
    case "post.commented":
    case "post.reacted":
      return <FaComment />;
    case "comment.replied":
    case "comment.liked":
    case "comment.reacted":
      return <FaComment />;
    case "user.followed":
      return <FaUserPlus />;
    case "post.liked":
      return <FaThumbsUp />;
    default:
      return <FaRegBell />;
  }
}

const TYPE_BG: Record<string, string> = {
  GROUP_JOIN_REQUEST: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  GROUP_POST_APPROVED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  GROUP_POST_REJECTED: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300",
  GROUP_POST_REMOVED: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300",
  GROUP_JOINED: "bg-sage-100 text-sage-700 dark:bg-sage-500/15 dark:text-sage-300",
  GROUP_NEW_MEMBER: "bg-sage-100 text-sage-700 dark:bg-sage-500/15 dark:text-sage-300",
  SHORT_LIKED: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
  "post.commented": "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
  "post.liked": "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
  "post.reacted": "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
  "comment.replied": "bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300",
  "comment.liked": "bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300",
  "comment.reacted": "bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300",
  "user.followed": "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  "short.reacted": "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
};

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationDropdown({ isOpen, onClose }: NotificationDropdownProps) {
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { data, isLoading, refetch } = useGetNotificationsQuery({
    limit: 20,
  });
  const { data: unreadCountData } = useGetUnreadNotificationCountQuery(undefined, {
    skip: !isOpen,
  });
  const [markAll, { isLoading: markingAll }] = useMarkAllNotificationsReadMutation();
  const [markRead] = useMarkNotificationReadMutation();
  const [deleteNotification] = useDeleteNotificationMutation();
  const socket = useSocket();

  const notifications: TAppNotification[] = (data?.data as TAppNotification[]) || [];
  const unreadCount = unreadCountData?.data.count ?? 0;

  useEffect(() => {
    if (!socket || !isOpen) return;

    const handleNewNotification = (payload: {
      _id: string;
      type: string;
      title: string;
      body?: string;
      link?: string;
      createdAt: string;
    }) => {
      refetch();
    };

    socket.on("notification received", handleNewNotification);

    return () => {
      socket.off("notification received", handleNewNotification);
    };
  }, [socket, isOpen, refetch]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  const handleClick = async (notification: TAppNotification) => {
    if (!notification.readAt) {
      await markRead(notification._id);
    }

    if (notification.link) {
      router.push(notification.link);
    }

    onClose();
  };

  const handleDelete = async (event: React.MouseEvent, notificationId: string) => {
    event.stopPropagation();
    await deleteNotification(notificationId);
  };

  const handleMarkAllRead = async () => {
    await markAll(undefined);
  };

  const handleSettings = () => {
    router.push("/settings?tab=notifications");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={dropdownRef}
          initial={{ opacity: 0, y: 8, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className='absolute right-0 top-full mt-2 w-[380px] max-w-[90vw] md:w-[420px] max-h-[600px] overflow-hidden rounded-2xl bg-white dark:bg-surface border border-borderSubtle shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)] z-50 flex flex-col'
        >
          <div className='flex items-center justify-between px-4 py-3 border-b border-borderSubtle bg-default-50/50 dark:bg-surface/50'>
            <div className='flex items-center gap-2'>
              <h3 className='font-semibold text-default-900'>Notifications</h3>
              {unreadCount > 0 && (
                <span className='text-[10px] font-bold px-2 py-0.5 rounded-full bg-sage-600 text-white'>{unreadCount} new</span>
              )}
            </div>
            <div className='flex items-center gap-1'>
              <CommunityButton
                variant='ghost'
                size='sm'
                startContent={<FaCheckDouble />}
                isDisabled={unreadCount === 0}
                isLoading={markingAll}
                onPress={handleMarkAllRead}
              >
                Mark all
              </CommunityButton>
              <CommunityButton variant='ghost' size='sm' startContent={<FaCog />} onPress={handleSettings}>
                Settings
              </CommunityButton>
            </div>
          </div>

          <div className='flex px-4 pt-3'>
            <div className='inline-flex rounded-full bg-default-100 dark:bg-surface border border-borderSubtle p-1'>
              <button className='px-4 py-1.5 rounded-full text-xs font-medium text-sage-700 dark:text-sage-300 bg-white dark:bg-sage-500/10 shadow-sm'>
                All
              </button>
              <button className='px-4 py-1.5 rounded-full text-xs font-medium text-default-500 hover:text-default-700 transition-colors'>
                Unread
              </button>
            </div>
          </div>

          <div className='overflow-y-auto flex-1 p-2'>
            {isLoading ? (
              <ListSkeleton count={4} />
            ) : notifications.length === 0 ? (
              <EmptyState icon={<FaRegBell />} title='All caught up!' description='No notifications to show.' className='py-10' />
            ) : (
              <div className='space-y-1'>
                {notifications.map((notification, i) => {
                  const actor = typeof notification.actor === "string" ? null : notification.actor;
                  const unread = !notification.readAt;

                  return (
                    <motion.div
                      key={notification._id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: Math.min(i * 0.03, 0.3) }}
                      onClick={() => handleClick(notification)}
                      className={`relative group flex flex-row items-start gap-3 px-3 py-3 min-w-0 cursor-pointer rounded-xl transition-all duration-200 ${
                        unread
                          ? "bg-sage-50 dark:bg-sage-500/10 hover:border-sage-300 dark:hover:bg-sage-500/20"
                          : "bg-surface dark:bg-surface/50 hover:bg-default-50 dark:hover:bg-default-50/50"
                      }`}
                    >
                      {unread && (
                        <span className='absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-sage-600 dark:bg-sage-500' />
                      )}

                      <div className='flex-shrink-0 mt-0.5'>
                        {actor ? (
                          <Avatar
                            radius='full'
                            className='w-10 h-10'
                            name={(actor.name || notification.title || "U").charAt(0).toUpperCase()}
                            src={actor.image || undefined}
                          />
                        ) : (
                          <span
                            className={`w-10 h-10 rounded-full flex items-center justify-center text-sm ${
                              TYPE_BG[notification.type] || "bg-default-100 dark:bg-default-500/10 text-default-500 dark:text-default-400"
                            }`}
                          >
                            {typeIcon(notification.type)}
                          </span>
                        )}
                      </div>

                      <div className='flex-1 min-w-0 pr-8'>
                        <p
                          className={`text-sm truncate ${
                            unread
                              ? "font-semibold text-default-900 dark:text-default-100"
                              : "font-medium text-default-700 dark:text-default-300"
                          }`}
                        >
                          {notification.title}
                        </p>
                        {notification.body && (
                          <p className='text-xs text-default-500 dark:text-default-400 truncate mt-0.5'>{notification.body}</p>
                        )}
                        <p className='text-[11px] text-default-400 dark:text-default-500 mt-1'>{formatRelative(notification.createdAt)}</p>
                      </div>

                      <button
                        type='button'
                        onClick={(e) => handleDelete(e, notification._id)}
                        className={`absolute top-3 right-3 p-1.5 rounded-full text-default-400 hover:bg-default-100 hover:text-default-600 dark:hover:bg-white/10 dark:hover:text-default-200 transition-colors ${
                          unread ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                        }`}
                        title='Delete notification'
                      >
                        <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
                          />
                        </svg>
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
