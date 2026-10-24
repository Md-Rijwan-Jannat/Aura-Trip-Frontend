"use client";

import React from "react";
import { useUser } from "@/src/hooks/useUser";
import Profile from "../_component/module/publicProfile/Profile";
import ProfileSkeleton from "@/src/components/ui/skeleton/profileSkeleton";

export default function ProfilePage() {
  const { userInfo, isFetching } = useUser();

  if (isFetching) {
    return <ProfileSkeleton />;
  }

  if (!userInfo?._id) {
    return (
      <div className='w-full flex items-center justify-center min-h-screen'>
        <p className='text-center text-default-500'>Please log in to view your profile.</p>
      </div>
    );
  }

  // Show the logged-in user's profile directly
  return <Profile user={userInfo} isOwnProfile={true} />;
}
