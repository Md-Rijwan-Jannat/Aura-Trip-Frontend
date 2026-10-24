"use client";

import React from "react";
import { useGetSingleUserQuery } from "@/src/redux/features/user/userApi";
import { TUser } from "@/src/types";
import Profile from "./Profile";
import ProfileSkeleton from "@/src/components/ui/skeleton/profileSkeleton";

interface TPublicProfileProps {
  userId?: string;
}

export default function PublicProfile({ userId }: TPublicProfileProps) {
  const {
    data: userData,
    isLoading,
    isError,
  } = useGetSingleUserQuery(userId, {
    skip: !userId, // Skip query if no userId provided
  });
  const user = userData?.data as TUser;

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (isError) {
    return <p className='text-red-500'>Failed to load profile.</p>;
  }

  return (
    <div>
      <Profile user={user} />
    </div>
  );
}
