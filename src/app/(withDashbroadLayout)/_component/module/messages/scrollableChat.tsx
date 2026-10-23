'use client';

import React, { forwardRef, useEffect, useRef, useState } from 'react';
import {
  TChat,
  TMessage,
  TMessageType,
  TUser,
} from '@/src/types';
import { Avatar } from '@nextui-org/avatar';
import { ScrollShadow } from '@nextui-org/scroll-shadow';
import { Button } from '@nextui-org/button';
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from '@nextui-org/dropdown';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '@nextui-org/modal';
import {
  format,
  isSameDay,
  isSameMinute,
  isSameMonth,
  isSameYear,
} from 'date-fns';
import Image from 'next/image';
import { toast } from 'sonner';
import {
  Check,
  CornerUpLeft,
  MapPin,
  Mic,
  MoreVertical,
  Pencil,
  Trash2,
  X,
} from 'lucide-react';
import TypingAnimation from './typingAnimation';
import LiveLocationCard from './liveLocationCard';
import {
  useDeleteMessageMutation,
  useEditMessageMutation,
  useConsumeViewOnceMediaMutation,
} from '@/src/redux/features/message/messageApi';

interface ScrollableChatProps {
  messages: TMessage[];
  currentUser: TUser | undefined;
  scrollRef: React.RefObject<HTMLDivElement>;
  selectedChat: TChat;
  selectedUser: TUser | undefined;
  isTyping: boolean | undefined;
  /** Enter "replying to…" mode for the given message. */
  onReply?: (message: TMessage) => void;
  /** Sharer-only: end an active LIVE_LOCATION session early. */
  onStopLiveShare?: (messageId: string) => void;
}

const formatDuration = (totalSeconds: number) => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.round(totalSeconds % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const BubbleShell = ({
  isCurrentUser,
  shouldShowAvatar,
  avatarSlot,
  children,
}: {
  isCurrentUser: boolean;
  shouldShowAvatar: boolean;
  avatarSlot?: React.ReactNode;
  children: React.ReactNode;
}) => (
  <div
    className={`flex w-full ${isCurrentUser ? 'justify-end' : 'justify-start'} items-start`}
  >
    <div
      className={`flex flex-col items-start gap-1 ${isCurrentUser ? 'items-end' : 'items-start'}`}
    >
      <div className="flex">
        {!isCurrentUser && (
          <div className="flex items-end mr-2">
            {shouldShowAvatar && avatarSlot}
          </div>
        )}
        {children}
      </div>
    </div>
  </div>
);

const ScrollableChat = forwardRef<HTMLDivElement, ScrollableChatProps>(
  ({
    messages,
    currentUser,
    scrollRef,
    selectedChat,
    selectedUser,
    isTyping,
    onReply,
    onStopLiveShare,
  }) => {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editDraft, setEditDraft] = useState('');
    const [viewOnceUrl, setViewOnceUrl] = useState<Record<string, string>>({});
    const [viewOnceBusy, setViewOnceBusy] = useState<string | null>(null);
    const [removeTarget, setRemoveTarget] = useState<TMessage | null>(null);
    const [flashId, setFlashId] = useState<string | null>(null);
    const editInputRef = useRef<HTMLInputElement>(null);

    const [editMessageFn] = useEditMessageMutation();
    const [deleteMessageFn] = useDeleteMessageMutation();
    const [consumeViewOnceFn] = useConsumeViewOnceMediaMutation();

    // Auto-scroll that never yanks the view: track whether the viewer is
    // parked at the bottom, reset on chat switch, and only follow new
    // messages when they belong to this conversation's end.
    const wasAtBottomRef = useRef(true);
    const prevCountRef = useRef<number | null>(null);

    useEffect(() => {
      const el = scrollRef?.current;
      if (!el) return;
      const onScroll = () => {
        wasAtBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
      };
      onScroll();
      el.addEventListener('scroll', onScroll, { passive: true });
      return () => el.removeEventListener('scroll', onScroll);
    }, [scrollRef]);

    // Switching conversations: start pinned to the newest message.
    useEffect(() => {
      prevCountRef.current = null;
      wasAtBottomRef.current = true;
    }, [selectedChat?._id]);

    useEffect(() => {
      const el = scrollRef?.current;
      if (!el) return;
      const count = messages.length;
      const prevCount = prevCountRef.current;
      prevCountRef.current = count;
      if (count === 0) return;

      if (prevCount === null) {
        // First paint for this conversation → jump straight to the bottom.
        el.scrollTop = el.scrollHeight;
        return;
      }
      if (count <= prevCount) return; // refetch/replace/delete → keep position

      const last = messages[count - 1];
      const senderId =
        typeof last.sender === 'string'
          ? last.sender
          : (last.sender as unknown as { _id?: string })?._id;
      const isOwn = senderId === currentUser?._id;

      if (wasAtBottomRef.current || isOwn) {
        el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
      }
    }, [messages, scrollRef, currentUser?._id]);

    useEffect(() => {
      if (editingId) editInputRef.current?.focus();
    }, [editingId]);

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
    void isTypingForCurrentUser;

    const startEdit = (message: TMessage) => {
      setEditingId(message._id);
      setEditDraft(message.content);
    };

    const saveEdit = async (message: TMessage) => {
      const next = editDraft.trim();
      setEditingId(null);
      if (!next || next === message.content) return;
      try {
        await editMessageFn({ messageId: message._id, data: { content: next } }).unwrap();
      } catch {
        toast.error('Could not edit the message');
      }
    };

    const removeMessage = async (message: TMessage) => {
      setRemoveTarget(null);
      try {
        await deleteMessageFn(message._id).unwrap();
        toast.success('Message removed for everyone');
      } catch {
        toast.error('Could not remove the message');
      }
    };

    /** Jump to the message a reply points at and flash it briefly. */
    const scrollToMessage = (id: string) => {
      const el = document.getElementById(`msg-${id}`);
      if (!el) {
        toast.info('The original message is not in the loaded history');
        return;
      }
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setFlashId(id);
      window.setTimeout(() => {
        setFlashId((cur) => (cur === id ? null : cur));
      }, 1400);
    };

    /** Short quoted text shown above a bubble when it replies to something. */
    const replyPreviewText = (parent: NonNullable<TMessage['replyTo']>) => {
      if (parent.isDeleted) return 'Message deleted';
      const type = parent.messageType;
      if (type === 'IMAGE') return 'Photo';
      if (type === 'VOICE') return 'Voice message';
      if (type === 'LOCATION') return 'Location';
      if (type === 'LIVE_LOCATION') return 'Live location';
      if (type === 'VIEW_ONCE_IMAGE') return 'View-once photo';
      return parent.content || 'Message';
    };

    const consumeViewOnce = async (message: TMessage) => {
      if (viewOnceUrl[message._id]) return;
      setViewOnceBusy(message._id);
      try {
        const res = await consumeViewOnceFn(message._id).unwrap();
        const url = (res as { data?: { mediaUrl?: string } })?.data?.mediaUrl
          ?? (res as unknown as { mediaUrl?: string })?.mediaUrl;
        if (url) {
          setViewOnceUrl((prev) => ({ ...prev, [message._id]: url }));
        } else {
          toast.error('Media is no longer available');
        }
      } catch (error: any) {
        const status = error?.status;
        if (status === 410) {
          toast.info('This view-once photo has already been opened');
        } else {
          toast.error(
            error?.data?.message || 'Could not open this view-once photo',
          );
        }
      } finally {
        setViewOnceBusy(null);
      }
    };

    const renderContent = (message: TMessage, isCurrentUser: boolean) => {
      const type: TMessageType = message.messageType || 'TEXT';
      const deleted = Boolean(message.isDeleted);

      if (deleted) {
        return (
          <p
            className={`max-w-xs px-4 py-2 text-xs italic rounded-lg border border-dashed ${
              isCurrentUser
                ? 'border-sage-400 text-default-400'
                : 'border-default-300 text-default-400'
            }`}
          >
            This message was deleted
          </p>
        );
      }

      if (editingId === message._id) {
        return (
          <div className="flex items-center gap-1 max-w-xs">
            <input
              ref={editInputRef}
              className="flex-grow min-w-0 px-3 py-2 text-xs rounded-lg border border-sage-400 bg-background text-default-800 outline-none"
              value={editDraft}
              onChange={(e) => setEditDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') saveEdit(message);
                if (e.key === 'Escape') setEditingId(null);
              }}
            />
            <Button
              isIconOnly
              size="sm"
              variant="flat"
              aria-label="Save edit"
              onPress={() => saveEdit(message)}
            >
              <Check className="h-3.5 w-3.5" />
            </Button>
            <Button
              isIconOnly
              size="sm"
              variant="light"
              aria-label="Cancel edit"
              onPress={() => setEditingId(null)}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        );
      }

      switch (type) {
        case 'EMOJI':
          return (
            <p className="max-w-xs px-2 py-1 text-3xl leading-none">
              {message.content}
            </p>
          );

        case 'IMAGE':
          return (
            <a
              href={message.mediaUrl || '#'}
              target="_blank"
              rel="noreferrer"
              className="block relative w-56 h-56 overflow-hidden rounded-lg bg-default-100"
            >
              {message.mediaUrl && (
                <Image
                  src={message.mediaUrl}
                  alt="Shared image"
                  fill
                  sizes="224px"
                  className="object-cover"
                />
              )}
              {message.content && (
                <span className="absolute bottom-0 inset-x-0 bg-black/50 text-white text-[11px] px-2 py-1">
                  {message.content}
                </span>
              )}
            </a>
          );

        case 'VOICE': {
          const duration = message.mediaMeta?.durationSeconds;
          return (
            <div
              className={`flex items-center gap-2 max-w-xs px-3 py-2 rounded-lg ${
                isCurrentUser ? 'bg-sage-600 text-white' : 'bg-default-200'
              }`}
            >
              <Mic className="h-4 w-4 shrink-0" />
              {/* eslint-disable-next-line jsx-a11y/media-has-caption -- user voice notes have no caption track */}
              <audio
                controls
                src={message.mediaUrl || undefined}
                className="h-8 max-w-[180px]"
              />
              {duration ? (
                <span className="text-[10px] opacity-80 shrink-0">
                  {formatDuration(duration)}
                </span>
              ) : null}
            </div>
          );
        }

        case 'LOCATION': {
          const loc = message.location;
          if (!loc) {
            return (
              <p className="max-w-xs px-4 py-2 text-xs rounded-lg bg-default-200">
                Location unavailable
              </p>
            );
          }
          return (
            <a
              href={`https://www.google.com/maps?q=${loc.lat},${loc.lng}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 max-w-xs px-3 py-2 rounded-lg border border-default-200 bg-default-100 hover:bg-default-200 transition-colors"
            >
              <MapPin className="h-8 w-8 shrink-0 text-sage-600 dark:text-sage-400" />
              <span className="flex flex-col text-left">
                <span className="text-xs font-semibold text-default-700">
                  {loc.label || 'Shared location'}
                </span>
                <span className="text-[10px] text-default-500">
                  {loc.lat.toFixed(4)}, {loc.lng.toFixed(4)} · Open in Maps
                </span>
              </span>
            </a>
          );
        }

        case 'LIVE_LOCATION': {
          return (
            <LiveLocationCard
              message={message}
              isMine={isCurrentUser}
              onStop={isCurrentUser ? onStopLiveShare : undefined}
            />
          );
        }

        case 'VIEW_ONCE_IMAGE': {
          const openedUrl = viewOnceUrl[message._id];
          const alreadyOpened = Boolean(message.viewOnceOpened);

          if (openedUrl) {
            return (
              <span className="block relative w-56 h-56 overflow-hidden rounded-lg bg-default-100">
                <Image
                  src={openedUrl}
                  alt="View-once media"
                  fill
                  sizes="224px"
                  className="object-cover"
                />
              </span>
            );
          }

          if (alreadyOpened) {
            return (
              <span className="flex items-center gap-2 max-w-xs px-4 py-3 text-xs rounded-lg border border-dashed border-default-300 text-default-500">
                <Check className="h-4 w-4" /> View-once photo opened
              </span>
            );
          }

          if (isCurrentUser) {
            return (
              <span className="flex items-center gap-2 max-w-xs px-4 py-3 text-xs rounded-lg border border-default-300 bg-default-100 text-default-600">
                <Check className="h-4 w-4" /> View-once photo sent
              </span>
            );
          }

          return (
            <Button
              size="sm"
              variant="flat"
              className="max-w-xs"
              isDisabled={viewOnceBusy === message._id}
              onPress={() => consumeViewOnce(message)}
            >
              {viewOnceBusy === message._id
                ? 'Opening…'
                : 'Tap to open view-once photo'}
            </Button>
          );
        }

        case 'TEXT':
        default:
          return (
            <p
              className={`max-w-xs px-4 py-2 text-xs rounded-lg whitespace-pre-wrap break-words ${
                isCurrentUser
                  ? 'bg-sage-600 text-white'
                  : 'bg-default-200 text-default-800'
              }`}
            >
              {message.content}
              {message.isEdited && (
                <span className="ml-1 text-[9px] opacity-70">(edited)</span>
              )}
            </p>
          );
      }
    };

    return (
      <>
      <ScrollShadow
        size={50}
        ref={scrollRef}
        className="flex-1 min-h-0 p-2 pt-5 space-y-4 overflow-y-auto overscroll-contain scrollbar-hide pb-8"
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

          const canEdit =
            isCurrentUser &&
            !message.isDeleted &&
            (message.messageType === 'TEXT' ||
              message.messageType === 'EMOJI' ||
              !message.messageType);
          const canDelete = isCurrentUser && !message.isDeleted;

          return (
            <div
              key={message._id}
              id={`msg-${message._id}`}
              className={`mb-3 group/msg ${
                flashId === message._id
                  ? 'rounded-lg ring-2 ring-sage-400/70 dark:ring-sage-500/70 transition-all'
                  : ''
              }`}
            >
              {/* Date Separator */}
              {shouldShowDateSeparator && (
                <div className="text-[10px] text-center text-default-500 my-3 border-b border-default-100 w-1/3 mx-auto pb-3">
                  {formatDate(currentMessageTime)}
                </div>
              )}

              <BubbleShell
                isCurrentUser={isCurrentUser}
                shouldShowAvatar={shouldShowAvatar}
                avatarSlot={
                  shouldShowAvatar && (
                    <Avatar
                      name={message.sender.name.charAt(0).toUpperCase()}
                      src={message.sender.image || undefined}
                      className="w-7 h-7"
                    />
                  )
                }
              >
                <div
                  className={`flex items-start gap-1 ${
                    !shouldShowAvatar && !isCurrentUser ? 'ml-7' : ''
                  }`}
                >
                  <div className="min-w-0">
                    {/* Quoted reply block (tap to jump to the original) */}
                    {message.replyTo && !editingId && (
                      <button
                        type="button"
                        onClick={() => scrollToMessage(message.replyTo!._id)}
                        className={`block w-full max-w-xs text-left mb-1 px-2 py-1 rounded border-l-2 transition-colors ${
                          isCurrentUser
                            ? 'bg-white/15 border-white/60 hover:bg-white/25'
                            : 'bg-default-300/40 border-default-400 hover:bg-default-300/70'
                        }`}
                      >
                        <span className="block text-[10px] font-semibold text-default-700 dark:text-default-200">
                          {message.replyTo.sender?.name || 'Unknown'}
                        </span>
                        <span
                          className={`block text-[10px] truncate ${
                            message.replyTo.isDeleted
                              ? 'italic text-default-400'
                              : 'text-default-500 dark:text-default-400'
                          }`}
                        >
                          {replyPreviewText(message.replyTo)}
                        </span>
                      </button>
                    )}

                    {renderContent(message, isCurrentUser)}
                  </div>

                  {/* Message actions: 3-dot menu (Reply / Edit / Remove) */}
                  {!message.isDeleted && editingId !== message._id && (
                    <div className="opacity-60 group-hover/msg:opacity-100 focus-within:opacity-100 transition-opacity pt-1">
                      <Dropdown placement={isCurrentUser ? 'left' : 'right'}>
                        <DropdownTrigger>
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            className="h-6 min-w-6"
                            aria-label="Message actions"
                          >
                            <MoreVertical className="h-3.5 w-3.5 text-default-500" />
                          </Button>
                        </DropdownTrigger>
                        <DropdownMenu
                          aria-label="Message actions"
                          onAction={(key) => {
                            if (key === 'reply') onReply?.(message);
                            if (key === 'edit') startEdit(message);
                            if (key === 'remove') setRemoveTarget(message);
                          }}
                        >
                          <DropdownItem
                            key="reply"
                            startContent={
                              <CornerUpLeft className="h-4 w-4" />
                            }
                          >
                            Reply
                          </DropdownItem>
                          <DropdownItem
                            key="edit"
                            isDisabled={!canEdit}
                            startContent={<Pencil className="h-4 w-4" />}
                          >
                            Edit
                          </DropdownItem>
                          <DropdownItem
                            key="remove"
                            isDisabled={!canDelete}
                            color="danger"
                            startContent={<Trash2 className="h-4 w-4" />}
                          >
                            Remove for everyone
                          </DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                    </div>
                  )}
                </div>
              </BubbleShell>

              {/* Show message timestamp only if it's the last in a group */}
              {showTime && (
                <p
                  className={`text-[10px] text-gray-400 ml-10 ${
                    isCurrentUser ? 'text-right mr-2' : ''
                  }`}
                >
                  {format(currentMessageTime, 'h:mm a')}
                  {message.isEdited && !message.isDeleted
                    ? ' · edited'
                    : ''}
                </p>
              )}
            </div>
          );
        })}
        {/* Typing animation, show only if the typing indicator is for the other user */}
        {isTyping && <TypingAnimation />}
      </ScrollShadow>

      {/* Remove-for-everyone confirmation */}
      <Modal
        isOpen={Boolean(removeTarget)}
        onOpenChange={(open) => {
          if (!open) setRemoveTarget(null);
        }}
        size="sm"
        hideCloseButton
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 text-base">
                Remove this message?
              </ModalHeader>
              <ModalBody>
                <p className="text-sm text-default-600">
                  This will remove the message for everyone in this chat. This
                  action cannot be undone.
                </p>
                {removeTarget && (
                  <p className="text-xs text-default-400 truncate border-l-2 border-default-300 pl-2">
                    {removeTarget.messageType === 'IMAGE'
                      ? 'Photo'
                      : removeTarget.messageType === 'VOICE'
                        ? 'Voice message'
                        : removeTarget.messageType === 'LOCATION'
                          ? 'Location'
                          : removeTarget.messageType === 'LIVE_LOCATION'
                            ? 'Live location'
                            : removeTarget.messageType === 'VIEW_ONCE_IMAGE'
                              ? 'View-once photo'
                              : removeTarget.content}
                  </p>
                )}
              </ModalBody>
              <ModalFooter>
                <Button size="sm" variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  color="danger"
                  onPress={() => {
                    if (removeTarget) void removeMessage(removeTarget);
                    onClose();
                  }}
                >
                  Remove for everyone
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      </>
    );
  }
);

ScrollableChat.displayName = 'ScrollableChat';

export default ScrollableChat;
