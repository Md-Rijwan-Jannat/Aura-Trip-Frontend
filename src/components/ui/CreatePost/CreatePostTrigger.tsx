"use client";

import { Avatar } from "@nextui-org/avatar";
import Link from "next/link";
import { TUser } from "@/src/types";
import { GoVerified } from "react-icons/go";

interface CreatePostTriggerProps {
  userInfo: TUser | undefined;
  onOpen: () => void;
}

const CreatePostTrigger = ({ userInfo, onOpen }: CreatePostTriggerProps) => {
  return (
    <div className='flex items-center gap-4 w-full p-4 bg-surface rounded-lg border border-borderSubtle'>
      <Link href={`/profile/${userInfo?._id}`}>
        <Avatar
          className='cursor-pointer'
          alt={userInfo?.name}
          name={userInfo?.name?.charAt(0).toUpperCase()}
          size='md'
          src={userInfo?.image || undefined}
        />
      </Link>

      <input
        className='cursor-pointer w-full px-4 py-2.5 bg-appBackground hover:bg-default-100 border border-borderSubtle rounded-full text-sm text-textSecondary transition-colors focus:outline-none'
        placeholder={`What's on your mind, ${userInfo?.name?.split(" ")[0]}?`}
        type='text'
        onClick={onOpen}
        readOnly
      />
    </div>
  );
};

export default CreatePostTrigger;
