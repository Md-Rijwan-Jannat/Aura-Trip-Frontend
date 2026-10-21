import React from 'react';
import { Avatar } from '@nextui-org/avatar';
import { IoSend } from 'react-icons/io5';
import { Button } from '@nextui-org/button';
import { useUser } from '@/src/hooks/useUser';

interface ReplyCommentInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
  onCancel: () => void; // New prop for handling cancel action
}

export default function ReplyCommentInput({
  value,
  onChange,
  onSubmit,
  onCancel, // Add cancel action
}: ReplyCommentInputProps) {
  const { userInfo: currentUser } = useUser();

  return (
    <div className="flex flex-col space-y-2 w-full mt-3">
      <div className="flex items-center justify-between rounded-lg shadow-sm gap-4 w-full">
        <div className="flex items-center gap-2 w-full">
          {/* Avatar */}
          <div className="w-[50px]">
            <Avatar
              name={currentUser?.name.charAt(0).toUpperCase()}
              src={currentUser?.image || undefined}
              size="sm"
              className="mr-2"
              alt="Profile Picture"
            />
          </div>
          {/* Input Box */}
          <input
            type="text"
            value={value}
            onChange={onChange}
            placeholder="Write a reply..."
            className="flex-grow bg-default-100 px-2 py-1 text-xs rounded-full border border-default-200 focus:outline-none focus:ring-1 focus:ring-default-300 w-full"
          />
        </div>
        {/* Send Icon */}
        <Button
          className="bg-default-50"
          isIconOnly
          size="sm"
          radius="full"
          onPress={onSubmit}
          startContent={<IoSend className="text-primaryColor" size={18} />}
        />
      </div>

      {/* Cancel Button */}
      <div className="flex justify-end">
        <Button
          size="sm"
          color="default"
          className="text-[8px] h-4 px-2 bg-sage-600 text-white"
          onPress={onCancel}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
