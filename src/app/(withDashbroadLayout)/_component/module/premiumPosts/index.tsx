'use client';

import React, { useEffect, useState } from 'react';
import { TPost, TUser } from '@/src/types';
import { useGetAllPremiumPostsQuery } from '@/src/redux/features/premiumPost/premiumPostApi';
import PremiumCardSkeleton from '@/src/components/ui/skeleton/premiumCardSkeleton';
import { useUser } from '@/src/hooks/useUser';
import { categoriesList } from '@/src/constants';
import { MdLockReset } from 'react-icons/md';
import InfiniteScroll from 'react-infinite-scroll-component';
import Spinner from '@/src/components/ui/spinner';
import PostDetailsSkeleton from '@/src/components/ui/skeleton/postDetailsSkeleton';
import PremiumPostSuggestionCard from '../dashboardSuggessions/premiumPostSuggestionCard';
import PostModal from '../../modal/postingModal';
import DropdownFilter from '../posts/postFilter/dropdownFilter';
import PostCard from '../posts/postCard/postCard';
import Stories from '../story';

export default function PremiumPosts() {
  const [page, setPage] = useState(1);
  const [posts, setPosts] = useState<TPost[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [filterOption, setFilterOption] = useState<string>('all');
  const [selectedTab, setSelectedTab] = useState<string>('forYou');

  // Current user info
  const { userInfo } = useUser();

  const postParams = {
    page: page.toString(),
    limit: '5',
    ...(selectedCategory && { category: selectedCategory }),
  };

  const {
    data: myPremiumPostsData,
    isLoading: myPremiumPostLoading,
    refetch,
  } = useGetAllPremiumPostsQuery(postParams);

  const myPremiumPosts = myPremiumPostsData?.data as TPost[];
  const postsLength = posts.length;
  const totalPosts = myPremiumPostsData?.meta?.total || 0;

  // Reset posts for selectedCategory
  useEffect(() => {
    setPosts([]);
    setPage(1);
    refetch();
  }, [selectedCategory, refetch]);

  // Append new posts when postData changes
  useEffect(() => {
    if (myPremiumPostsData?.data && myPremiumPostsData.data.length > 0) {
      setPosts((prevPosts) => [...prevPosts, ...myPremiumPostsData.data]);
    }
  }, [myPremiumPostsData]);

  const fetchData = () => {
    setTimeout(() => {
      if (postsLength < totalPosts) {
        setPage((prevPage) => prevPage + 1);
        refetch();
      }
    }, 1000);
  };

  // HasMore for infinite scroll
  const hasMore = postsLength < totalPosts;

  // Filter posts based on selected filter option and tab
  const filteredPosts = () => {
    let filtered = [...posts];

    if (filterOption === 'popular') {
      filtered = filtered
        .filter((post) => post.likes && post.likes.length > 0)
        .sort(
          (a, b) =>
            (b.likes ? b.likes.length : 0) - (a.likes ? a.likes.length : 0)
        );
    }
    if (filterOption === 'poor') {
      filtered = filtered.filter(
        (post) => !post.likes || post.likes.length === 0
      );
    }

    if (selectedTab === 'following') {
      filtered = filtered.filter((post) =>
        userInfo?.following?.includes(post?.user?._id)
      );
    }

    return filtered;
  };

  const skeletonArray = Array.from({ length: 15 });
  const className = 'w-full grid grid-cols-1 md:grid-cols-2 gap-5 mx-auto';

  if (myPremiumPostLoading) {
    return (
      <div>
        {!userInfo?.verified ? (
          <>
            <h2 className="text-medium font-semibold text-default-700 my-3">
              All Premium Posts
            </h2>
            <div className={className}>
              {skeletonArray.map((_, index) => (
                <PremiumCardSkeleton key={index} />
              ))}
            </div>
          </>
        ) : (
          <div className={'w-full flex flex-col'}>
            {skeletonArray.map((_, index) => (
              <PostDetailsSkeleton key={index} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full mx-auto">
      {!userInfo?.verified ? (
        <>
          <h2 className="text-medium font-semibold text-default-700 my-3">
            All Premium Posts
          </h2>
          <div className={className}>
            {myPremiumPosts &&
              myPremiumPosts.map((post) => (
                <PremiumPostSuggestionCard key={post?._id} post={post} />
              ))}
          </div>
        </>
      ) : (
        <div>
          <div
            className={'w-full md:w-[550px] xl:w-[640px] mx-auto md:mx-auto'}
          >
            {/* Post Modal */}
            <div>
              <PostModal userInfo={userInfo as TUser | undefined} />
            </div>

            {/* Stories section */}
            <Stories />

            {/* Category Buttons */}
            <div className="mt-4 mb-6 flex flex-wrap gap-3">
              {categoriesList.map((category) => (
                <button
                  key={category}
                  className={`px-4 text-xs py-1 rounded-full border border-default-200 focus:outline-none ${
                    selectedCategory === category
                      ? 'bg-default-100 text-primaryColor'
                      : 'bg-default-50'
                  } hover:bg-default-100 hover:text-primaryColor hover:transition-colors duration-500`}
                  onClick={() =>
                    setSelectedCategory(
                      category === selectedCategory ? '' : category
                    )
                  }
                >
                  {category}
                </button>
              ))}
              <button
                className="px-4 py-1 rounded-full border border-default-200 bg-default-50 focus:outline-none hover:bg-default-100 hover:text-primaryColor hover:transition-colors duration-500"
                onClick={() => setSelectedCategory('')}
              >
                <MdLockReset />
              </button>
            </div>
            {/* Dropdown for Post Filtering */}
            <DropdownFilter
              filterOption={filterOption}
              setFilterOption={setFilterOption}
            />
            {/* Tabs for For You and Following */}
            <div className="flex my-5 rounded-xl bg-default-100 p-1 gap-6 text-xs w-full">
              <button
                className={`px-4 py-2 rounded-xl
             w-full ${
               selectedTab === 'forYou' ? 'bg-default-50' : 'bg-default-100'
             } transition-colors duration-700 ease-in-out`}
                onClick={() => setSelectedTab('forYou')}
              >
                For You
              </button>
              <button
                className={`px-4 py-2 rounded-xl
             w-full ${
               selectedTab === 'following' ? 'bg-default-50' : 'bg-default-100'
             } transition-colors duration-700 ease-in-out`}
                onClick={() => setSelectedTab('following')}
              >
                Following
              </button>
            </div>

            {/* Tab Content */}
            <InfiniteScroll
              dataLength={postsLength}
              next={fetchData}
              hasMore={hasMore}
              loader={
                <div className="flex items-center justify-center mt-5">
                  <Spinner />
                </div>
              }
              endMessage={
                <p className="text-center text-xs text-sage-500 dark:text-sage-400 my-3">
                  You seen all posts
                </p>
              }
            >
              {/* Render Posts */}
              <div key={selectedTab} className="grid grid-cols-1 gap-5 mt-5">
                {filteredPosts().map((post) => (
                  <PostCard key={post._id} post={post} />
                ))}
              </div>

              {/* Fallback: Skeleton while loading */}
              {myPremiumPostLoading && (
                <div className="flex flex-col">
                  {Array.from({ length: 7 }).map((_, index) => (
                    <PostDetailsSkeleton key={index} />
                  ))}
                </div>
              )}
            </InfiniteScroll>
          </div>
        </div>
      )}
    </div>
  );
}
