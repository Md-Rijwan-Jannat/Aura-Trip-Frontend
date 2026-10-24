"use client";

import { TPost } from "@/src/types";
import { Tab, Tabs } from "@nextui-org/tabs";
import { motion } from "framer-motion";
import React, { useState } from "react";
import PostCard from "../posts/postCard/postCard";
import { useGetSingleUserPostsQuery } from "@/src/redux/features/user/userApi";
import Empty from "@/src/components/ui/empty";
import InfiniteScrollContainer from "@/src/components/ui/infiniteScrollerContainer";
import TableSkeleton from "@/src/components/ui/skeleton/tableSkeleton";
import { useUser } from "@/src/hooks/useUser";
import { FiFileText, FiImage, FiVideo, FiHeart } from "react-icons/fi";

interface TUserProfileTabsProps {
  userId: string;
}

export default function UserProfileTabs({ userId }: TUserProfileTabsProps) {
  const [page, setPage] = useState(1);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const { userInfo: currentUser } = useUser();
  const { data: myPostsData, isLoading: myPostLoading } = useGetSingleUserPostsQuery(userId);
  const myPosts = myPostsData?.data as TPost[];

  const isCurrentUser = currentUser?._id === userId;

  const loadMorePosts = async () => {
    if (!isFetchingMore) {
      setIsFetchingMore(true);
      setPage((prevPage) => prevPage + 1);
      setIsFetchingMore(false);
    }
  };

  // Filter posts by media content
  const postsWithImages = myPosts?.filter((post) => post.images && post.images.length > 0);
  const postsWithoutImages = myPosts?.filter((post) => !post.images || post.images.length === 0);

  return (
    <motion.div
      className='flex flex-col w-full'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2, duration: 0.4 }}
    >
      <Tabs
        aria-label='Profile sections'
        variant='underlined'
        classNames={{
          tabList: "gap-6 w-full relative rounded-none p-0 border-b border-borderSubtle",
          cursor: "w-full bg-sage-600 dark:bg-sage-400",
          tab: "max-w-fit px-0 h-12",
          tabContent: "group-data-[selected=true]:text-sage-600 dark:group-data-[selected=true]:text-sage-400 font-semibold",
        }}
      >
        <Tab
          key='posts'
          title={
            <div className='flex items-center gap-2'>
              <FiFileText size={18} />
              <span>Posts</span>
              {myPosts?.length > 0 && (
                <span className='text-xs bg-default-100 dark:bg-default-200 px-2 py-0.5 rounded-full'>{myPosts.length}</span>
              )}
            </div>
          }
        >
          <InfiniteScrollContainer isFetchingMore={isFetchingMore} onBottomReached={loadMorePosts}>
            {myPostLoading ? (
              <div className='flex justify-center py-8'>
                <TableSkeleton />
              </div>
            ) : !myPosts?.length ? (
              <div className='py-12'>
                <Empty message={isCurrentUser ? "You haven't posted anything yet" : "No posts available"} />
              </div>
            ) : (
              <motion.div className='grid grid-cols-1 gap-5 mt-6'>
                {myPosts.map((post) => (
                  <PostCard key={post._id} post={post} />
                ))}
              </motion.div>
            )}
          </InfiniteScrollContainer>
        </Tab>

        <Tab
          key='media'
          title={
            <div className='flex items-center gap-2'>
              <FiImage size={18} />
              <span>Media</span>
              {postsWithImages?.length > 0 && (
                <span className='text-xs bg-default-100 dark:bg-default-200 px-2 py-0.5 rounded-full'>{postsWithImages.length}</span>
              )}
            </div>
          }
        >
          <motion.div className='mt-6'>
            {myPostLoading ? (
              <div className='flex justify-center py-8'>
                <TableSkeleton />
              </div>
            ) : !postsWithImages?.length ? (
              <div className='py-12'>
                <Empty message={isCurrentUser ? "You haven't posted any media yet" : "No media posts available"} />
              </div>
            ) : (
              <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
                {postsWithImages.map((post) => (
                  <motion.div
                    key={post._id}
                    className='aspect-square rounded-lg overflow-hidden cursor-pointer group relative border border-borderSubtle hover:border-sage-400 transition-all'
                    whileHover={{ scale: 1.02 }}
                  >
                    {post.images && post.images[0] && (
                      <>
                        <img
                          src={post.images[0]}
                          alt={post.title}
                          className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-300'
                        />
                        <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
                          <div className='absolute bottom-0 left-0 right-0 p-3'>
                            <p className='text-white text-sm font-medium line-clamp-2'>{post.title}</p>
                            {post.images.length > 1 && (
                              <div className='flex items-center gap-1 mt-1 text-white/90 text-xs'>
                                <FiImage size={12} />
                                <span>{post.images.length} images</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </Tab>

        <Tab
          key='about'
          title={
            <div className='flex items-center gap-2'>
              <FiHeart size={18} />
              <span>About</span>
            </div>
          }
        >
          <motion.div className='py-6 space-y-4'>
            <div className='bg-default-50 dark:bg-default-100/50 rounded-lg p-6'>
              <h3 className='text-lg font-bold text-textMain mb-4'>Profile Stats</h3>
              <div className='grid grid-cols-2 sm:grid-cols-3 gap-4'>
                <div className='text-center sm:text-left'>
                  <p className='text-2xl font-bold text-sage-600 dark:text-sage-400'>{myPosts?.length || 0}</p>
                  <p className='text-sm text-textSecondary'>Posts</p>
                </div>
                <div className='text-center sm:text-left'>
                  <p className='text-2xl font-bold text-sage-600 dark:text-sage-400'>{postsWithImages?.length || 0}</p>
                  <p className='text-sm text-textSecondary'>Media Posts</p>
                </div>
                <div className='text-center sm:text-left'>
                  <p className='text-2xl font-bold text-sage-600 dark:text-sage-400'>
                    {myPosts?.reduce((acc, post) => acc + (post.likes?.length || 0), 0) || 0}
                  </p>
                  <p className='text-sm text-textSecondary'>Total Reactions</p>
                </div>
              </div>
            </div>

            {!isCurrentUser && (
              <div className='bg-default-50 dark:bg-default-100/50 rounded-lg p-6'>
                <p className='text-sm text-textSecondary'>Additional profile information and travel preferences coming soon.</p>
              </div>
            )}
          </motion.div>
        </Tab>
      </Tabs>
    </motion.div>
  );
}
