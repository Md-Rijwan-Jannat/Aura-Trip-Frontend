'use client';

import React, { useState } from 'react';
import PremiumPostSuggestionCard from './premiumPostSuggestionCard';
import { useGetAllPremiumPostsQuery } from '@/src/redux/features/premiumPost/premiumPostApi';
import { TPost } from '@/src/types';
import PremiumSkeleton from '@/src/components/ui/skeleton/premiumSkeleton';
import Link from 'next/link';

export default function PremiumPostsSuggestions() {
  const { data: premiumPostData, isLoading } =
    useGetAllPremiumPostsQuery(undefined);
  const posts = premiumPostData?.data as TPost[];

  return (
    <div>
      <h2 className="text-[16px] text-default-700">Get Premium Posts</h2>

      <div className="grid grid-cols-1 gap-5 mt-5 overflow-y-auto">
        {isLoading && <PremiumSkeleton />}
        {posts &&
          posts
            .slice(0, 4)
            .map((post) => (
              <PremiumPostSuggestionCard key={post?._id} post={post} />
            ))}
      </div>

      {/* Load More Link */}
      {posts && posts.length > 4 && (
        <div className="mt-5 flex justify-start">
          <Link
            href={'/news-feed/premium-posts'}
            className="hover:underline text-sage-500 dark:text-sage-400 hover:text-sage-600 dark:hover:text-sage-400 text-xs"
          >
            Load More
          </Link>
        </div>
      )}
    </div>
  );
}
