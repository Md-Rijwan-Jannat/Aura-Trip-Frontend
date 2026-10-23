import React from 'react';
import { Card, CardBody } from '@nextui-org/card';
import { Avatar } from '@nextui-org/avatar';
import Link from 'next/link';
import { useChat } from '@/src/context/chatContext';
import { TChat, TMessage } from '@/src/types';
import { useCreateChatMutation } from '@/src/redux/features/message/chatApi';
import { getSender } from '@/src/utils/chatLogics';
import { useUser } from '@/src/hooks/useUser';
import { GoVerified } from 'react-icons/go';
import { format, formatDistanceToNow } from 'date-fns';
import { messagePreview } from '@/src/utils/messagePreview';

const MessageCard = ({
  chat,
  newMessage,
}: {
  chat: TChat;
  newMessage: TMessage | undefined;
}) => {
  const [createChatFn] = useCreateChatMutation();
  const { userInfo: user } = useUser();

  const createChatHandler = async (userId: string | undefined) => {
    if (!userId) return;
    try {
      const res = await createChatFn({ user: userId });

      if (res?.data?.success) {
        const newChat = res.data.data;
      }
    } catch (error) {
      console.log(error);
    }
  };

  const latestMessage = chat?.latestMessage || {};
  const sender = latestMessage?.sender || {
    _id: '',
    name: 'Unknown',
    image: '',
  };

  const selectedUser = getSender(chat, user);

  // Format timestamp
  const timestamp = latestMessage.createdAt
    ? formatDistanceToNow(new Date(latestMessage.createdAt), {
        addSuffix: true, // Adds "ago" to relative times
      })
    : "Let's start a Chat";

  return (
    <Card
      onClick={() => createChatHandler(sender._id || chat._id)}
      as={Link}
      href={`/messages/${chat._id}`}
      className="w-full mb-2 cursor-pointer hover:bg-default-50 transition-colors h-20 border border-default-50"
    >
      <CardBody className="flex flex-row items-center p-2 gap-2">
        {!chat?.isGroupChat ? (
          <div>
            <Avatar
              className="cursor-pointer text-[24px] font-bold z-20"
              name={selectedUser?.name?.charAt(0)?.toUpperCase()}
              size="md"
              src={selectedUser?.image || undefined}
            />
          </div>
        ) : (
          <div>
            <Avatar
              className="cursor-pointer text-[24px] font-bold z-20"
              name={chat?.chatName?.charAt(0)?.toUpperCase()}
              size="md"
            />
          </div>
        )}

        <div className="flex-grow">
          {chat?.isGroupChat ? (
            <h2 className="text-sm font-medium text-default-700 flex items-center gap-2">
              {chat?.chatName}
            </h2>
          ) : (
            <h2 className="text-sm font-medium text-default-700 flex items-center gap-2">
              {selectedUser?.name}{' '}
              {selectedUser?.verified && (
                <GoVerified className="text-primaryColor" />
              )}
              {selectedUser?.role === 'ADMIN' && '(Admin)'}
            </h2>
          )}
          <div className="text-xs text-default-500 truncate">
            {newMessage
              ? messagePreview(newMessage)
              : messagePreview(latestMessage)}
          </div>
        </div>
        <div className="text-xs text-default-400">{timestamp}</div>
      </CardBody>
    </Card>
  );
};

export default MessageCard;
