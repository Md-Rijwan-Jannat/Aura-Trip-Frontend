"use client";

import React from "react";
import PublicProfile from "../../_component/module/publicProfile";
import { useParams } from "next/navigation";

interface ProfilePageProps {
  params: {
    userId: string;
  };
}

export default function ProfilePage() {
  const params = useParams();
  const userId = params?.userId as string;

  if (!userId) {
    return (
      <div className='w-full flex items-center justify-center min-h-screen'>
        <p className='text-center text-default-500'>User ID not found.</p>
      </div>
    );
  }

  return <PublicProfile userId={userId} />;
}
