'use client';

import React from 'react';
import { Avatar } from '@nextui-org/avatar';
import { motion } from 'framer-motion';
import { TUser } from '@/src/types';
import { useUser } from '@/src/hooks/useUser';
import Link from 'next/link';
import Follow from '../publicProfile/follow';

interface TUserSuggestionCardProps {
  user: TUser;
}

export default function ConnectionsSuggestionCard({
  user,
}: TUserSuggestionCardProps) {
  const { userInfo: currentUser } = useUser();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.7 }}
      className="bg-default-100/70 dark:bg-white/[0.04] border border-borderSubtle rounded-xl p-3 duration-300 ease-in-out hover:border-sage-300/70 dark:hover:border-sage-700/60 transition-colors"
    >
      <div className="flex items-center justify-between gap-3">
        <Link href={`/profile/${user._id}`} className="flex items-center gap-2">
          <Avatar
            alt={user.name}
            className="text-[20px] text-primaryColor"
            name={user.name.charAt(0).toUpperCase()}
            size="md"
            src={user.image}
          />
          <div className="flex-1">
            <h3 className="font-semibold text-sm text-default-900">
              {user.name}
            </h3>
            <p className="text-default-500 text-xs">{user.email}</p>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          {currentUser?.email !== user.email && <Follow userId={user?._id} />}
        </div>
      </div>
    </motion.div>
  );
}
