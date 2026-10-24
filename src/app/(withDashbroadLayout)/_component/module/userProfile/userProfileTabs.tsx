import React, { useState } from 'react';
import {
  useGetMyPostsQuery,
  useGetMyPremiumPostsQuery,
} from '@/src/redux/features/post/postApi';
import { TPost } from '@/src/types';
import { Tab, Tabs } from '@nextui-org/tabs';
import { motion } from 'framer-motion';
import PostCard from '../posts/postCard/postCard';
import Empty from '@/src/components/ui/empty';
import { useGetAllPremiumPostsQuery } from '@/src/redux/features/premiumPost/premiumPostApi';
import { PiCrownSimpleDuotone } from 'react-icons/pi';
import { useUser } from '@/src/hooks/useUser';
import TableSkeleton from '@/src/components/ui/skeleton/tableSkeleton';
import PostDetailsSkeleton from '@/src/components/ui/skeleton/postDetailsSkeleton';
import MyDashboard from './myDashboard';

export default function UserProfileTabs() {
  const {
    data: myPostsData,
    isFetching: isFetchingMyPosts,
    isLoading: myPostLoading,
  } = useGetMyPostsQuery({ sort: 'createdAt' });
  const myPosts = myPostsData?.data as TPost[];

  const {
    data: myPremiumPostsData,
    isFetching: isFetchingMyPremiumPosts,
    isLoading: myPremiumPostLoading,
  } = useGetMyPremiumPostsQuery({ sort: 'createdAt' });
  const myPremiumPosts = myPremiumPostsData?.data as TPost[];

  const {
    data: allPremiumPostsData,
    isFetching: isFetchingAllPremiumPosts,
    isLoading: allPremiumPostLoading,
  } = useGetAllPremiumPostsQuery({ sort: 'createdAt' });
  const allPremiumPosts = allPremiumPostsData?.data as TPost[];

  const { userInfo } = useUser();

  return (
    <motion.div
      className="flex flex-col w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.4, duration: 0.4 }}
    >
      <Tabs
        aria-label="Options"
        className="w-full md:w-[550px] xl:w-[640px] mx-auto "
      >
        <Tab key="posts" className="w-full" title="Posts">
          {myPosts?.length === 0 ? (
            <Empty message="There are no posts available" />
          ) : (
            <motion.div className="grid grid-cols-1 gap-5">
              {isFetchingMyPosts || myPostLoading ? (
                <div className="flex justify-center">
                  <PostDetailsSkeleton />
                </div>
              ) : (
                myPosts?.map((post) => <PostCard key={post._id} post={post} />)
              )}
            </motion.div>
          )}
        </Tab>
        <Tab key="my-premium-posts" className="w-full" title="Premium Posts">
          {myPremiumPosts?.length === 0 ? (
            <Empty message="There are no premium posts available" />
          ) : (
            <motion.div className="grid grid-cols-1 gap-5">
              {isFetchingMyPremiumPosts || myPremiumPostLoading ? (
                <div className="flex justify-center">
                  {' '}
                  <TableSkeleton />
                </div>
              ) : (
                myPremiumPosts?.map((post) => (
                  <PostCard key={post._id} post={post} />
                ))
              )}
            </motion.div>
          )}
        </Tab>
        <Tab
          key="my-subscribed-posts"
          className="w-full"
          title={
            <div className="flex items-center gap-1">
              Subscribed{' '}
              <PiCrownSimpleDuotone className="text-yellow-500" size={14} />
            </div>
          }
        >
          {userInfo?.verified ? (
            <motion.div className="grid grid-cols-1 gap-5">
              {allPremiumPosts?.length === 0 ? (
                <Empty message="There are no subscribed posts available" />
              ) : (
                <div>
                  {isFetchingAllPremiumPosts || allPremiumPostLoading ? (
                    <div className="flex justify-center">
                      {' '}
                      <TableSkeleton />
                    </div>
                  ) : (
                    allPremiumPosts?.map((post) => (
                      <PostCard key={post._id} post={post} />
                    ))
                  )}
                </div>
              )}
            </motion.div>
          ) : (
            <Empty message="Get likes and verify your account" />
          )}
        </Tab>
        {/* Dashboard */}
        <Tab key="dashboard" className="w-full" title="Dashboard">
          <motion.div className="grid grid-cols-1 gap-5">
            {/* Add Dashboard content */}
            <MyDashboard />
          </motion.div>
        </Tab>
      </Tabs>
    </motion.div>
  );
}
