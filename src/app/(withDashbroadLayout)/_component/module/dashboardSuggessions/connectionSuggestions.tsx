'use client';

import React from 'react';
import { useGetAllUsersQuery } from '@/src/redux/features/adminManagement/manageUserApi';
import { TUser } from '@/src/types';
import PremiumSkeleton from '@/src/components/ui/skeleton/premiumSkeleton';
import Link from 'next/link';
import { useUser } from '@/src/hooks/useUser';
import ConnectionsSuggestionCard from './connectionSuggestionsCard';

export default function ConnectionsSuggestions() {
  const { data: userData, isLoading } = useGetAllUsersQuery({
    sort: 'createdAt',
  });
  const users = userData?.data as TUser[];
  const { userInfo: currentUser } = useUser();

  // Filter out the current user and limit to 4 suggestions
  const suggestedUsers = users
    ?.filter((user) => user._id !== currentUser?._id)
    .slice(0, 4);

  // Utility function to truncate text
  const truncateText = (text: string, maxLength: number) =>
    text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;

  return (
    <div>
      <h2 className="text-[16px] text-default-700">Suggested Connections</h2>

      <div className="grid grid-cols-1 gap-5 mt-5 overflow-y-auto">
        {isLoading && <PremiumSkeleton />}
        {suggestedUsers &&
          suggestedUsers.map((user) => (
            <ConnectionsSuggestionCard
              key={user._id}
              user={{
                ...user,
                name: truncateText(user.name, 10),
                email: truncateText(user.email, 10),
              }}
            />
          ))}
      </div>

      {/* Load More Link */}
      {users && users.length > 4 && (
        <div className="mt-5 flex justify-start">
          <Link
            href={'/add-connections'}
            className="hover:underline text-sage-500 dark:text-sage-400 hover:text-sage-600 dark:hover:text-sage-400 text-xs"
          >
            See More Connections
          </Link>
        </div>
      )}
    </div>
  );
}
