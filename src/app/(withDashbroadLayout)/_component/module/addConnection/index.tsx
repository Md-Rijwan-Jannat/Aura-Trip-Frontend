"use client";

import React, { useState } from "react";
import AddConnectionCard from "./addConnectionCard";
import { useGetAllUsersQuery } from "@/src/redux/features/user/userApi";
import { TUser } from "@/src/types";
import { useUser } from "@/src/hooks/useUser";
import FollowerSkeleton from "@/src/components/ui/skeleton/followerSkeleton";

const AddConnections: React.FC = () => {
  const { userInfo: currentUser } = useUser();
  const { data, isLoading } = useGetAllUsersQuery({ sort: "-createdAt" });
  const users = data?.data || ([] as TUser[]);

  // State to track ignored users
  const [ignoredUsers, setIgnoredUsers] = useState<string[]>([]);

  // Filter out ignored users
  const filteredUsers = users.filter((user: TUser) => !ignoredUsers.includes(user._id) && user._id !== currentUser?._id);

  const handleConnect = (userId: string) => {
    // console.log(`Connect with user ID: ${userId}`);
    // Implement connection logic here
  };

  const handleIgnore = (userId: string) => {
    setIgnoredUsers((prev) => [...prev, userId]);
  };

  if (isLoading)
    return (
      <p>
        <FollowerSkeleton />
      </p>
    );

  return (
    <div className='mx-auto w-full'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-3 w-full justify-center mx-auto'>
        {filteredUsers.map((user: TUser) => (
          <AddConnectionCard
            key={user._id}
            name={user.name}
            _id={user._id}
            followers={user.follower}
            verified={user.verified}
            title={user.bio || "No bio available"}
            avatarSrc={user?.image || ""}
            onConnect={() => handleConnect(user._id)}
            onIgnore={() => handleIgnore(user._id)}
          />
        ))}
      </div>
    </div>
  );
};

export default AddConnections;
