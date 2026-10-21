'use client';

import React, { forwardRef, useEffect } from 'react';
import { TChat, TMessage, TUser } from '@/src/types';
import { Avatar } from '@nextui-org/avatar';
import { ScrollShadow } from '@nextui-org/scroll-shadow';
import {
  format,
  isSameDay,
  isSameMinute,
  isSameMonth,
  isSameYear,
} from 'date-fns';
import TypingAnimation from './typingAnimation';

interface ScrollableChatProps {
  messages: TMessage[];
  currentUser: TUser | undefined;
  scrollRef: React.RefObject<HTMLDivElement>;
  selectedChat: TChat;
  selectedUser: TUser | undefined;
  isTyping: boolean | undefined;
}

const ScrollableChat = forwardRef<HTMLDivElement, ScrollableChatProps>(
  ({
    messages,
    currentUser,
    scrollRef,
    selectedChat,
    selectedUser,
    isTyping,
  }) => {
    // Automatically scroll to the bottom when messages change
    useEffect(() => {
      const scrollElement = scrollRef?.current;

      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight; // Scroll to bottom
      }
    }, [messages, scrollRef]);

    // Date format 'Today', 'Yesterday','Month', 'Year'
    const formatDate = (date: Date) => {
      const today = new Date();
      const isThisYear = isSameYear(date, today);
      const isThisMonth = isSameMonth(date, today);
      const isThisWeek =
        isSameDay(date, today) ||
        (date > new Date(today.setDate(today.getDate() - today.getDay())) &&
          date < today);

      if (isSameDay(date, today)) {
        return 'Today';
      } else if (isSameDay(date, new Date(today.getTime() - 86400000))) {
        return 'Yesterday';
      } else if (isThisWeek) {
        return format(date, 'EEEE');
      } else if (isThisMonth) {
        return format(date, 'MMMM dd');
      } else if (isThisYear) {
        return format(date, 'MMMM dd, yyyy');
      }

      return format(date, 'MMMM dd, yyyy');
    };

    // Get the last message to determine who is typing
    const lastMessage = messages[messages.length - 1];
    const isTypingForCurrentUser = lastMessage?.sender._id !== currentUser?._id;

    return (
      <ScrollShadow
        size={50}
        ref={scrollRef}
        className="h-[calc(100vh-220px)] lg:h-[calc(100vh-170px)] flex-grow p-2 pt-5 space-y-4 overflow-auto scrollbar-hide pb-8"
      >
        <div className="flex flex-col items-center justify-center gap-1">
          {!selectedChat?.isGroupChat ? (
            <>
              <Avatar
                name={selectedUser?.name?.charAt(0)?.toUpperCase()}
                size="md"
                src={selectedUser?.image || undefined}
              />
              <h2 className="text-sm font-medium text-default-600">
                {selectedUser?.name}
              </h2>
            </>
          ) : (
            <>
              <Avatar
                name={selectedChat?.chatName?.charAt(0)?.toUpperCase()}
                size="lg"
              />
              <h2 className="text-lg font-medium mt-2">
                {selectedChat?.chatName}
              </h2>
            </>
          )}
        </div>

        {messages.map((message, index) => {
          const isCurrentUser = message.sender._id === currentUser?._id;
          const nextMessage = messages[index + 1];
          const isLastMessageFromSameUser =
            nextMessage && nextMessage.sender._id === message.sender._id;

          const isSeen =
            message?.readBy?.some(
              (user: TUser) => user?._id === currentUser?._id
            ) || false;

          const shouldShowAvatar =
            !isCurrentUser &&
            (!isLastMessageFromSameUser || index === messages.length - 1);

          // Determine whether to show the timestamp for this message
          const currentMessageTime = new Date(message.createdAt);
          const nextMessageTime = nextMessage
            ? new Date(nextMessage.createdAt)
            : null;

          const showTime =
            !nextMessageTime ||
            !isSameMinute(currentMessageTime, nextMessageTime);

          // Show a date separator if the day changes
          const previousMessage = messages[index - 1];
          const shouldShowDateSeparator =
            !previousMessage ||
            !isSameDay(currentMessageTime, new Date(previousMessage.createdAt));

          return (
            <div key={message._id} className="mb-3">
              {/* Date Separator */}
              {shouldShowDateSeparator && (
                <div className="text-[10px] text-center text-default-500 my-3 border-b border-default-100 w-1/3 mx-auto pb-3">
                  {formatDate(currentMessageTime)}
                </div>
              )}

              {/* Message bubble */}
              <div
                className={`flex w-full ${
                  isCurrentUser ? 'justify-end' : 'justify-start'
                } items-start`}
              >
                <div
                  className={`flex flex-col items-start gap-1 ${
                    isCurrentUser ? 'items-end' : 'items-start'
                  }`}
                >
                  <div className="flex">
                    {!isCurrentUser && (
                      <div className="flex items-end mr-2">
                        {shouldShowAvatar && (
                          <Avatar
                            name={message.sender.name.charAt(0).toUpperCase()}
                            src={message.sender.image || undefined}
                            className="w-7 h-7"
                          />
                        )}
                      </div>
                    )}
                    <p
                      className={`max-w-xs px-4 py-2 text-xs rounded-lg ${
                        isCurrentUser
                          ? 'bg-sage-600 text-white'
                          : 'bg-default-200 text-default-800'
                      } ${!shouldShowAvatar && 'ml-7'}`}
                    >
                      {message.content}
                    </p>
                  </div>

                  {/* Show message timestamp only if it's the last in a group */}
                  {showTime && (
                    <p className="text-[10px] text-gray-400 ml-10">
                      {format(currentMessageTime, 'h:mm a')}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {/* Typing animation, show only if the typing indicator is for the other user */}
        {isTyping && <TypingAnimation />}
      </ScrollShadow>
    );
  }
);

ScrollableChat.displayName = 'ScrollableChat';

export default ScrollableChat;
