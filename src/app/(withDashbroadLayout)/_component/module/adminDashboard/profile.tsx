"use client";

import React from "react";
import Profile from "../publicProfile/Profile";
import { useUser } from "@/src/hooks/useUser";

export default function AdminProfile() {
  const { userInfo } = useUser();

  return (
    <div>
      <Profile user={userInfo} isOwnProfile={true} />
    </div>
  );
}
