"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Tab, Tabs } from "@nextui-org/tabs";
import { Avatar } from "@nextui-org/avatar";
import { Button } from "@nextui-org/button";
import { FiUsers, FiUserPlus } from "react-icons/fi";
import { GoVerified } from "react-icons/go";
import Link from "next/link";
import { useFollowersQuery, useFollowingQuery } from "@/src/redux/features/user/userApi";
import { TUser } from "@/src/types";
import Empty from "@/src/components/ui/empty";
import TableSkeleton from "@/src/components/ui/skeleton/tableSkeleton";
import { useUser } from "@/src/hooks/useUser";

interface ConnectionsProps {
  userId: string;
  defaultTab?: "followers" | "following";
}

export default function Connections({ userId, defaultTab = "followers" }: ConnectionsProps) {
  const { userInfo: currentUser } = useUser();
  const { data: followersData, isLoading: followersLoading } = useFollowersQuery(undefined);
  const { data: followingData, isLoading: followingLoading } = useFollowingQuery(undefined);

  const followers = (followersData?.data as TUser[]) || [];
  const following = (followingData?.data as TUser[]) || [];

  const isCurrentUser = currentUser?._id === userId;

  const renderUserCard = (user: TUser) => (
    <motion.div
      key={user._id}
      className='flex items-center justify-between p-4 bg-surface hover:bg-default-50 dark:hover:bg-default-100 rounded-lg border border-borderSubtle transition-colors'
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Link href={`/profile/${user._id}`} className='flex items-center gap-3 flex-1 min-w-0'>
        <Avatar src={user.image} name={user.name?.charAt(0)?.toUpperCase()} className='flex-shrink-0' size='lg' />
        <div className='flex-1 min-w-0'>
          <div className='flex items-center gap-2 mb-1'>
            <h3 className='font-semibold text-textMain truncate'>{user.name}</h3>
            {user.verified && <GoVerified className='text-sage-600 dark:text-sage-400 flex-shrink-0' size={16} />}
          </div>
          {user.bio && <p className='text-sm text-textSecondary line-clamp-2'>{user.bio}</p>}
          {(user.address || user.country) && (
            <p className='text-xs text-textSecondary mt-1'>{[user.address, user.country].filter(Boolean).join(", ")}</p>
          )}
        </div>
      </Link>

      {user._id !== currentUser?._id && (
        <Button
          as={Link}
          href={`/profile/${user._id}`}
          variant='bordered'
          size='sm'
          className='border-sage-600 text-sage-600 dark:border-sage-400 dark:text-sage-400 hover:bg-sage-50 dark:hover:bg-sage-900/20 font-medium ml-3 flex-shrink-0'
        >
          View Profile
        </Button>
      )}
    </motion.div>
  );

  return (
    <motion.div className='w-full' initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <Tabs
        aria-label='Connections'
        variant='underlined'
        defaultSelectedKey={defaultTab}
        classNames={{
          tabList: "gap-6 w-full relative rounded-none p-0 border-b border-borderSubtle",
          cursor: "w-full bg-sage-600 dark:bg-sage-400",
          tab: "max-w-fit px-0 h-12",
          tabContent: "group-data-[selected=true]:text-sage-600 dark:group-data-[selected=true]:text-sage-400 font-semibold",
        }}
      >
        <Tab
          key='followers'
          title={
            <div className='flex items-center gap-2'>
              <FiUsers size={18} />
              <span>Followers</span>
              {followers.length > 0 && (
                <span className='text-xs bg-default-100 dark:bg-default-200 px-2 py-0.5 rounded-full'>{followers.length}</span>
              )}
            </div>
          }
        >
          <div className='mt-6 space-y-3'>
            {followersLoading ? (
              <TableSkeleton />
            ) : followers.length === 0 ? (
              <div className='py-12'>
                <Empty message={isCurrentUser ? "You don't have any followers yet" : "No followers yet"} />
              </div>
            ) : (
              followers.map(renderUserCard)
            )}
          </div>
        </Tab>

        <Tab
          key='following'
          title={
            <div className='flex items-center gap-2'>
              <FiUserPlus size={18} />
              <span>Following</span>
              {following.length > 0 && (
                <span className='text-xs bg-default-100 dark:bg-default-200 px-2 py-0.5 rounded-full'>{following.length}</span>
              )}
            </div>
          }
        >
          <div className='mt-6 space-y-3'>
            {followingLoading ? (
              <TableSkeleton />
            ) : following.length === 0 ? (
              <div className='py-12'>
                <Empty message={isCurrentUser ? "You're not following anyone yet" : "Not following anyone yet"} />
              </div>
            ) : (
              following.map(renderUserCard)
            )}
          </div>
        </Tab>
      </Tabs>
    </motion.div>
  );
}
