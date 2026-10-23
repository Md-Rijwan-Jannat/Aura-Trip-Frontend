'use client';

import React from 'react';
import { useAppDispatch, useAppSelector } from '@/src/redux/hook';
import { setActiveChatId } from '@/src/redux/features/message/chatUiSlice';
import ChatContainer from '../module/messages/chatContainer';
import { FaArrowLeft } from 'react-icons/fa';

export default function MainShell({
  role,
  children,
}: {
  role?: 'USER' | 'ADMIN';
  children: React.ReactNode;
}) {
  const dispatch = useAppDispatch();
  const { open, activeChatId } = useAppSelector((state) => state.chatUi);
  const showChat = open && !!activeChatId;

  return (
    <main
      className={`flex-1 w-full md:w-[550px] xl:w-[640px] mx-auto ${
        role === 'ADMIN' ? 'lg:w-full' : 'lg:w-3/5'
      }             md:px-4 overflow-hidden pt-20 md:pt-28 mb-20 lg:mb-5`}
    >
      {/* Keep the current page mounted (hidden) so state/scroll survive */}
      <div className={showChat ? 'hidden' : undefined}>{children}</div>

      {showChat && activeChatId && (
        <div>
          <button
            type="button"
            onClick={() => dispatch(setActiveChatId(null))}
            className="mb-1 inline-flex items-center gap-2 text-xs font-semibold text-default-600 hover:text-sage-600 dark:text-default-400 dark:hover:text-sage-300 transition-colors"
          >
            <FaArrowLeft /> Back to chats
          </button>
          <ChatContainer chatId={activeChatId} />
        </div>
      )}
    </main>
  );
}
