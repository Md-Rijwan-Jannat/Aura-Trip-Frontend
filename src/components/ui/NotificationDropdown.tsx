"use client";

import React, { useState } from "react";
import { X, Check, Settings, ExternalLink } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { useAppSelector, useAppDispatch } from "@/src/redux/hook";
import { INotification } from "@/src/redux/features/notification/notificationSlice";
import {
  selectNotifications,
  markNotificationRead,
  markAllRead,
  removeNotification,
  closeNotificationDropdown,
} from "@/src/redux/features/notification/notificationSlice";
import {
  useGetNotificationsQuery,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
  useDeleteNotificationMutation,
} from "@/src/redux/features/notification/notificationApi";
import { toast } from "sonner";

const BellIcon = ({ className }: { className?: string }) => (
  <svg xmlns='http://www.w3.org/2000/svg' className={className} fill='none' viewBox='0 0 24 24' stroke='currentColor'>
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth={2}
      d='M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9'
    />
  </svg>
);

export const NotificationDropdown: React.FC = () => {
  const dispatch = useAppDispatch();
  const notifications = useAppSelector(selectNotifications);
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useGetNotificationsQuery(
    { page, limit: 20, unread: activeTab === "unread" ? "true" : undefined },
    { refetchOnMountOrArgChange: true },
  );

  const [markAllReadApi] = useMarkAllNotificationsReadMutation();
  const [markReadApi] = useMarkNotificationReadMutation();
  const [deleteNotificationApi] = useDeleteNotificationMutation();

  const filteredNotifications = activeTab === "unread" ? (data?.data || []).filter((n: INotification) => !n.readAt) : data?.data || [];

  const hasUnread = notifications.some((n: INotification) => !n.readAt);

  const handleMarkAllRead = async () => {
    try {
      await markAllReadApi({}).unwrap();
      dispatch(markAllRead());
      toast.success("All notifications marked as read");
    } catch (error) {
      toast.error("Failed to mark all as read");
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await markReadApi(id).unwrap();
      dispatch(markNotificationRead(id));
      toast.success("Notification marked as read");
    } catch (error) {
      toast.error("Failed to mark as read");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteNotificationApi(id).unwrap();
      dispatch(removeNotification(id));
      toast.success("Notification deleted");
    } catch (error) {
      toast.error("Failed to delete notification");
    }
  };

  const handleLoadMore = () => {
    setPage((prev) => prev + 1);
  };

  const handleNotificationClick = (notification: INotification) => {
    if (!notification.readAt) {
      handleMarkRead(notification._id);
    }
  };

  return (
    <div className='absolute right-0 top-full mt-2 w-96 max-h-[600px] bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden z-50'>
      {/* Header */}
      <div className='p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between'>
        <div>
          <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>Notifications</h3>
          {hasUnread && (
            <p className='text-sm text-gray-500 dark:text-gray-400 mt-1'>
              {notifications.filter((n: INotification) => !n.readAt).length} unread notifications
            </p>
          )}
        </div>
        <div className='flex gap-2'>
          <button
            onClick={() => window.open("/notifications/settings", "_blank")}
            className='inline-flex items-center justify-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors'
            title='Settings'
          >
            <Settings className='w-4 h-4' />
            Settings
          </button>
          {hasUnread && (
            <button
              onClick={handleMarkAllRead}
              className='inline-flex items-center justify-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-md transition-colors'
            >
              <Check className='w-4 h-4' />
              Mark all read
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className='px-4 pt-2 pb-4 border-b border-gray-200 dark:border-gray-800'>
        <div className='flex gap-4'>
          <button
            onClick={() => {
              setActiveTab("all");
              setPage(1);
            }}
            className={`pb-2 px-2 font-medium transition-colors ${
              activeTab === "all"
                ? "text-primary border-b-2 border-primary"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            }`}
          >
            All
          </button>
          <button
            onClick={() => {
              setActiveTab("unread");
              setPage(1);
            }}
            className={`pb-2 px-2 font-medium transition-colors ${
              activeTab === "unread"
                ? "text-primary border-b-2 border-primary"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            }`}
          >
            <span className='flex items-center gap-2'>
              Unread
              {hasUnread && (
                <span className='bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center'>
                  {notifications.filter((n: INotification) => !n.readAt).length}
                </span>
              )}
            </span>
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className='overflow-y-auto max-h-[400px] p-2'>
        {isLoading ? (
          <div className='flex justify-center items-center py-12'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className='text-center py-12'>
            <div className='mx-auto w-24 h-24 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 mb-4'>
              <BellIcon className='w-12 h-12 text-gray-400' />
            </div>
            <p className='text-gray-500 dark:text-gray-400 font-medium'>No {activeTab === "unread" ? "unread" : ""} notifications</p>
            <p className='text-sm text-gray-400 dark:text-gray-500 mt-2'>You&apos;re all caught up!</p>
          </div>
        ) : (
          <div className='space-y-2'>
            {filteredNotifications.map((notification: INotification) => (
              <div
                key={notification._id}
                className={`relative group transition-all hover:bg-gray-50 dark:hover:bg-gray-800 p-3 rounded-lg cursor-pointer border border-gray-200 dark:border-gray-700 ${
                  !notification.readAt ? "bg-blue-50/50 dark:bg-blue-900/20" : ""
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className='flex gap-3'>
                  {notification.actor ? (
                    <div className='w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex-shrink-0 overflow-hidden'>
                      {notification.actor.image ? (
                        <img src={notification.actor.image} alt={notification.actor.name} className='w-full h-full object-cover' />
                      ) : (
                        <div className='w-full h-full flex items-center justify-center text-sm font-medium text-gray-700 dark:text-gray-300'>
                          {notification.actor.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className='w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0'>
                      <BellIcon className='w-4 h-4 text-primary' />
                    </div>
                  )}

                  <div className='flex-1 min-w-0'>
                    <p className='text-sm font-medium text-gray-900 dark:text-white line-clamp-2'>{notification.title}</p>
                    {notification.body && <p className='text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2'>{notification.body}</p>}
                    <div className='flex items-center justify-between mt-2'>
                      <span className='text-xs text-gray-500 dark:text-gray-400'>
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </span>
                      {notification.link && (
                        <a
                          href={notification.link}
                          target='_blank'
                          rel='noopener noreferrer'
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                          className='text-xs text-primary hover:text-primary-dark inline-flex items-center gap-1'
                        >
                          View <ExternalLink className='w-3 h-3' />
                        </a>
                      )}
                    </div>
                  </div>

                  <div className='flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity'>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkRead(notification._id);
                      }}
                      title='Mark as read'
                      disabled={!!notification.readAt}
                      className='p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                    >
                      <Check className='w-4 h-4' />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(notification._id);
                      }}
                      title='Delete'
                      className='p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors text-red-600 dark:text-red-400'
                    >
                      <X className='w-4 h-4' />
                    </button>
                  </div>
                </div>

                {!notification.readAt && <div className='absolute top-3 right-3 w-2 h-2 rounded-full bg-blue-500' />}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {data?.meta && data.meta.total > 0 && (
        <div className='p-4 border-t border-gray-200 dark:border-gray-800'>
          <div className='flex items-center justify-between'>
            <p className='text-sm text-gray-500 dark:text-gray-400'>
              Showing {filteredNotifications.length} of {data.meta.total}
            </p>
            {data.meta.page < data.meta.totalPage && (
              <button
                onClick={handleLoadMore}
                disabled={isLoading}
                className='px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {isLoading ? "Loading..." : "Load more"}
              </button>
            )}
          </div>
        </div>
      )}

      {/* View All Link */}
      <div className='p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50'>
        <Link
          href='/notifications'
          onClick={() => dispatch(closeNotificationDropdown())}
          className='block w-full text-center text-primary hover:text-primary-dark dark:text-primary-light dark:hover:text-primary transition-colors font-medium'
        >
          View all notifications
        </Link>
      </div>
    </div>
  );
};
