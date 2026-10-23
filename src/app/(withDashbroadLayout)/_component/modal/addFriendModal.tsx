/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, { useState } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody } from '@nextui-org/modal';
import { Input } from '@nextui-org/input';
import { Chip } from '@nextui-org/chip';
import { TChat, TUser } from '@/src/types';
import { useGetAllNormalForAnalyticsUsersQuery } from '@/src/redux/features/user/userApi';
import { Avatar } from '@nextui-org/avatar';
import { GoVerified } from 'react-icons/go';
import { useCreateChatMutation } from '@/src/redux/features/message/chatApi';
import { useAppDispatch } from '@/src/redux/hook';
import { setActiveChatId } from '@/src/redux/features/message/chatUiSlice';

interface TAddFriendModalProps {
  isOpen: boolean;
  onOpenChange: (v?: boolean) => void;
}

export default function AddFriendModal({
  isOpen,
  onOpenChange,
}: TAddFriendModalProps) {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const { data: allUsersData } =
    useGetAllNormalForAnalyticsUsersQuery(undefined);
  const [createChatFn, { isLoading }] = useCreateChatMutation();
  const dispatch = useAppDispatch();

  const allUsers = allUsersData?.data || [];

  // Filter users based on the search term
  const filteredUsers = allUsers.filter((user: TUser) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Create chat handler
  const createChatHandler = async (userId: string | undefined) => {
    if (!userId || isLoading) return;
    try {
      const res = await createChatFn({ user: userId }).unwrap();

      if (res?.success) {
        const newChat = res.data;

        if (newChat) {
          // Open the new chat in the middle of the screen
          dispatch(setActiveChatId(newChat._id));
          onOpenChange(false);
        }
      }
    } catch (error) {
      console.log('Error creating chat:', error);
    }
  };

  return (
    <Modal
      placement="center"
      size="md"
      isOpen={isOpen}
      onOpenChange={onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <Chip color="danger" variant="dot">
                Add Friend
              </Chip>
            </ModalHeader>
            <ModalBody>
              {/* Search Input */}
              <Input
                className="focus:outline-none focus:ring-1 focus:ring-default-50"
                variant="bordered"
                placeholder="Search friend.."
                type="search"
                size="md"
                radius="full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              {/* Search Results */}
              <div className="mt-4 h-[300px] scrollbar-hide overflow-y-auto">
                {filteredUsers.length > 0 ? (
                  <div className="space-y-2 flex flex-col gap-2">
                    {filteredUsers.map((user: TUser) => (
                      <div
                        key={user._id}
                        className="cursor-pointer p-2 hover:bg-default-100 rounded-xl"
                        onClick={() => createChatHandler(user._id)}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar
                            className="w-10 h-10 rounded-full object-cover text-[22px]"
                            name={user?.name?.charAt(0).toUpperCase()}
                            src={user?.image || undefined}
                          />
                          <div>
                            <div className="font-semibold text-default-900 flex items-center gap-1 mt-0.5">
                              {user?.name}{' '}
                              {user?.verified && (
                                <GoVerified className="text-primaryColor" />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center my-3 text-default-700 text-sm">
                    <h2>No users found</h2>
                  </div>
                )}
              </div>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
