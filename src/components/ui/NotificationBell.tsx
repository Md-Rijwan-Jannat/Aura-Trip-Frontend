"use client";

import React, { useRef, useEffect } from "react";
import { Badge } from "@nextui-org/badge";
import { BellIcon } from "lucide-react";
import { useAppSelector, useAppDispatch } from "@/src/redux/hook";
import {
  selectUnreadCount,
  selectIsNotificationOpen,
  toggleNotificationDropdown,
  closeNotificationDropdown,
} from "@/src/redux/features/notification/notificationSlice";
import { NotificationDropdown } from "./NotificationDropdown";

export const NotificationBell: React.FC = () => {
  const unreadCount = useAppSelector(selectUnreadCount);
  const isOpen = useAppSelector(selectIsNotificationOpen);
  const dispatch = useAppDispatch();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleToggle = () => {
    dispatch(toggleNotificationDropdown());
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        dispatch(closeNotificationDropdown());
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, dispatch]);

  return (
    <div className='relative' ref={dropdownRef}>
      <button
        onClick={handleToggle}
        className='relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-primary'
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
      >
        <Badge content={unreadCount > 99 ? "99+" : unreadCount} color='danger' isInvisible={unreadCount === 0} shape='circle' size='sm'>
          <BellIcon className='w-6 h-6 text-gray-700 dark:text-gray-300' />
        </Badge>
      </button>

      {isOpen && <NotificationDropdown />}
    </div>
  );
};
