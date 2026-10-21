'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  useFollowMutation,
  useGetSingleUserQuery,
  useUnFollowMutation,
} from '@/src/redux/features/user/userApi';
import { useUser } from '@/src/hooks/useUser';

interface TFollowProps {
  userId: string | undefined;
}

export default function FollowForPost({ userId }: TFollowProps) {
  const [followFn, { isLoading: followIsLoading }] = useFollowMutation();
  const [unFollowFn, { isLoading: unFollowIsLoading }] = useUnFollowMutation();
  const { data: userData } = useGetSingleUserQuery(userId);
  const user = userData?.data;
  const { userInfo: currentUser } = useUser();
  const currentUserId = currentUser?._id;
  const exists = user?.follower?.includes(currentUserId);

  const followHandler = async () => {
    try {
      await followFn(userId);
    } catch (error) {
      console.error('Follow failed===>', error);
    }
  };

  const unFollowHandler = async () => {
    try {
      await unFollowFn(userId);
    } catch (error) {
      console.error('Unfollow failed===>', error);
    }
  };

  return (
    <motion.div
      className="flex gap-4 mt-3 justify-center w-full"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.4 }}
    >
      {exists ? (
        <button
          className="bg-transparent text-sage-600 dark:text-sage-400 text-sm mx-2"
          onClick={unFollowHandler}
          disabled={unFollowIsLoading}
        >
          {unFollowIsLoading ? 'Unfollowing...' : 'Unfollow'}
        </button>
      ) : (
        <button
          className="bg-transparent text-sage-600 dark:text-sage-400 text-sm"
          onClick={followHandler}
          disabled={followIsLoading}
        >
          {followIsLoading ? 'Following...' : 'Follow'}
        </button>
      )}
    </motion.div>
  );
}
