// ChatContainer.tsx
'use client';

import React, {
  useState,
  useRef,
  useEffect,
  KeyboardEvent,
  ChangeEvent,
} from 'react';
import { useUser } from '@/src/hooks/useUser';
import {
  useGetUserMessagesQuery,
  useCreateMessageMutation,
} from '@/src/redux/features/message/messageApi';
import { useGetSingleChatQuery } from '@/src/redux/features/message/chatApi';
import { getSender } from '@/src/utils/chatLogics';
import ScrollableChat from './scrollableChat';
import { TChat, TMessage } from '@/src/types';
import MessageBar from './messageBar';
import TableSkeleton from '@/src/components/ui/skeleton/tableSkeleton';
import { useAppDispatch, useAppSelector } from '@/src/redux/hook';
import {
  addNotification,
  clearNotifications,
  getNotifications,
} from '@/src/redux/features/message/notificationSlice';
import { useSocket } from '@/src/context/socketProvider';

let selectedChatCompare: TChat;

export default function ChatContainer({ chatId }: { chatId: string }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<TMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [typing, setTyping] = useState<boolean>(false);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const lastTypingTime = useRef<number>(0); // Use ref to store last typing time

  // Fetch socket from context
  const socket = useSocket();
  const dispatch = useAppDispatch();
  const { userInfo: user } = useUser();

  // Clear notifications for the current chat when the component mounts or chatId changes
  useEffect(() => {
    dispatch(clearNotifications(chatId));
  }, [chatId, dispatch]);

  const { data: selectedChatsData } = useGetSingleChatQuery(chatId);
  const {
    data: userMessagesData,
    isLoading,
    refetch,
  } = useGetUserMessagesQuery(chatId);
  const selectedChat = selectedChatsData?.data;
  const userMessages = userMessagesData?.data;

  const [createMessageFn] = useCreateMessageMutation();

  const sendMessage = async (
    message: string,
    event?: KeyboardEvent<HTMLInputElement>
  ) => {
    if (event) event.preventDefault();

    if (message.trim()) {
      try {
        const res = await createMessageFn({ content: message, chat: chatId });

        if (res?.data?.success) {
          const data = res.data.data;

          setMessages((prevMessages) => [...prevMessages, data]);
          refetch();

          if (socket) {
            socket.emit('new message', data);
            socket.emit('stop typing', chatId);
          }

          setNewMessage('');
        }
      } catch (error) {
        console.error(error);
      }
    }
  };

  useEffect(() => {
    if (userMessages) {
      setMessages(userMessages);
      refetch();
    }

    if (socket) {
      socket.emit('join chat', chatId);
      selectedChatCompare = selectedChat;
    }
  }, [userMessages, selectedChat, socket]);

  useEffect(() => {
    if (socket) {
      socket.on('message received', (newMessageReceived: TMessage) => {
        if (
          !selectedChatCompare ||
          selectedChatCompare._id !== newMessageReceived.chat._id
        ) {
          dispatch(addNotification(newMessageReceived));
          refetch();
        } else {
          setMessages((prevMessages) => [...prevMessages, newMessageReceived]);
          refetch();
        }
      });

      socket.on('typing', () => setIsTyping(true));
      socket.on('stop typing', () => setIsTyping(false));

      return () => {
        socket.off('message received');
        socket.off('typing');
        socket.off('stop typing');
      };
    }
  }, [socket, selectedChat, dispatch]);

  const typingHandler = (e: ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);

    if (!socket) return;

    if (!typing) {
      setTyping(true);
      socket.emit('typing', chatId);
    }

    lastTypingTime.current = new Date().getTime();
    const timeLength = 3000;

    setTimeout(() => {
      const timeNow = new Date().getTime();
      const timeDifference = timeNow - lastTypingTime.current;

      if (timeDifference >= timeLength && typing) {
        socket.emit('stop typing', chatId);
        setTyping(false);
      }
    }, timeLength);
  };

  const selectedUser = getSender(selectedChat, user);

  return (
    <div className="w-full md:w-[550px] xl:w-[640px] mx-auto ">
      {isLoading && <TableSkeleton />}
      <ScrollableChat
        messages={messages}
        currentUser={user}
        scrollRef={scrollRef}
        selectedChat={selectedChat}
        selectedUser={selectedUser}
        isTyping={isTyping}
      />
      <MessageBar onSendMessage={sendMessage} typingHandler={typingHandler} />
    </div>
  );
}
