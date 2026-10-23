// src/components/MenuBar.tsx
'use client';

import React from 'react';
import { FaBell, FaConnectdevelop, FaUsers } from 'react-icons/fa';
import { IoIosCheckmarkCircle } from 'react-icons/io';
import { TbArrowAutofitContentFilled, TbPremiumRights } from 'react-icons/tb';
import { RiSecurePaymentFill } from 'react-icons/ri';
import { FaFacebookMessenger } from 'react-icons/fa6';
import { MdAnalytics, MdDynamicFeed, MdSlowMotionVideo } from 'react-icons/md';
import { TbUsersGroup } from 'react-icons/tb';
import { useAppSelector, useAppDispatch } from '@/src/redux/hook';
import { useRouter } from 'next/navigation';
import { useUser } from '@/src/hooks/useUser';
import MenubarButton from './menubarButton';
import PremiumModal from '../premiumModal';
import { useDisclosure } from '@nextui-org/modal';
import { setChatPanelOpen } from '@/src/redux/features/message/chatUiSlice';

interface TMenuBarProps {
  className: string;
}

export default function MenuBar({ className }: TMenuBarProps) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { userInfo } = useUser();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const token = useAppSelector((state) => state.auth?.token);

  // Desktop: open the chat list in the right sidebar. Mobile: old /messages page.
  const handleMessagesClick = (e: React.MouseEvent) => {
    if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
      e.preventDefault();
      dispatch(setChatPanelOpen(true));
    }
  };

  if (!token) {
    router.push('/login');
  }

  return (
    <div
      className={`${className} flex flex-row justify-between lg:justify-center lg:flex-col gap-4 overflow-y-auto scrollbar-hide`}
    >
      {userInfo?.role === 'USER' && (
        <>
          {/* Common Menu Items */}
          <MenubarButton
            className="hidden lg:block"
            href="/add-connections"
            title="Add Connection"
            icon={<FaConnectdevelop className="text-[17px] md:text-[20px]" />}
          />
          <MenubarButton
            href="/news-feed/posts"
            title="News Feed"
            icon={<MdDynamicFeed className="text-[17px] md:text-[20px]" />}
          />
          <MenubarButton
            href="/groups"
            title="Groups"
            icon={<TbUsersGroup className="text-[17px] md:text-[20px]" />}
          />
          <MenubarButton
            href="/shorts"
            title="Shorts"
            icon={<MdSlowMotionVideo className="text-[17px] md:text-[20px]" />}
          />
          {userInfo?.verified ? (
            <MenubarButton
              onClick={onOpen}
              href="/news-feed/premium-posts"
              title="Premium Posts"
              icon={<TbPremiumRights className="text-[17px] md:text-[20px]" />}
            />
          ) : (
            <MenubarButton
              onClick={onOpen}
              href="/news-feed/premium-posts"
              title="Get Premium"
              icon={<TbPremiumRights className="text-[17px] md:text-[20px]" />}
            />
          )}
          {/* rest of the MenuBar component */}
          <PremiumModal
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            user={userInfo}
          />
          <MenubarButton
            href="/followers"
            title="Followers"
            icon={<FaUsers className="text-[17px] md:text-[20px]" />}
          />
          <MenubarButton
            href="/following"
            title="Flowing"
            icon={
              <IoIosCheckmarkCircle className="text-[17px] md:text-[20px]" />
            }
          />
          <MenubarButton
            href="/notifications"
            title="Notifications"
            icon={<FaBell className="text-[17px] md:text-[20px]" />}
          />
          <MenubarButton
            href="/messages"
            title="Messages"
            icon={
              <FaFacebookMessenger className="text-[17px] md:text-[20px]" />
            }
            onClick={handleMessagesClick}
          />
        </>
      )}

      {/* Admin-specific Menu Items */}
      {userInfo?.role === 'ADMIN' && (
        <>
          <MenubarButton
            href="/admin-dashboard/analytics"
            title="View Analytics"
            icon={<MdAnalytics className="text-[17px] md:text-[20px]" />}
          />
          <MenubarButton
            href="/admin-dashboard/manage-users"
            title="Manage Users"
            icon={<FaUsers className="text-[17px] md:text-[20px]" />}
          />
          <MenubarButton
            href="/admin-dashboard/manage-content"
            title="Manage Content"
            icon={
              <TbArrowAutofitContentFilled className="text-[17px] md:text-[20px]" />
            }
          />
          <MenubarButton
            href="/admin-dashboard/payments"
            title="Payments"
            icon={
              <RiSecurePaymentFill className="text-[17px] md:text-[20px]" />
            }
          />
          <MenubarButton
            href="/news-feed/posts"
            title="News Feed"
            icon={<MdDynamicFeed className="text-[17px] md:text-[20px]" />}
          />
          <MenubarButton
            href="/groups"
            title="Groups"
            icon={<TbUsersGroup className="text-[17px] md:text-[20px]" />}
          />
          <MenubarButton
            href="/shorts"
            title="Shorts"
            icon={<MdSlowMotionVideo className="text-[17px] md:text-[20px]" />}
          />
          {userInfo?.verified ? (
            <MenubarButton
              className="hidden lg:block"
              href="/news-feed/premium-posts"
              title="Premium Posts"
              icon={<TbPremiumRights className="text-[17px] md:text-[20px]" />}
            />
          ) : (
            <MenubarButton
              className="hidden lg:block"
              onClick={onOpen}
              href="/news-feed/premium-posts"
              title="Get Premium"
              icon={<TbPremiumRights className="text-[17px] md:text-[20px]" />}
            />
          )}
          {/* rest of the MenuBar component */}
          <PremiumModal
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            user={userInfo}
          />
          <MenubarButton
            className="hidden lg:block"
            href="/add-connections"
            title="Add Connection"
            icon={<FaConnectdevelop className="text-[17px] md:text-[20px]" />}
          />
          <MenubarButton
            href="/notifications"
            title="Notifications"
            icon={<FaBell className="text-[17px] md:text-[20px]" />}
          />
          <MenubarButton
            href="/messages"
            title="Messages"
            icon={
              <FaFacebookMessenger className="text-[17px] md:text-[20px]" />
            }
            onClick={handleMessagesClick}
          />
        </>
      )}
    </div>
  );
}
