"use client";

import { Bell } from "lucide-react";
import React, { useState } from "react";
import { Badge } from "@nextui-org/badge";
import NavDropdown from "@/src/app/(withCommonLayout)/_component/ui/navbar/navDropdown";
import { useGetUnreadNotificationCountQuery } from "@/src/redux/features/notification/notificationApi";
import NotificationDropdown from "@/src/app/(withDashbroadLayout)/_component/module/notifications/NotificationDropdown";
import { motion } from "framer-motion";

export default function NavRightContent() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { data: unreadCountData, isLoading } = useGetUnreadNotificationCountQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const unreadCount = isLoading || !unreadCountData ? 0 : unreadCountData.data.count;

  const handleBellClick = () => {
    // Check if mobile (you might want to add useMediaQuery hook)
    const isMobile = window.innerWidth <= 768;

    if (isMobile) {
      // On mobile, navigate to the notifications page
      window.location.href = "/notifications";
    } else {
      // On desktop, toggle the dropdown
      setIsDropdownOpen(!isDropdownOpen);
    }
  };

  return (
    <div className='flex items-center justify-center gap-5 relative'>
      <div className='relative'>
        {unreadCount > 0 ? (
          <motion.div
            className='mt-2.5'
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
          >
            <Badge size='sm' color='danger' className='text-[8px]' content={unreadCount > 99 ? "99+" : unreadCount} shape='circle'>
              <button
                type='button'
                onClick={handleBellClick}
                className='p-2 rounded-full hover:bg-default-100 dark:hover:bg-white/10 transition-colors'
                aria-label='Notifications'
              >
                <Bell size={18} />
              </button>
            </Badge>
          </motion.div>
        ) : (
          <button
            type='button'
            onClick={handleBellClick}
            className='p-2 rounded-full hover:bg-default-100 dark:hover:bg-white/10 transition-colors'
            aria-label='Notifications'
          >
            <Bell size={18} />
          </button>
        )}

        {/* Desktop Notification Dropdown */}
        <NotificationDropdown isOpen={isDropdownOpen} onClose={() => setIsDropdownOpen(false)} />
      </div>

      <NavDropdown />
    </div>
  );
}
