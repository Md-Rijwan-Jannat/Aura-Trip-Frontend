'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Avatar } from '@nextui-org/avatar';
import { useDisclosure } from '@nextui-org/modal';
import { formatDistanceToNow } from 'date-fns';
import { FaUserPlus, FaSearch } from 'react-icons/fa';
import { useGetUserChatQuery } from '@/src/redux/features/message/chatApi';
import { useSocket } from '@/src/context/socketProvider';
import { useAppDispatch, useAppSelector } from '@/src/redux/hook';
import { setActiveChatId } from '@/src/redux/features/message/chatUiSlice';
import { getSender } from '@/src/utils/chatLogics';
import { useUser } from '@/src/hooks/useUser';
import { TChat } from '@/src/types';
import AddFriendModal from '../modal/addFriendModal';

export default function RailChatList() {
  const dispatch = useAppDispatch();
  const activeChatId = useAppSelector((s) => s.chatUi.activeChatId);
  const { userInfo } = useUser();
  const [search, setSearch] = useState('');
  const { data, isLoading, refetch } = useGetUserChatQuery(undefined);
  const socket = useSocket();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  useEffect(() => {
    if (!socket) return;
    const onMessage = () => refetch();

    socket.on('message received', onMessage);

    return () => {
      socket.off('message received', onMessage);
    };
  }, [socket, refetch]);

  const chats: TChat[] = data?.data || [];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    if (!q) return chats;

    return chats.filter((c) => {
      const name = c.isGroupChat
        ? c.chatName
        : getSender(c, userInfo)?.name || c.chatName;

      return name?.toLowerCase().includes(q);
    });
  }, [chats, search, userInfo]);

  return (
    <aside className="hidden lg:block md:sticky top-0 pt-28 h-screen w-1/4 space-y-3 overflow-y-auto scrollbar-hide pb-5">
      <div className="flex items-center justify-between gap-2 px-1">
        <h3 className="text-sm font-bold text-default-800">Messages</h3>
        <button
          type="button"
          onClick={onOpen}
          title="New chat"
          className="w-8 h-8 rounded-full border border-default-200 bg-default-50 hover:bg-default-100 dark:bg-white/[0.04] dark:border-white/10 flex items-center justify-center text-default-600 transition-colors"
        >
          <FaUserPlus className="text-xs" />
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-default-400 text-xs pointer-events-none" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search people…"
          className="w-full h-9 pl-8 pr-3 rounded-full border border-borderSubtle bg-surface text-xs focus:border-sage-500 focus:outline-none transition-colors"
        />
      </div>

      {isLoading ? (
        <p className="text-xs text-default-400 px-1">Loading chats…</p>
      ) : filtered.length === 0 ? (
        <p className="text-xs text-default-400 px-1 leading-relaxed">
          {search ? 'No chats match your search.' : 'No chats yet — add a friend to start one.'}
        </p>
      ) : (
        <div className="space-y-1">
          {filtered.map((chat) => {
            const user = chat.isGroupChat ? undefined : getSender(chat, userInfo);
            const name = chat.isGroupChat ? chat.chatName : user?.name || 'Chat';
            const last = chat.latestMessage?.content;
            const time = chat.latestMessage?.createdAt
              ? formatDistanceToNow(new Date(chat.latestMessage.createdAt), {
                  addSuffix: true,
                })
              : '';
            const active = chat._id === activeChatId;

            return (
              <button
                key={chat._id}
                type="button"
                onClick={() => dispatch(setActiveChatId(chat._id))}
                className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-left transition-colors ${
                  active
                    ? 'bg-sage-50 dark:bg-sage-500/10 ring-1 ring-sage-400/60'
                    : 'hover:bg-default-50 dark:hover:bg-white/[0.04]'
                }`}
              >
                <Avatar
                  name={name?.charAt(0)?.toUpperCase()}
                  size="sm"
                  src={chat.isGroupChat ? undefined : user?.image}
                  className="flex-shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-default-800 truncate flex items-center gap-1">
                    {name}
                    {chat.isGroupChat && (
                      <span className="text-[9px] font-normal text-default-400 border border-default-200 rounded px-1 flex-shrink-0">
                        group
                      </span>
                    )}
                  </p>
                  <p className="text-[11px] text-default-500 truncate">
                    {last || 'Say hi 👋'}
                  </p>
                </div>
                {time && (
                  <span className="text-[10px] text-default-400 flex-shrink-0">
                    {time}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      <AddFriendModal isOpen={isOpen} onOpenChange={onOpenChange} />
    </aside>
  );
}
