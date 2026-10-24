"use client";

import React from "react";
import { motion } from "framer-motion";
import { useFollowMutation, useGetSingleUserQuery, useUnFollowMutation } from "@/src/redux/features/user/userApi";
import { Button } from "@nextui-org/button";
import { useUser } from "@/src/hooks/useUser";
import { FiUserPlus, FiUserCheck } from "react-icons/fi";

interface TFollowProps {
  userId: string;
}

export default function Follow({ userId }: TFollowProps) {
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
      console.error("Follow failed===>", error);
    }
  };

  const unFollowHandler = async () => {
    try {
      await unFollowFn(userId);
    } catch (error) {
      console.error("Unfollow failed===>", error);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.4 }}>
      {exists ? (
        <Button
          radius='full'
          className='bg-sage-600 hover:bg-sage-700 text-white font-medium px-5 w-auto'
          size='sm'
          isLoading={unFollowIsLoading}
          onClick={unFollowHandler}
          disabled={unFollowIsLoading}
          startContent={<FiUserCheck size={14} />}
        >
          Following
        </Button>
      ) : (
        <Button
          radius='full'
          className='bg-sage-600 hover:bg-sage-700 text-white font-medium px-5 w-auto'
          size='sm'
          isLoading={followIsLoading}
          onClick={followHandler}
          disabled={followIsLoading}
          startContent={<FiUserPlus size={14} />}
        >
          Follow
        </Button>
      )}
    </motion.div>
  );
}
