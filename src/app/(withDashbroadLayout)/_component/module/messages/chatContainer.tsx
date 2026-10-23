// ChatContainer.tsx
'use client';

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  KeyboardEvent,
  ChangeEvent,
} from 'react';
import { useUser } from '@/src/hooks/useUser';
import {
  useGetUserMessagesQuery,
  useCreateMessageMutation,
  useReactToMessageMutation,
  useRemoveReactionMutation,
} from '@/src/redux/features/message/messageApi';
import { useGetSingleChatQuery } from '@/src/redux/features/message/chatApi';
import { getSender } from '@/src/utils/chatLogics';
import ScrollableChat from './scrollableChat';
import {
  TChat,
  TMessage,
  TMessageReactionSummary,
  TReactionType,
} from '@/src/types';
import MessageBar, { TMessagePayload } from './messageBar';
import TableSkeleton from '@/src/components/ui/skeleton/tableSkeleton';
import { useAppDispatch } from '@/src/redux/hook';
import {
  addNotification,
  clearNotifications,
} from '@/src/redux/features/message/notificationSlice';
import { useSocket } from '@/src/context/socketProvider';
import { useCall } from '@/src/context/callContext';
import { toast } from 'sonner';
import { Avatar } from '@nextui-org/avatar';
import { Button } from '@nextui-org/button';
import { useDisclosure } from '@nextui-org/modal';
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from '@nextui-org/dropdown';
import { ArrowLeft, Phone, Video, UserPlus, MoreVertical, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import AddPeopleModal from './addPeopleModal';
import GroupInfoModal from './groupInfoModal';

let selectedChatCompare: TChat;

/** Fit the chat panel inside the shell (navbar top + menu bottom offsets). */
const DEFAULT_HEIGHT =
  'h-[calc(100dvh-10rem)] md:h-[calc(100dvh-12rem)] lg:h-[calc(100dvh-8.25rem)]';

interface ChatContainerProps {
  chatId: string;
  /**
   * Extra dvh height class used instead of the default. The docked messenger
   * passes a taller subtraction to account for its "Back to chats" button.
   */
  heightClassName?: string;
  /** Renders a back arrow inside the conversation header (mobile route). */
  showBack?: boolean;
}

export default function ChatContainer({
  chatId,
  heightClassName,
  showBack = false,
}: ChatContainerProps) {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<TMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [typing, setTyping] = useState<boolean>(false);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [replyTarget, setReplyTarget] = useState<TMessage | null>(null);
  const lastTypingTime = useRef<number>(0); // Use ref to store last typing time

  // Fetch socket from context
  const socket = useSocket();
  const dispatch = useAppDispatch();
  const { userInfo: user } = useUser();
  const { startCall } = useCall();

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
  const [reactToMessageFn] = useReactToMessageMutation();
  const [removeReactionFn] = useRemoveReactionMutation();

  /** Apply a reaction summary (REST response or `message reacted` event). */
  const applyReactionUpdate = useCallback(
    (payload: { _id: string; reactions: TMessageReactionSummary }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m._id === payload._id ? { ...m, reactions: payload.reactions } : m,
        ),
      );
    },
    [],
  );

  /**
   * Toggle an emoji reaction: same emoji again → remove, different → switch
   * (the server replaces atomically, so nothing ever stacks). Local state is
   * patched from the response — no history refetch, no scroll jump.
   */
  const toggleReaction = useCallback(
    async (message: TMessage, type: TReactionType) => {
      try {
        const myCurrent = message.reactions?.myReaction ?? null;
        const res =
          myCurrent === type
            ? await removeReactionFn(message._id).unwrap()
            : await reactToMessageFn({ messageId: message._id, type }).unwrap();
        const data = (
          res as {
            data?: { _id: string; reactions: TMessageReactionSummary };
          }
        )?.data;
        if (data?._id) applyReactionUpdate(data);
      } catch {
        toast.error('Could not save reaction');
      }
    },
    [reactToMessageFn, removeReactionFn, applyReactionUpdate],
  );

  // ------------------------------------------------------------------
  // Live location sharing: one geolocation watcher per chat started from
  // this device. The server owns the 15-minute window; we stream throttled
  // position patches until it closes (or the sharer presses Stop).
  // ------------------------------------------------------------------
  const liveSharesRef = useRef(
    new Map<
      string,
      {
        messageId: string;
        chatId: string;
        watchId: number;
        timeoutId: ReturnType<typeof setTimeout>;
        lastSent: { ts: number; lat: number; lng: number };
      }
    >(),
  );

  const clearLiveShare = useCallback((chatKey: string) => {
    const share = liveSharesRef.current.get(chatKey);
    if (!share) return;
    navigator.geolocation.clearWatch(share.watchId);
    clearTimeout(share.timeoutId);
    liveSharesRef.current.delete(chatKey);
  }, []);

  const markLiveEnded = useCallback((messageId: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        m._id === messageId
          ? { ...m, liveLocation: { expiresAt: new Date(0).toISOString() } }
          : m,
      ),
    );
  }, []);

  /** Sharer-side stop: kill the watcher, tell the server, freeze the bubble. */
  const stopLiveShare = useCallback(
    (messageId: string) => {
      for (const [key, share] of Array.from(liveSharesRef.current.entries())) {
        if (share.messageId !== messageId) continue;
        clearLiveShare(key);
        if (socket) {
          socket.emit('live:stop', { messageId, chat: share.chatId });
        }
        break;
      }
      markLiveEnded(messageId);
    },
    [socket, clearLiveShare, markLiveEnded],
  );

  const startLiveShare = useCallback(
    (message: TMessage, chatKey: string) => {
      if (!('geolocation' in navigator)) return;
      clearLiveShare(chatKey); // one active share per chat on this device
      const messageId = message._id;
      const expiresAtMs = message.liveLocation
        ? new Date(message.liveLocation.expiresAt).getTime()
        : Date.now() + 15 * 60_000;

      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const share = liveSharesRef.current.get(chatKey);
          if (!share || share.messageId !== messageId || !socket) return;
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const now = Date.now();
          const moved =
            Math.abs(lat - share.lastSent.lat) + Math.abs(lng - share.lastSent.lng);
          // ~10s cadence, or immediately after a meaningful jump (~100 m).
          if (now - share.lastSent.ts < 10_000 && moved < 0.001) return;
          share.lastSent = { ts: now, lat, lng };
          socket.emit('live:update', {
            messageId,
            chat: share.chatId,
            location: { lat, lng },
          });
        },
        () => {
          // Permission/GPS failure: the share keeps its last position until
          // the server-side window closes.
        },
        { enableHighAccuracy: true, maximumAge: 5_000, timeout: 15_000 },
      );

      const timeoutId = setTimeout(
        () => {
          clearLiveShare(chatKey);
          markLiveEnded(messageId);
        },
        Math.max(expiresAtMs - Date.now(), 0) + 750,
      );

      liveSharesRef.current.set(chatKey, {
        messageId,
        chatId: chatKey,
        watchId,
        timeoutId,
        lastSent: {
          ts: 0,
          lat: message.location?.lat ?? 0,
          lng: message.location?.lng ?? 0,
        },
      });
    },
    [socket, clearLiveShare, markLiveEnded],
  );

  // Leaving the conversation stops the watcher but lets the share live out
  // its server-side window at the last known position.
  useEffect(() => {
    const shares = liveSharesRef.current;
    return () => {
      for (const share of Array.from(shares.values())) {
        navigator.geolocation.clearWatch(share.watchId);
        clearTimeout(share.timeoutId);
      }
      shares.clear();
    };
  }, []);


  const sendMessage = async (
    payload: TMessagePayload,
    event?: KeyboardEvent<HTMLInputElement>
  ) => {
    if (event) event.preventDefault();

    const hasText = Boolean(payload.content?.trim());
    const hasMedia = Boolean(payload.mediaUrl);
    const hasLocation = Boolean(payload.location);
    if (!hasText && !hasMedia && !hasLocation) return;

    try {
      const res = await createMessageFn({ ...payload, chat: chatId });

      if (res?.data?.success) {
        const data = res.data.data;

        // Optimistic append (deduped). Tag invalidation refetches history —
        // an extra manual refetch here caused a double fetch + visible jump.
        setMessages((prevMessages) =>
          prevMessages.some((m) => m._id === data._id)
            ? prevMessages
            : [...prevMessages, data]
        );
        setReplyTarget(null);

        if (data.messageType === 'LIVE_LOCATION') {
          startLiveShare(data, chatId);
        }

        if (socket) {
          socket.emit('new message', data);
          socket.emit('stop typing', chatId);
        }

        setNewMessage('');
      } else if ('error' in res) {
        const err = res.error as { data?: { message?: string } };

        if (err?.data?.message) {
          // Surface backend per-type validation messages (emoji length, etc.)
          console.error(err.data.message);
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (userMessages) {
      setMessages(userMessages);
    }

    if (socket) {
      socket.emit('join chat', chatId);
      selectedChatCompare = selectedChat;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userMessages, selectedChat, socket]);

  // Switching conversations clears any in-progress reply draft (a background
  // history refetch must NOT wipe it — that's why this is not in the effect
  // above).
  useEffect(() => {
    setReplyTarget(null);
  }, [chatId]);

  useEffect(() => {
    if (!socket) return;

    const chatIdOf = (chat: TMessage['chat'] | string) =>
      typeof chat === 'string' ? chat : chat?._id;

    socket.on('message received', (newMessageReceived: TMessage) => {
      if (
        !selectedChatCompare ||
        selectedChatCompare._id !== chatIdOf(newMessageReceived.chat)
      ) {
        dispatch(addNotification(newMessageReceived));
        refetch();
      } else {
        setMessages((prevMessages) =>
          prevMessages.some((m) => m._id === newMessageReceived._id)
            ? prevMessages
            : [...prevMessages, newMessageReceived]
        );
        refetch();
      }
    });

    socket.on('message edited', (edited: TMessage) => {
      if (chatIdOf(edited.chat) !== chatId) return;
      setMessages((prev) =>
        prev.map((m) => (m._id === edited._id ? edited : m)),
      );
    });

    // Someone reacted (the server sends each member their own myReaction).
    socket.on(
      'message reacted',
      (payload: {
        _id: string;
        chat: string;
        reactions: TMessageReactionSummary;
      }) => {
        if (payload.chat !== chatId) return;
        applyReactionUpdate(payload);
      },
    );

    socket.on(
      'message deleted',
      (payload: { _id: string; chat: string }) => {
        if (payload.chat !== chatId) return;
        setMessages((prev) =>
          prev.map((m) =>
            m._id === payload._id
              ? {
                  ...m,
                  isDeleted: true,
                  content: '',
                  mediaUrl: null,
                  mediaMeta: null,
                  location: null,
                  liveLocation: null,
                }
              : m
          )
        );
      }
    );

    // Position patches from an active LIVE_LOCATION share (other members).
    socket.on(
      'live:position',
      (payload: {
        messageId: string;
        chat: string;
        location: { lat: number; lng: number; label?: string };
      }) => {
        if (payload.chat !== chatId) return;
        setMessages((prev) =>
          prev.map((m) =>
            m._id === payload.messageId ? { ...m, location: payload.location } : m
          )
        );
      }
    );

    // The sharer ended the session early → freeze the bubble.
    socket.on('live:ended', (payload: { messageId: string; chat: string }) => {
      if (payload.chat !== chatId) return;
      clearLiveShare(payload.chat);
      markLiveEnded(payload.messageId);
    });

    socket.on('typing', () => setIsTyping(true));
    socket.on('stop typing', () => setIsTyping(false));

    return () => {
      socket.off('message received');
      socket.off('message edited');
      socket.off('message reacted');
      socket.off('message deleted');
      socket.off('live:position');
      socket.off('live:ended');
      socket.off('typing');
      socket.off('stop typing');
    };
  }, [
    socket,
    chatId,
    selectedChat,
    dispatch,
    refetch,
    clearLiveShare,
    markLiveEnded,
    applyReactionUpdate,
  ]);

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
  const addPeopleDisclosure = useDisclosure();
  const groupInfoDisclosure = useDisclosure();
  // Calls are available in DMs and group chats alike (group = mesh, max 8).
  const canCall = Boolean(selectedChat);

  return (
    <div
      className={`w-full md:w-[550px] xl:w-[640px] mx-auto flex flex-col overflow-hidden ${
        heightClassName || DEFAULT_HEIGHT
      }`}
    >
      {isLoading && <TableSkeleton />}

      {/* Conversation header: fixed (never scrolls with messages) */}
      <div className="shrink-0 mb-2 px-1">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            {showBack && (
              <Button
                isIconOnly
                size="sm"
                variant="light"
                aria-label="Go back"
                onPress={() => router.back()}
              >
                <ArrowLeft className="h-4 w-4 text-default-600" />
              </Button>
            )}
            <Avatar
              name={
                (selectedChat?.isGroupChat
                  ? selectedChat?.chatName
                  : selectedUser?.name
                )?.charAt(0)?.toUpperCase()
              }
              src={
                !selectedChat?.isGroupChat
                  ? selectedUser?.image || undefined
                  : undefined
              }
              className="w-9 h-9 shrink-0"
            />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-default-700 truncate leading-tight">
                {selectedChat?.isGroupChat
                  ? selectedChat?.chatName
                  : selectedUser?.name}
              </p>
              {/* Quick links under the avatar: Profile (DM) / Group (group chat) */}
              <div className="flex items-center gap-2 mt-0.5">
                {!selectedChat?.isGroupChat && selectedUser && (
                  <button
                    type="button"
                    onClick={() => router.push(`/profile/${selectedUser._id}`)}
                    className="text-[11px] font-medium text-sage-600 dark:text-sage-400 hover:underline"
                  >
                    Profile
                  </button>
                )}
                {selectedChat?.isGroupChat && (
                  <>
                    <button
                      type="button"
                      onClick={groupInfoDisclosure.onOpen}
                      className="text-[11px] font-medium text-sage-600 dark:text-sage-400 hover:underline truncate"
                    >
                      Group · {selectedChat.users?.length ?? 0} members
                    </button>
                    <span className="text-[11px] text-default-300 dark:text-default-600">
                      |
                    </span>
                    <button
                      type="button"
                      onClick={addPeopleDisclosure.onOpen}
                      className="text-[11px] font-medium text-sage-600 dark:text-sage-400 hover:underline"
                    >
                      Add people
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
          {canCall && (
            <div className="flex items-center gap-1 shrink-0">
              {selectedChat?.isGroupChat && (
                <Button
                  isIconOnly
                  size="sm"
                  radius="full"
                  variant="flat"
                  aria-label="Invite people"
                  onPress={addPeopleDisclosure.onOpen}
                >
                  <UserPlus className="h-4 w-4 text-sage-600 dark:text-sage-400" />
                </Button>
              )}
              {selectedChat?.isGroupChat && (
                <Dropdown placement="bottom-end">
                  <DropdownTrigger>
                    <Button
                      isIconOnly
                      size="sm"
                      radius="full"
                      variant="flat"
                      aria-label="Conversation options"
                    >
                      <MoreVertical className="h-4 w-4 text-default-600" />
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu
                    aria-label="Conversation options"
                    onAction={(key) => {
                      if (key === 'info') groupInfoDisclosure.onOpen();
                      if (key === 'add') addPeopleDisclosure.onOpen();
                    }}
                  >
                    <DropdownItem
                      key="info"
                      startContent={<Users className="h-4 w-4" />}
                    >
                      Group info
                    </DropdownItem>
                    <DropdownItem
                      key="add"
                      startContent={<UserPlus className="h-4 w-4" />}
                    >
                      Add people
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              )}
              <Button
                isIconOnly
                size="sm"
                radius="full"
                variant="flat"
                aria-label="Start audio call"
                onPress={() => void startCall(chatId, 'AUDIO')}
              >
                <Phone className="h-4 w-4 text-sage-600 dark:text-sage-400" />
              </Button>
              <Button
                isIconOnly
                size="sm"
                radius="full"
                variant="flat"
                aria-label="Start video call"
                onPress={() => void startCall(chatId, 'VIDEO')}
              >
                <Video className="h-4 w-4 text-sage-600 dark:text-sage-400" />
              </Button>
            </div>
          )}
        </div>
      </div>

      <AddPeopleModal
        isOpen={addPeopleDisclosure.isOpen}
        onOpenChange={addPeopleDisclosure.onOpenChange}
        chat={selectedChat}
      />
      <GroupInfoModal
        isOpen={groupInfoDisclosure.isOpen}
        onOpenChange={groupInfoDisclosure.onOpenChange}
        chat={selectedChat}
        onAddPeople={addPeopleDisclosure.onOpen}
      />

      <ScrollableChat
        messages={messages}
        currentUser={user}
        scrollRef={scrollRef}
        selectedChat={selectedChat}
        selectedUser={selectedUser}
        isTyping={isTyping}
        onReply={setReplyTarget}
        onStopLiveShare={stopLiveShare}
        onToggleReaction={toggleReaction}
      />
      <MessageBar
        onSendMessage={sendMessage}
        typingHandler={typingHandler}
        replyTo={replyTarget}
        onCancelReply={() => setReplyTarget(null)}
      />
    </div>
  );
}
