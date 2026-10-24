"use client";

import { TUser } from "@/src/types";
import React, { useState, useEffect } from "react";
import { GoVerified } from "react-icons/go";
import { Avatar } from "@nextui-org/avatar";
import { Divider } from "@nextui-org/divider";
import { motion } from "framer-motion";
import { Button } from "@nextui-org/button";
import {
  FiEdit2,
  FiMessageCircle,
  FiMapPin,
  FiGlobe,
  FiUserCheck,
  FiMoreHorizontal,
  FiUsers,
  FiSettings,
  FiLock,
  FiShare2,
  FiFlag,
} from "react-icons/fi";
import UserProfileTabs from "./userProfileTabs";
import { useUser } from "@/src/hooks/useUser";
import Follow from "./follow";
import VerifiedForPayment from "../userProfile/VerifiedForPayment.tsx";
import { ActiveAvatar } from "@/src/app/(withCommonLayout)/_component/ui/navbar/activeAvatar";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { MdArrowBack } from "react-icons/md";
import { useCreateChatMutation } from "@/src/redux/features/message/chatApi";
import { toast } from "sonner";

interface TUserProps {
  user: TUser | undefined;
  isOwnProfile?: boolean;
}

export default function Profile({ user, isOwnProfile }: TUserProps) {
  const router = useRouter();
  const { userInfo: currentUser } = useUser();
  const [isFollowing, setIsFollowing] = useState(false);
  const [isMutualConnection, setIsMutualConnection] = useState(false);
  const [createChatFn, { isLoading: creatingChat }] = useCreateChatMutation();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    if (user && currentUser) {
      setIsFollowing(user.follower?.includes(currentUser._id as string) || false);
      const userFollowsMe = currentUser.follower?.includes(user._id as string) || false;
      const iFollow = currentUser.following?.includes(user._id as string) || false;

      setIsMutualConnection(userFollowsMe && iFollow);
    }
  }, [user, currentUser]);

  const handleMessageClick = async () => {
    if (!user?._id) return;

    try {
      const res = await createChatFn({ user: user._id }).unwrap();

      if (res?.success) {
        const newChat = res?.data;

        toast.success("Opening conversation...");

        // Navigate to messages
        if (typeof window !== "undefined" && window.innerWidth < 1024) {
          router.push(`/messages/${newChat._id}`);
        } else {
          router.push(`/messages/${newChat._id}`);
        }
      }
    } catch (error) {
      toast.error("Failed to start conversation");
    }
  };

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
      className='w-full min-h-screen bg-background'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header Bar - Mobile Optimized */}
      <div className='sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b border-borderSubtle'>
        <div className='w-full px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between'>
          <button
            onClick={() => router.back()}
            className='flex items-center gap-1 sm:gap-2 p-1.5 sm:p-2 hover:bg-sage-50 dark:hover:bg-default-100 rounded-lg transition-colors'
          >
            <MdArrowBack size={18} className='sm:size-5 text-textMain' />
            <span className='text-sm font-medium text-textMain hidden sm:inline'>Back</span>
          </button>

          <div className='flex items-center gap-2'>
            {!isCurrentUser && isMutualConnection && (
              <span className='hidden sm:flex items-center gap-1.5 text-xs font-medium text-sage-600 dark:text-sage-400 bg-sage-50 dark:bg-sage-900/20 px-3 py-1.5 rounded-full'>
                <FiUsers size={14} />
                Connected
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Content - Mobile Responsive */}
      <div className='w-full px-3 sm:px-4 py-2 sm:py-3 max-w-2xl mx-auto'>
        {/* Main Profile Card - Mobile Optimized */}
        <motion.div
          className='bg-default-100/60 dark:bg-white/[0.03] border border-borderSubtle rounded-xl sm:rounded-2xl overflow-visible w-full relative'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          {/* Cover Photo with Shadow - Mobile Optimized */}
          <motion.div
            className='relative rounded-t-xl sm:rounded-t-2xl overflow-hidden w-full'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className='relative h-28 sm:h-36 md:h-40 w-full bg-default-200 overflow-hidden'>
              {coverImage ? (
                <Image src={coverImage} alt='Profile Cover' fill className='object-cover w-full h-full' priority />
              ) : (
                <div className='w-full h-full bg-gradient-to-br from-sage-300 via-sage-400 to-sage-500 dark:from-sage-700 dark:via-sage-600 dark:to-sage-500' />
              )}
              {/* Shadow overlay for better visibility */}
              <div className='absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent' />
            </div>
          </motion.div>

          {/* Profile Image - Mobile Optimized */}
          <div className='relative px-3 sm:px-4 md:px-6'>
            <motion.div
              className='absolute -top-4 sm:-top-5 md:-top-6 left-3 sm:left-4 md:left-6 flex-shrink-0 z-10'
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              {image ? (
                <Avatar
                  src={image}
                  className='w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 text-lg border-3 sm:border-4 border-surface dark:border-default-100 shadow-lg sm:shadow-xl ring-1 sm:ring-2 ring-sage-600 dark:ring-sage-400'
                />
              ) : (
                <ActiveAvatar
                  name={name?.charAt(0)?.toUpperCase()}
                  size='lg'
                  userId={_id as string}
                  className='w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 text-xl sm:text-2xl border-3 sm:border-4 border-surface dark:border-default-100 shadow-lg sm:shadow-xl ring-1 sm:ring-2 ring-sage-600 dark:ring-sage-400'
                />
              )}
            </motion.div>
          </div>

          {/* Profile Content Section - Mobile Optimized */}
          <div className='px-3 sm:px-4 md:px-6 pt-2 sm:pt-3 pb-4 sm:pb-6 w-full overflow-hidden'>
            <div className='flex items-start gap-3 sm:gap-4 md:gap-5 w-full'>
              {/* Avatar Spacer for Mobile */}
              <div className='w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 flex-shrink-0' />

              {/* Name and Buttons Section - Mobile Compact */}
              <div className='flex-1 flex flex-col sm:flex-row gap-2 sm:gap-3 w-full justify-between'>
                <div className='flex-1 flex flex-col gap-1.5 sm:gap-2 w-full min-w-0'>
                  {/* Name with Verified Badge - Mobile Optimized */}
                  <div className='flex items-start sm:items-center justify-between w-full gap-2'>
                    <div className='flex-1 min-w-0'>
                      <div className='flex items-center gap-1.5'>
                        <h1 className='text-base sm:text-lg md:text-xl font-bold text-textMain truncate'>{name}</h1>
                        {verified && <GoVerified className='text-sage-600 dark:text-sage-400 flex-shrink-0 size-3.5 sm:size-4' />}
                      </div>

                      {/* Bio - Mobile Compact */}
                      {bio && (
                        <motion.p
                          className='text-xs sm:text-sm text-textSecondary leading-relaxed line-clamp-2 mt-1'
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.4, delay: 0.35 }}
                        >
                          {bio}
                        </motion.p>
                      )}
                    </div>

                    {/* Three-dot menu - Mobile Position */}
                    <div className='relative'>
                      <Button
                        isIconOnly
                        radius='full'
                        variant='light'
                        className='text-textMain hover:bg-sage-50 dark:hover:bg-default-100 flex-shrink-0'
                        size='sm'
                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                      >
                        <FiMoreHorizontal size={16} className='sm:size-5' />
                      </Button>
                      {showProfileMenu && (
                        <div className='absolute right-0 top-full mt-2 bg-background border border-borderSubtle rounded-lg shadow-lg z-50 min-w-48'>
                          {isCurrentUser ? (
                            <>
                              <Link href='/profile/edit' className='block'>
                                <Button
                                  variant='light'
                                  className='w-full justify-start text-textMain hover:bg-sage-50 dark:hover:bg-default-100 rounded-none'
                                  startContent={<FiEdit2 size={16} />}
                                >
                                  Edit Profile
                                </Button>
                              </Link>
                              <Link href='/profile/settings' className='block'>
                                <Button
                                  variant='light'
                                  className='w-full justify-start text-textMain hover:bg-sage-50 dark:hover:bg-default-100 rounded-none'
                                  startContent={<FiSettings size={16} />}
                                >
                                  Settings
                                </Button>
                              </Link>
                              <Link href='/settings/privacy' className='block'>
                                <Button
                                  variant='light'
                                  className='w-full justify-start text-textMain hover:bg-sage-50 dark:hover:bg-default-100 rounded-none'
                                  startContent={<FiLock size={16} />}
                                >
                                  Privacy & Safety
                                </Button>
                              </Link>
                            </>
                          ) : (
                            <>
                              <Button
                                variant='light'
                                className='w-full justify-start text-textMain hover:bg-sage-50 dark:hover:bg-default-100 rounded-none'
                                startContent={<FiShare2 size={16} />}
                              >
                                Share profile
                              </Button>
                              <Button
                                variant='light'
                                className='w-full justify-start text-danger hover:bg-red-50/50 dark:hover:bg-red-900/20 rounded-none'
                                startContent={<FiFlag size={16} />}
                              >
                                Report user
                              </Button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Location Info - Mobile Compact */}
                  {(address || country) && (
                    <motion.div
                      className='flex flex-wrap gap-1.5 sm:gap-2 md:gap-3 text-xs sm:text-sm text-textSecondary'
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.4, delay: 0.4 }}
                    >
                      {address && (
                        <div className='flex items-center gap-1 truncate max-w-full'>
                          <FiMapPin size={10} className='sm:size-3 text-sage-600 dark:text-sage-400 flex-shrink-0' />
                          <span className='truncate'>{address}</span>
                        </div>
                      )}
                      {country && (
                        <div className='flex items-center gap-1 truncate max-w-full'>
                          <FiGlobe size={10} className='sm:size-3 text-sage-600 dark:text-sage-400 flex-shrink-0' />
                          <span className='truncate'>{country}</span>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* Action Buttons - Mobile Compact */}
                  <motion.div
                    className='flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2'
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.45 }}
                  >
                    {isCurrentUser ? (
                      <div className='flex items-center gap-1.5 sm:gap-2'>
                        <Link href='/profile/edit' className='flex-1 sm:flex-none'>
                          <Button className='bg-sage-600 hover:bg-sage-700 text-white font-medium w-full sm:w-auto' size='sm'>
                            <FiEdit2 size={14} className='sm:mr-1' />
                            <span className='hidden sm:inline'>Edit</span>
                          </Button>
                        </Link>
                        <Link href='/profile/settings' className='flex-1 sm:flex-none'>
                          <Button className='bg-sage-600 hover:bg-sage-700 text-white font-medium w-full sm:w-auto' size='sm'>
                            <span className='text-xs sm:text-sm'>Settings</span>
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      <div className='flex items-center gap-1.5 sm:gap-2'>
                        {isFollowing ? (
                          <Button
                            radius='full'
                            className='bg-sage-600 hover:bg-sage-700 text-white font-medium flex-1 sm:flex-none'
                            size='sm'
                            startContent={<FiUserCheck size={14} />}
                          >
                            <span className='text-xs sm:text-sm'>Following</span>
                          </Button>
                        ) : (
                          <Follow userId={_id as string} />
                        )}
                        <Button
                          radius='full'
                          className='border-sage-600 text-sage-600 dark:border-sage-400 dark:text-sage-400 hover:bg-sage-50 dark:hover:bg-sage-900/20 font-medium flex-1 sm:flex-none'
                          variant='bordered'
                          size='sm'
                          startContent={<FiMessageCircle size={14} />}
                          onClick={handleMessageClick}
                          isLoading={creatingChat}
                        >
                          <span className='text-xs sm:text-sm'>Message</span>
                        </Button>
                      </div>
                    )}
                  </motion.div>
                </div>
              </div>
            </div>

            {/* Connection Stats - Mobile Optimized */}
            <motion.div
              className='flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm font-medium pt-3 sm:pt-4 border-t border-borderSubtle'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.5 }}
            >
              <Link href={`/profile/${_id}/connections`} className='text-textMain hover:text-sage-600 hover:underline transition-colors'>
                {follower?.length || 0} <span className='font-normal text-textSecondary'>followers</span>
              </Link>
              <span className='text-textSecondary'>·</span>
              <Link href={`/profile/${_id}/connections`} className='text-textMain hover:text-sage-600 hover:underline transition-colors'>
                {following?.length || 0} <span className='font-normal text-textSecondary'>following</span>
              </Link>
              {isMutualConnection && (
                <>
                  <span className='text-textSecondary'>·</span>
                  <span className='text-sage-600 dark:text-sage-400 text-xs sm:text-sm'>Connected</span>
                </>
              )}
            </motion.div>

            {!verified && user.email === currentUser?.email && (
              <>
                <Divider className='my-4 sm:my-6' />
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 0.5 }}>
                  <VerifiedForPayment user={user} />
                </motion.div>
              </>
            )}
          </div>
        </motion.div>

        {/* Activity Section - Mobile Optimized */}
        <motion.div
          className='mt-3 sm:mt-4 bg-default-100/60 dark:bg-white/[0.03] border border-borderSubtle rounded-xl sm:rounded-2xl overflow-hidden'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <div className='px-3 sm:px-4 md:px-6 py-4 sm:py-6'>
            <h2 className='text-base sm:text-lg md:text-xl font-bold text-textMain mb-3 sm:mb-4'>Activity</h2>
            <UserProfileTabs userId={_id as string} />
          </div>
        </motion.div>

        {/* Footer Spacing */}
        <div className='mt-8 sm:mt-12' />
      </div>
    </motion.div>
  );
}
