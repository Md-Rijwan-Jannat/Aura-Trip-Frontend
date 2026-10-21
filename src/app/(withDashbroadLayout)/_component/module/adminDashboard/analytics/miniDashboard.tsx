'use client';

import { TPayment, TPost } from '@/src/types';
import { Button } from '@nextui-org/button';
import { Card } from '@nextui-org/card';
import { Select, SelectItem } from '@nextui-org/select';
import { usePathname } from 'next/navigation';
import React, { useMemo } from 'react';
import { ArrowUp, MoreHorizontal } from 'react-feather';
import {
  useGetAllPostsNormalForAnalyticsQuery,
  useGetAllPostsPremiumForAnalyticsQuery,
} from '@/src/redux/features/adminManagement/managePostApi';
import {
  useGetAllDislikesQuery,
  useGetAllLikesQuery,
} from '@/src/redux/features/adminManagement/manageReactsApi';
import {
  useGetAlPremiumUserForAnalyticsQuery,
  useGetAllUserForAnalyticsQuery,
} from '@/src/redux/features/adminManagement/manageUserApi';
import { useGetAllPaymentsDatForAnalyticsQuery } from '@/src/redux/features/adminManagement/payment';
import Link from 'next/link';
import Image from 'next/image';

export default function MiniDashboard() {
  // Fetching data using the queries
  const { data: paymentsData } =
    useGetAllPaymentsDatForAnalyticsQuery(undefined);
  const { data: premiumUsersData } =
    useGetAlPremiumUserForAnalyticsQuery(undefined);
  const { data: allUsersData } = useGetAllUserForAnalyticsQuery(undefined);
  const { data: likesData } = useGetAllLikesQuery(undefined);
  const { data: dislikesData } = useGetAllDislikesQuery(undefined);
  const { data: premiumPostsData } =
    useGetAllPostsPremiumForAnalyticsQuery(undefined);
  const { data: normalPostsData } =
    useGetAllPostsNormalForAnalyticsQuery(undefined);

  const posts = normalPostsData?.data;

  const popularPots = posts
    ?.filter((post: TPost) => post.likes.length > 0)
    ?.sort(
      (a: { likes: string | any[] }, b: { likes: string | any[] }) =>
        b.likes.length - a.likes.length
    ) as TPost[];

  // Calculating key stats
  const payments = paymentsData?.data?.length || 0;
  const premiumUsers = premiumUsersData?.data?.length || 0;
  const allUsers = allUsersData?.data?.length || 0;
  const likes = likesData?.data?.length || 0;
  const dislikes = dislikesData?.data?.length || 0;
  const premiumPosts = premiumPostsData?.meta?.total || 0;
  const normalPosts = normalPostsData?.meta?.total || 0;

  const pathname = usePathname();
  const isAdminPage =
    pathname.includes('manage-user') ||
    pathname.includes('manage-content') ||
    pathname.includes('analytics') ||
    pathname.includes('payments');

  return (
    <div
      className={`${isAdminPage && 'hidden'} md:sticky top-20 h-screen mt-20 lg:w-1/4 overflow-y-auto scrollbar-hide`}
    >
      <div className="flex-col gap-6 hidden lg:flex">
        {/* Profile Overview Card */}
        <Card className="bg-default-50 border border-default-100 rounded p-4">
          <div className="flex justify-between">
            <h2 className="text-sm font-semibold">Travel Stats</h2>
            <Button
              as={Link}
              href="/admin-dashboard/analytics"
              size="sm"
              className="bg-sage-600 text-white hover:bg-sage-800"
            >
              View analytics
            </Button>
          </div>
          <div className="mt-6 space-y-4">
            <div>
              <h3 className="text-2xl font-bold">{allUsers} Users</h3>
              <p className="text-sm text-default-400">Total Users</p>
            </div>
            <div className="flex gap-3 flex-wrap items-center justify-between text-sm">
              <div className="text-green-500 flex items-center gap-1">
                <ArrowUp size={16} />
                Posts
                <p>{normalPosts + premiumPosts}</p>
              </div>
              <div className="text-blue-500 flex items-center gap-1">
                <ArrowUp size={16} />
                Likes
                <p>{likes}</p>
              </div>
              <div className="text-red-500 flex items-center gap-1">
                <ArrowUp size={16} />
                DisLikes
                <p>{dislikes}</p>
              </div>
              <div className="text-yellow-500 flex items-center gap-1">
                <ArrowUp size={16} />
                Premium Tips
                <p>{premiumUsers}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Travel Insights Card */}
        <Card className="bg-default-50 border border-default-100 rounded p-4">
          <h2 className="text-xl font-semibold">Top Travel Insights</h2>
          <div className="space-y-4 mt-4">
            <p className="text-sm text-default-400">
              Most popular destination:
            </p>
            <h3 className="text-lg font-bold">{popularPots?.[0].title}</h3>
            <Link
              className="items-center justify-center"
              href={`/news-feed/posts/${popularPots?.[0]?._id}`}
            >
              {' '}
              <Image
                className="rounded-md object-cover mt-3"
                src={popularPots?.[0].images[0]}
                height={500}
                width={500}
                alt="posts image"
              />
            </Link>
            <p className="text-sm text-default-400">
              Trending Tip: &quot;Top 5 Beaches to Visit&quot;
            </p>
            <Button
              size="sm"
              as={Link}
              href="/news-feed/posts"
              className="w-full primary-button"
            >
              View All Tips
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
