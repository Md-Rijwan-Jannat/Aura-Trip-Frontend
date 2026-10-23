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
      } md:px-4 overflow-hidden pt-20 md:pt-28 mb-20 lg:mb-5 rounded-2xl bg-surface border border-borderSubtle shadow-[0_1px_2px_rgba(31,78,61,0.04),0_8px_24px_-12px_rgba(31,78,61,0.12)]`}
    >
      {/* Keep the current page mounted (hidden) so state/scroll survive */}
      <div className={showChat ? 'hidden' : undefined}>{children}</div>

      {showChat && activeChatId && (
        <div className="flex flex-col h-full">
          <button
            type="button"
            onClick={() => dispatch(setActiveChatId(null))}
            className="shrink-0 mb-1 inline-flex items-center gap-2 text-xs font-semibold text-default-600 hover:text-sage-600 dark:text-default-400 dark:hover:text-sage-300 transition-colors"
          >
            <FaArrowLeft /> Back to chats
          </button>
          {/* +2rem vs default height to account for the back button above */}
          <ChatContainer
            chatId={activeChatId}
            heightClassName="h-[calc(100dvh-12rem)] md:h-[calc(100dvh-14rem)] lg:h-[calc(100dvh-10.25rem)]"
          />
        </div>
      )}
    </main>
  );
}
