"use client";

import React, { Suspense } from "react";
import Profile from "../../_component/module/publicProfile/Profile";
import ProfileSkeleton from "@/src/components/ui/skeleton/profileSkeleton";
import { useUser } from "@/src/hooks/useUser";

function ProfileContent() {
  const { userInfo } = useUser();

  if (!userInfo) {
    return <ProfileSkeleton />;
  }

  return <Profile user={userInfo} isOwnProfile={true} />;
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <ProfileContent />
    </Suspense>
  );
}
