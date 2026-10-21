import React, { useState } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '@nextui-org/modal';
import { Chip } from '@nextui-org/chip';
import { Input } from '@nextui-org/input';
import { Button } from '@nextui-org/button';
import Select from 'react-select';
import { Avatar } from '@nextui-org/avatar';
import { useChat } from '@/src/context/chatContext';
import { useGetAllNormalForAnalyticsUsersQuery } from '@/src/redux/features/user/userApi';
import { useCreateGroupChatMutation } from '@/src/redux/features/message/groupChatApi';
import { TUser } from '@/src/types';
import { useTheme } from 'next-themes';

// Checkbox Component
const Checkbox = ({ children, ...props }: JSX.IntrinsicElements['input']) => (
  <label style={{ marginRight: '1em' }}>
    <input type="checkbox" {...props} />
    {children}
  </label>
);

interface TCreateGroupModalProps {
  isOpen: boolean;
  onOpenChange: () => void;
}

export default function CreateGroupModal({
  isOpen,
  onOpenChange,
}: TCreateGroupModalProps) {
  const [chatName, setChatName] = useState<string>('');
  const [selectedUsers, setSelectedUsers] = useState<TUser[]>([]);
  const [isClearable, setIsClearable] = useState(true);
  const [isSearchable, setIsSearchable] = useState(true);
  const [isDisabled, setIsDisabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { theme } = useTheme();
  const isDarkTheme = theme === 'dark';

  const { chats, setChats, setSelectedChat } = useChat();
  const { data: allUsersData } =
    useGetAllNormalForAnalyticsUsersQuery(undefined);
  const [createGroupChatFn] = useCreateGroupChatMutation();

  const allUsers = allUsersData?.data || [];
  const userOptions = allUsers.map((user: TUser) => ({
    value: user,
    label: (
      <div className="flex items-center gap-2">
        <Avatar
          className="w-6 h-6 rounded-full object-cover text-[14px]"
          name={user?.name?.charAt(0).toUpperCase()}
          src={user?.image || undefined}
        />
        {user.name}
      </div>
    ),
  }));

  const createGroupHandler = async () => {
    if (!chatName || selectedUsers.length === 0) return;

    try {
      const res = await createGroupChatFn({
        users: selectedUsers.map((user) => user._id),
        chatName,
        isGroup: true,
      });

      if (res?.data?.success) {
        const newChat = res.data.data;

        setSelectedChat(newChat);
        if (chats && !chats.find((c) => c._id === newChat._id)) {
          setChats([newChat, ...chats]);
        }
        onOpenChange();
        setSelectedUsers([]);
        setChatName('');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const customStyles = (isDarkTheme: boolean) => ({
    control: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: isDarkTheme ? '#1E1E1E' : '#FFFFFF',
      borderColor: state.isFocused
        ? isDarkTheme
          ? '#AAAAAA'
          : '#DDDDDD'
        : '#CCCCCC',
      borderRadius: '50px',
      padding: '5px',
      boxShadow: state.isFocused
        ? isDarkTheme
          ? '0 0 0 2px #AAAAAA'
          : '0 0 0 2px #DDDDDD'
        : 'none',
      '&:hover': {
        borderColor: isDarkTheme ? '#DDDDDD' : '#DDDDDD',
      },
    }),
    menu: (provided: any) => ({
      ...provided,
      backgroundColor: isDarkTheme ? '#2E2E2E' : '#F9F9F9',
      borderRadius: '8px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isFocused
        ? isDarkTheme
          ? '#3A3A3A'
          : '#F2F2F2'
        : isDarkTheme
          ? '#2E2E2E'
          : '#FFFFFF',
      color: state.isFocused ? '#FFFFFF' : isDarkTheme ? '#333333' : '#333333',
      cursor: 'pointer',
      padding: '10px 20px',
      '&:active': {
        backgroundColor: isDarkTheme ? '#444444' : '#E6E6E6',
      },
    }),
    multiValue: (provided: any) => ({
      ...provided,
      backgroundColor: isDarkTheme ? '#444444' : '#E6E6E6',
      color: isDarkTheme ? '#FFFFFF' : '#333333',
      borderRadius: '15px',
    }),
    multiValueLabel: (provided: any) => ({
      ...provided,
      color: isDarkTheme ? '#FFFFFF' : '#333333',
    }),
    multiValueRemove: (provided: any) => ({
      ...provided,
      color: isDarkTheme ? '#FFFFFF' : '#333333',
      '&:hover': {
        backgroundColor: isDarkTheme ? '#555555' : '#DDDDDD',
        color: isDarkTheme ? '#FFFFFF' : '#000000',
      },
    }),
  });

  return (
    <Modal
      placement="center"
      size="md"
      isOpen={isOpen}
      onOpenChange={onOpenChange}
    >
      <ModalContent className="h-auto py-3">
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <Chip color="danger" variant="dot">
                Create Group
              </Chip>
            </ModalHeader>
            <ModalBody>
              <Input
                label="Chat Name"
                variant="bordered"
                placeholder="Enter group name..."
                size="md"
                radius="full"
                value={chatName}
                onChange={(e) => setChatName(e.target.value)}
              />
              <div className="mt-4">
                <label
                  htmlFor="user-select"
                  className="block text-sm font-medium text-default-600 mb-2"
                >
                  Select Users
                </label>
                <Select
                  id="user-select"
                  options={userOptions}
                  isMulti
                  placeholder="Search and select users"
                  isClearable={isClearable}
                  isSearchable={isSearchable}
                  isDisabled={isDisabled}
                  isLoading={isLoading}
                  styles={customStyles(isDarkTheme)}
                  onChange={(selected) =>
                    setSelectedUsers(
                      selected ? selected.map((opt) => opt.value) : []
                    )
                  }
                  value={selectedUsers.map((user) => ({
                    value: user,
                    label: (
                      <div className="flex items-center gap-2">
                        <Avatar
                          className="w-6 h-6 rounded-full object-cover text-[14px]"
                          name={user?.name?.charAt(0).toUpperCase()}
                          src={user?.image || undefined}
                        />
                        {user.name}
                      </div>
                    ),
                  }))}
                />
              </div>
              <div className="mt-4">
                <Checkbox
                  checked={isClearable}
                  onChange={() => setIsClearable(!isClearable)}
                >
                  Clearable
                </Checkbox>
                <Checkbox
                  checked={isSearchable}
                  onChange={() => setIsSearchable(!isSearchable)}
                >
                  Searchable
                </Checkbox>
                <Checkbox
                  checked={isDisabled}
                  onChange={() => setIsDisabled(!isDisabled)}
                >
                  Disabled
                </Checkbox>
                <Checkbox
                  checked={isLoading}
                  onChange={() => setIsLoading(!isLoading)}
                >
                  Loading
                </Checkbox>
              </div>
              <ModalFooter>
                <Button
                  radius="full"
                  className="primary-button"
                  onClick={createGroupHandler}
                >
                  Create group
                </Button>
              </ModalFooter>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
