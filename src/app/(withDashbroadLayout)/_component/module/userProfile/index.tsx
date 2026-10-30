"use client";

import React, { useState, useEffect } from "react";
import { TUser } from "@/src/types";
import { useUser } from "@/src/hooks/useUser";
import { motion } from "framer-motion";
import { Button } from "@nextui-org/button";
import { Divider } from "@nextui-org/divider";
import { Avatar } from "@nextui-org/avatar";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiEdit2, FiMessageCircle, FiPhoneCall, FiMapPin, FiGlobe, FiUserCheck, FiUserPlus } from "react-icons/fi";
import { GoVerified } from "react-icons/go";
import { MdArrowBack } from "react-icons/md";
import { ActiveAvatar } from "@/src/app/(withCommonLayout)/_component/ui/navbar/activeAvatar";
import Follow from "./follow";
import UserProfileTabs from "./userProfileTabs";

interface ILinkedInStyleProfileProps {
  user: TUser | undefined;
  isOwnProfile?: boolean;
}

export default function LinkedInStyleProfile({ user, isOwnProfile }: ILinkedInStyleProfileProps) {
  const router = useRouter();
  const { userInfo: currentUser } = useUser();
  const [isFollowing, setIsFollowing] = useState(false);
  const [isMutualConnection, setIsMutualConnection] = useState(false);

  useEffect(() => {
    if (user && currentUser) {
      setIsFollowing(user.follower?.includes(currentUser._id as string) || false);
      const userFollowsMe = currentUser.follower?.includes(user._id as string) || false;
      const iFollow = currentUser.following?.includes(user._id as string) || false;

      setIsMutualConnection(userFollowsMe && iFollow);
    }
  }, [user, currentUser]);

  if (!user) {
    return (
      <div className='w-full flex items-center justify-center min-h-screen'>
        <p className='text-center text-default-500'>User not found.</p>
      </div>
    );
  }

  const { _id, email, name, image, bio, follower, following, verified, country, address, coverImage } = user as TUser;

  const isCurrentUser = currentUser?.email === email;

  return (
    <motion.div
      className='w-full min-h-screen bg-gradient-to-b from-sage-50/50 to-transparent dark:from-default-50/50'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header Bar */}
      <div className='sticky top-0 z-40 bg-white/80 dark:bg-default-100/80 backdrop-blur-md border-b border-sage-200 dark:border-default-200'>
        <div className='max-w-4xl mx-auto px-4 py-3 flex items-center justify-between'>
          <button
            onClick={() => router.back()}
            className='flex items-center gap-2 p-1 hover:bg-sage-100 dark:hover:bg-default-200 rounded-lg transition-colors'
          >
            <MdArrowBack size={20} className='text-default-700 dark:text-default-300' />
            <span className='text-xs font-medium text-default-700 dark:text-default-300'>Back</span>
          </button>

          {isCurrentUser && (
            <Link href='/profile/edit'>
              <Button isIconOnly className='bg-sage-600 hover:bg-sage-700 text-white' size='sm'>
                <FiEdit2 size={18} />
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className='max-w-4xl mx-auto px-4 py-6'>
        {/* Cover Photo Section */}
        <motion.div
          className='relative h-48 sm:h-64 md:h-80 rounded-xl overflow-hidden shadow-lg mb-8'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          whileHover={{ scale: 1.01 }}
        >
          {coverImage ? (
            <Image src={coverImage} alt='Profile Cover' fill className='object-cover w-full h-full' priority />
          ) : (
            <div className='w-full h-full bg-gradient-to-r from-sage-400 via-sage-500 to-sage-600 dark:from-default-400 dark:via-default-500 dark:to-default-600' />
          )}
          {/* Overlay gradient for depth */}
          <div className='absolute inset-0 bg-gradient-to-t from-black/20 to-transparent' />
        </motion.div>

        {/* Profile Card Section */}
        <motion.div
          className='bg-white dark:bg-default-100 rounded-xl shadow-xl border border-sage-100 dark:border-default-200 overflow-hidden'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          {/* Profile Header with Avatar */}
          <div className='px-6 sm:px-8 py-8 pb-4'>
            <div className='flex flex-col sm:flex-row sm:items-start gap-6'>
              {/* Avatar Section */}
              <motion.div
                className='flex-shrink-0'
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                {image ? (
                  <Avatar src={image} className='w-32 h-32 text-lg border-4 border-white dark:border-default-100 shadow-lg' />
                ) : (
                  <ActiveAvatar
                    name={name?.charAt(0)?.toUpperCase()}
                    size='lg'
                    userId={_id as string}
                    className='w-32 h-32 text-3xl border-4 border-white dark:border-default-100 shadow-lg'
                  />
                )}
              </motion.div>

              {/* User Info Section */}
              <div className='flex-1'>
                {/* Name and Verification */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}>
                  <div className='flex items-center gap-3 flex-wrap mb-2'>
                    <h1 className='text-2xl sm:text-3xl font-bold text-default-900 dark:text-default-100'>{name}</h1>
                    {verified && (
                      <div className='flex items-center gap-1 bg-sage-100 dark:bg-sage-900/30 px-3 py-1 rounded-full'>
                        <GoVerified className='text-sage-600 dark:text-sage-400' size={16} />
                        <span className='text-xs font-semibold text-sage-700 dark:text-sage-300'>Verified</span>
                      </div>
                    )}
                  </div>

                  {/* Bio */}
                  {bio && <p className='text-sm text-default-600 dark:text-default-400 mb-3 max-w-md'>{bio}</p>}

                  {/* Location Info */}
                  <div className='flex flex-wrap gap-3 mb-4'>
                    {address && (
                      <div className='flex items-center gap-1.5 text-xs text-default-500 dark:text-default-400'>
                        <FiMapPin size={14} className='text-sage-600 dark:text-sage-400' />
                        <span>{address}</span>
                      </div>
                    )}
                    {country && (
                      <div className='flex items-center gap-1.5 text-xs text-default-500 dark:text-default-400'>
                        <FiGlobe size={14} className='text-sage-600 dark:text-sage-400' />
                        <span>{country}</span>
                      </div>
                    )}
                  </div>
                </motion.div>

                {/* Stats Section */}
                <motion.div
                  className='flex gap-6 mb-6'
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                >
                  <div className='text-center sm:text-left'>
                    <p className='text-lg sm:text-xl font-bold text-sage-600 dark:text-sage-400'>{follower?.length || 0}</p>
                    <p className='text-xs text-default-500 dark:text-default-400'>Followers</p>
                  </div>
                  <Divider orientation='vertical' />
                  <div className='text-center sm:text-left'>
                    <p className='text-lg sm:text-xl font-bold text-sage-600 dark:text-sage-400'>{following?.length || 0}</p>
                    <p className='text-xs text-default-500 dark:text-default-400'>Following</p>
                  </div>
                </motion.div>

                {/* Action Buttons */}
                <motion.div
                  className='flex flex-wrap gap-3'
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.4 }}
                >
                  {isCurrentUser ? (
                    <>
                      <Link href='/profile/edit' className='flex-1 sm:flex-initial'>
                        <Button
                          className='w-full sm:w-auto bg-sage-600 hover:bg-sage-700 text-white font-semibold'
                          startContent={<FiEdit2 size={16} />}
                        >
                          Edit Profile
                        </Button>
                      </Link>
                      <Link href='/messages' className='flex-1 sm:flex-initial'>
                        <Button
                          variant='bordered'
                          className='w-full sm:w-auto border-sage-600 text-sage-600 dark:border-sage-400 dark:text-sage-400 hover:bg-sage-50 dark:hover:bg-sage-900/20 font-semibold'
                          startContent={<FiMessageCircle size={16} />}
                        >
                          Messages
                        </Button>
                      </Link>
                    </>
                  ) : (
                    <>
                      {isFollowing ? (
                        <Button
                          className='flex-1 sm:flex-initial bg-sage-100 hover:bg-sage-200 text-sage-700 dark:bg-sage-900/30 dark:hover:bg-sage-900/50 dark:text-sage-300 font-semibold'
                          startContent={<FiUserCheck size={16} />}
                        >
                          Following
                        </Button>
                      ) : (
                        <Follow userId={_id as string} onFollowChange={setIsFollowing} />
                      )}
                      <Button
                        variant='bordered'
                        className='flex-1 sm:flex-initial border-sage-600 text-sage-600 dark:border-sage-400 dark:text-sage-400 hover:bg-sage-50 dark:hover:bg-sage-900/20 font-semibold'
                        startContent={<FiMessageCircle size={16} />}
                      >
                        Message
                      </Button>
                    </>
                  )}
                </motion.div>
              </div>
            </div>

            <Divider className='my-6' />

            {/* About Section */}
            {bio && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 0.3 }}>
                <h2 className='text-lg font-bold text-default-900 dark:text-default-100 mb-3'>About</h2>
                <p className='text-sm text-default-600 dark:text-default-400 leading-relaxed'>{bio}</p>
              </motion.div>
            )}
          </div>

          {/* Profile Tabs Section */}
          <Divider />
          <div className='px-6 sm:px-8 py-6'>
            <UserProfileTabs userId={_id as string} />
          </div>
        </motion.div>

        {/* Footer Spacing */}
        <div className='mt-12' />
      </div>
    </motion.div>
  );
}
