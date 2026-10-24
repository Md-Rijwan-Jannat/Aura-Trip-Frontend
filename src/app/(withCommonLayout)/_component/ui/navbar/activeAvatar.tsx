"use client";

import React from "react";
import { Avatar, AvatarProps } from "@nextui-org/avatar";
import { Badge } from "@nextui-org/badge";
import { useIsConnected } from "@/src/context/isConnectProvider";
import { useGetAllUsersQuery } from "@/src/redux/features/user/userApi";

interface ActiveAvatarProps extends AvatarProps {
  userId: string;
  showConnectionStatus?: boolean;
}

export const ActiveAvatar: React.FC<ActiveAvatarProps> = ({ userId, showConnectionStatus = true, ...props }) => {
  const { onlineUsers } = useIsConnected();

  // Check if the current user is online
  const isOnline = onlineUsers.includes(userId);

  return (
    <Badge size='sm' content='' color='success' shape='circle' placement='bottom-right' isInvisible={!showConnectionStatus || !isOnline}>
      <Avatar {...props} />
    </Badge>
  );
};
