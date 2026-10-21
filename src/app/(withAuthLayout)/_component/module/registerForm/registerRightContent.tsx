import { Avatar } from "@nextui-org/avatar";
import React from "react";

import { useGetAllUsersQuery } from "@/src/redux/features/user/userApi";
import { TUser } from "@/src/types";
import Link from "next/link";
import BrandLogo from "@/src/components/shared/logo";

export default function RegisterRightContent() {
  const { data: usersData } = useGetAllUsersQuery({ sort: "-createdAt" });
  const users = usersData?.data as TUser[];

  return (
    <div className="w-full md:w-[500px] xl:w-[530px] p-8 flex flex-col justify-center items-center rounded-r-lg relative overflow-hidden mb-10 md:mb-0">
      <Link
        className="flex items-center justify-center w-full mb-10 gap-2 -ml-4 -mt-4 md:hidden"
        href="/"
      >
        <BrandLogo />
      </Link>
      {/* Foreground Content */}
      <div className="relative text-center z-10">
        <h3 className="text-3xl font-bold text-default-900 flex flex-wrap items-center justify-center">
          Join Our <p className="text-primaryColor">Thriving Travel </p>
          Community
        </h3>
        <p className="mt-2 text-default-600">
          Explore hidden gems, share your travel stories, and connect with
          fellow adventurers. Our platform is trusted by thousands of
          globetrotters worldwide.
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
