import React from "react";
import { Avatar } from "@nextui-org/avatar";

import { useGetAllUsersQuery } from "@/src/redux/features/user/userApi";
import { TUser } from "@/src/types";
import Link from "next/link";
import BrandLogo from "@/src/components/shared/logo";

export default function LoginRightContent() {
  const { data: usersData } = useGetAllUsersQuery({ sort: "-createdAt" });
  const users = usersData?.data as TUser[];

  return (
    <div className="w-full md:flex-1 md:min-w-0 px-5 py-8 sm:px-8 sm:py-10 md:p-10 flex flex-col justify-center items-center rounded-t-xl md:rounded-l-xl md:rounded-r-none relative overflow-hidden">
      <Link
        className="flex items-center justify-center w-full mb-6 md:mb-8 gap-2"
        href="/"
      >
        <BrandLogo />
      </Link>
      {/* Foreground Content */}
      <div className="relative text-center z-10">
        <h3 className="text-2xl sm:text-3xl font-bold text-default-900 flex flex-wrap items-center justify-center gap-x-1">
          Welcome <span className="text-secondaryColor">Back to Our</span>{" "}
          Travel Community
        </h3>
        <p className="mt-2 text-default-600 text-sm sm:text-base leading-relaxed">
          Explore new destinations, share your travel stories, and connect with
          over 60,000 travel enthusiasts.
        </p>

        <div className="mt-6 flex items-center justify-center gap-2">
          {/* User Avatars */}
          <div className="flex -space-x-3">
            {users &&
              users
                .slice(0, 4)
                .map((user) => (
                  <Avatar
                    key={user?._id}
                    alt={user?.name}
                    className="w-10 h-10 rounded-full border-2 border-white"
                    name={user?.name.charAt(0).toUpperCase()}
                    src={user?.image || undefined}
                  />
                ))}
          </div>
          <span className="text-default-500 text-sm">
            Join {users?.length || "thousands"}+ users
          </span>
        </div>
      </div>
    </div>
  );
}
