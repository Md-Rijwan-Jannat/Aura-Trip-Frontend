"use client";

import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGetUserChatQuery } from "@/src/redux/features/message/chatApi";
import { useCreateMessageMutation } from "@/src/redux/features/message/messageApi";
import { useSharePostToFeedMutation } from "@/src/redux/features/post/postApi";
import { useGetAllGroupsQuery } from "@/src/redux/features/group/groupApi";
import { useCreateStoryMutation } from "@/src/redux/features/story/storyApi";
import { useUser } from "@/src/hooks/useUser";
import { toast } from "sonner";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  X,
  Send,
  Link as LinkIcon,
  Copy,
  Check,
  Share2,
  MessageCircle,
  Users,
  Globe,
  Lock,
  UserCheck,
  Image as ImageIcon,
} from "lucide-react";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: {
    type: "post" | "short";
    id: string;
    title?: string;
    description?: string;
    image?: string;
    url: string;
    authorName?: string;
  };
}

interface Chat {
  _id: string;
  chatName?: string;
  isGroupChat: boolean;
  users: Array<{
    _id: string;
    name: string;
    image?: string;
  }>;
  latestMessage?: {
    content: string;
    createdAt: string;
  };
}

interface Group {
  _id: string;
  name: string;
  slug: string;
  coverImage?: string;
  description?: string;
  memberCount?: number;
  visibility: "PUBLIC" | "PRIVATE";
}

type AudienceType = "PUBLIC" | "FRIENDS" | "PRIVATE";

export const ShareModalNew: React.FC<ShareModalProps> = ({ isOpen, onClose, content }) => {
  const { userInfo } = useUser();
  const [shareCaption, setShareCaption] = useState("");
  const [audience, setAudience] = useState<AudienceType>("PUBLIC");
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());
  const [messengerMessage, setMessengerMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [showAudienceMenu, setShowAudienceMenu] = useState(false);
  const [contactScrollPosition, setContactScrollPosition] = useState(0);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

  const { data: chatsData, isLoading: isLoadingChats } = useGetUserChatQuery(undefined);
  const { data: groupsData } = useGetAllGroupsQuery({});
  const [createMessage] = useCreateMessageMutation();
  const [sharePostToFeed] = useSharePostToFeedMutation();
  const [createStory] = useCreateStoryMutation();

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setShareCaption("");
      setAudience("PUBLIC");
      setSelectedContacts(new Set());
      setMessengerMessage("");
      setSearchQuery("");
      setCopySuccess(false);
      setContactScrollPosition(0);
      setSelectedGroup(null);
    }
  }, [isOpen]);

  const chats: Chat[] = useMemo(() => {
    return chatsData?.data || [];
  }, [chatsData]);

  const groups: Group[] = useMemo(() => {
    return groupsData?.data || [];
  }, [groupsData]);

  const filteredChats = useMemo(() => {
    if (!searchQuery.trim()) return chats;
    const query = searchQuery.toLowerCase();

    return chats.filter((chat) => {
      const chatName = chat.chatName?.toLowerCase() || "";
      const userNames = chat.users.map((u) => u.name.toLowerCase()).join(" ");

      return chatName.includes(query) || userNames.includes(query);
    });
  }, [chats, searchQuery]);

  const toggleContactSelection = (chatId: string) => {
    const newSelection = new Set(selectedContacts);

    if (newSelection.has(chatId)) {
      newSelection.delete(chatId);
    } else {
      newSelection.add(chatId);
    }
    setSelectedContacts(newSelection);
  };

  const getChatDisplayName = (chat: Chat) => {
    if (chat.chatName) return chat.chatName;
    const otherUsers = chat.users.filter((u) => u._id !== userInfo?._id);

    return otherUsers.map((u) => u.name).join(", ");
  };

  const getChatAvatar = (chat: Chat) => {
    const otherUsers = chat.users.filter((u) => u._id !== userInfo?._id);

    return otherUsers[0]?.image;
  };

  const getChatInitials = (chat: Chat) => {
    const name = getChatDisplayName(chat);

    return name
      .split(" ")
      .slice(0, 2)
      .map((n) => n.charAt(0).toUpperCase())
      .join("");
  };

  const handleShareToFeed = async () => {
    if (!shareCaption.trim()) {
      toast.error("Please add a caption to share");

      return;
    }

    setIsSending(true);
    try {
      await sharePostToFeed({
        postId: content.id,
        caption: shareCaption,
        audience,
      }).unwrap();
      toast.success("Shared to your feed!");
      onClose();
    } catch (error) {
      console.error("Share error:", error);
      toast.error("Failed to share to feed");
    } finally {
      setIsSending(false);
    }
  };

  const handleSendToMessenger = async () => {
    if (selectedContacts.size === 0) {
      toast.error("Please select at least one conversation");

      return;
    }

    setIsSending(true);
    try {
      const promises = Array.from(selectedContacts).map((chatId) =>
        createMessage({
          chat: chatId,
          messageType: content.type === "post" ? "SHARED_POST" : "SHARED_SHORT",
          content: messengerMessage.trim() || `Check out this ${content.type}!`,
          sharedContent: {
            entityType: content.type,
            entityId: content.id,
            title: content.title || null,
            previewUrl: content.image || null,
            authorName: content.authorName || null,
          },
        }).unwrap(),
      );

      await Promise.all(promises);
      toast.success(`Shared to ${selectedContacts.size} conversation${selectedContacts.size > 1 ? "s" : ""}!`);
      onClose();
    } catch (error) {
      console.error("Share error:", error);
      toast.error("Failed to share to some conversations");
    } finally {
      setIsSending(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(content.url);
      setCopySuccess(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };

  const handleShareExternal = (platform: string) => {
    const text = content.title ? `${content.title}\n\n${content.url}` : content.url;
    const encodedText = encodeURIComponent(text);
    const encodedUrl = encodeURIComponent(content.url);

    const shareUrls: Record<string, string> = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      whatsapp: `https://wa.me/?text=${encodedText}`,
      telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodeURIComponent(content.title || "")}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodedText}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      instagram: `https://www.instagram.com/`, // Instagram doesn't support direct sharing URLs
    };

    const url = shareUrls[platform];

    if (url) {
      window.open(url, "_blank", "noopener,noreferrer,width=600,height=600");
    }
  };

  const handleNativeShare = async () => {
    if (!navigator.share) {
      toast.error("Sharing not supported on this device");

      return;
    }

    try {
      await navigator.share({
        title: content.title || `Check out this ${content.type}`,
        text: content.description,
        url: content.url,
      });
    } catch (error: any) {
      if (error.name !== "AbortError") {
        toast.error("Failed to share");
      }
    }
  };

  const handleShareToStory = async () => {
    if (!content.image) {
      toast.error("Cannot share to story without an image");

      return;
    }

    try {
      await createStory({ media: content.image }).unwrap();
      toast.success("Shared to your story!");
      onClose();
    } catch (error) {
      toast.error("Failed to share to story");
    }
  };

  const handleShareToGroup = async () => {
    toast.info("Group sharing coming soon! Select a group and share the content there.");
  };

  const handleShareToFriendProfile = () => {
    toast.info("This feature allows sharing to a friend's timeline (if they permit it in their settings).");
  };

  const scrollContacts = (direction: "left" | "right") => {
    const container = document.getElementById("contact-carousel");

    if (container) {
      const scrollAmount = 200;
      const newPosition = direction === "left" ? Math.max(0, contactScrollPosition - scrollAmount) : contactScrollPosition + scrollAmount;

      container.scrollLeft = newPosition;
      setContactScrollPosition(newPosition);
    }
  };

  const audienceIcons = {
    PUBLIC: <Globe className='w-4 h-4' />,
    FRIENDS: <UserCheck className='w-4 h-4' />,
    PRIVATE: <Lock className='w-4 h-4' />,
  };

  const audienceLabels = {
    PUBLIC: "Public",
    FRIENDS: "Friends",
    PRIVATE: "Only me",
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className='fixed inset-0 bg-black/60 dark:bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm'
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ duration: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
          onClick={(e) => e.stopPropagation()}
          className='bg-white dark:bg-surface rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col border border-borderSubtle'
        >
          {/* Header */}
          <div className='px-6 py-4 border-b border-borderSubtle bg-gradient-to-r from-sage-50 to-white dark:from-gray-900 dark:to-gray-900/50'>
            <div className='flex items-center justify-between'>
              <h2 className='text-xl font-bold text-textMain flex items-center gap-2'>
                <Share2 className='w-5 h-5 text-sage-600 dark:text-sage-400' />
                Share
              </h2>
              <button
                onClick={onClose}
                className='text-textSecondary hover:text-textMain transition-colors p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800'
                aria-label='Close'
              >
                <X className='w-5 h-5' />
              </button>
            </div>
          </div>

          {/* Main Content - Scrollable */}
          <div className='flex-1 overflow-y-auto'>
            {/* Share Composer */}
            <div className='p-6 space-y-4 border-b border-borderSubtle bg-white dark:bg-surface'>
              {/* User Info */}
              <div className='flex items-center gap-3'>
                <div className='w-10 h-10 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0'>
                  {userInfo?.image ? (
                    <Image src={userInfo.image} alt={userInfo.name} width={40} height={40} className='object-cover' />
                  ) : (
                    <div className='w-full h-full flex items-center justify-center text-lg font-semibold text-white bg-sage-600'>
                      {userInfo?.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className='flex-1'>
                  <p className='font-semibold text-textMain text-sm'>{userInfo?.name}</p>
                  {/* Audience Selector */}
                  <div className='relative inline-block'>
                    <button
                      onClick={() => setShowAudienceMenu(!showAudienceMenu)}
                      className='flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-textSecondary'
                    >
                      {audienceIcons[audience]}
                      <span>{audienceLabels[audience]}</span>
                      <ChevronRight className='w-3 h-3' />
                    </button>

                    {showAudienceMenu && (
                      <div className='absolute top-full left-0 mt-1 bg-white dark:bg-surface border border-borderSubtle rounded-lg shadow-lg py-1 z-10 min-w-[140px]'>
                        {(Object.keys(audienceLabels) as AudienceType[]).map((key) => (
                          <button
                            key={key}
                            onClick={() => {
                              setAudience(key);
                              setShowAudienceMenu(false);
                            }}
                            className='w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-sm text-textMain'
                          >
                            {audienceIcons[key]}
                            <span>{audienceLabels[key]}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Caption Input */}
              <textarea
                value={shareCaption}
                onChange={(e) => setShareCaption(e.target.value)}
                placeholder='Say something about this...'
                rows={3}
                className='w-full px-4 py-3 rounded-lg border border-borderSubtle focus:border-sage-500 focus:ring-2 focus:ring-sage-500/20 outline-none transition-colors resize-none text-sm text-textMain placeholder-textSecondary bg-white dark:bg-gray-900'
              />

              {/* Action Buttons */}
              <div className='flex items-center justify-between gap-2'>
                <button
                  type='button'
                  className='px-4 py-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm text-textMain flex items-center gap-1.5'
                  onClick={() => {
                    // Emoji picker functionality - you can integrate emoji-picker-react or similar
                    toast.info("Emoji picker coming soon!");
                  }}
                >
                  <span className='text-base'>😊</span>
                  <span>Add emoji</span>
                </button>
                <button
                  onClick={handleShareToFeed}
                  disabled={isSending || !shareCaption.trim()}
                  className='flex-1 py-2 w-auto rounded-full font-semibold text-sm bg-sage-600 text-white hover:bg-sage-700 dark:hover:bg-sage-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2'
                >
                  {isSending ? (
                    <>
                      <div className='animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent' />
                      Sharing...
                    </>
                  ) : (
                    <>
                      <Send className='w-4 h-4' />
                      Share Now
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Send in Messenger */}
            <div className='p-6 space-y-4 border-b border-borderSubtle bg-gray-50/50 dark:bg-gray-900/20'>
              <div className='flex items-center justify-between'>
                <h3 className='font-semibold text-textMain flex items-center gap-2'>
                  <MessageCircle className='w-4 h-4 text-sage-600 dark:text-sage-400' />
                  Send in Messenger
                </h3>
              </div>

              {/* Contact Carousel */}
              <div className='relative'>
                {filteredChats.length > 4 && (
                  <button
                    onClick={() => scrollContacts("left")}
                    className='absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-gray-800 rounded-full p-1.5 shadow-md hover:bg-gray-100 dark:hover:bg-gray-700'
                  >
                    <ChevronLeft className='w-4 h-4' />
                  </button>
                )}

                <div
                  id='contact-carousel'
                  className='flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth'
                  style={{ scrollBehavior: "smooth" }}
                >
                  {isLoadingChats ? (
                    <div className='flex items-center justify-center py-8 w-full'>
                      <div className='animate-spin rounded-full h-6 w-6 border-2 border-sage-600 border-t-transparent' />
                    </div>
                  ) : filteredChats.length === 0 ? (
                    <div className='text-center py-8 w-full text-sm text-textSecondary'>No conversations yet</div>
                  ) : (
                    filteredChats.slice(0, 10).map((chat) => {
                      const isSelected = selectedContacts.has(chat._id);
                      const chatAvatar = getChatAvatar(chat);
                      const chatInitials = getChatInitials(chat);

                      return (
                        <button
                          key={chat._id}
                          onClick={() => toggleContactSelection(chat._id)}
                          className='flex-shrink-0 flex flex-col items-center gap-2'
                        >
                          <div className='relative'>
                            <div
                              className={`w-14 h-14 rounded-full overflow-hidden border-2 transition-all ${
                                isSelected ? "border-sage-600 ring-2 ring-sage-600/30" : "border-gray-200 dark:border-gray-700"
                              }`}
                            >
                              {chatAvatar ? (
                                <Image
                                  src={chatAvatar}
                                  alt={getChatDisplayName(chat)}
                                  width={56}
                                  height={56}
                                  className='object-cover w-full h-full'
                                />
                              ) : (
                                <div className='w-full h-full flex items-center justify-center text-lg font-semibold text-white bg-sage-600'>
                                  {chatInitials}
                                </div>
                              )}
                            </div>
                            {isSelected && (
                              <div className='absolute -bottom-1 -right-1 w-5 h-5 bg-sage-600 rounded-full flex items-center justify-center border-2 border-white dark:border-surface'>
                                <Check className='w-3 h-3 text-white' />
                              </div>
                            )}
                          </div>
                          <span className='text-xs text-textMain max-w-[60px] truncate'>{getChatDisplayName(chat).split(",")[0]}</span>
                        </button>
                      );
                    })
                  )}
                </div>

                {filteredChats.length > 4 && (
                  <button
                    onClick={() => scrollContacts("right")}
                    className='absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-gray-800 rounded-full p-1.5 shadow-md hover:bg-gray-100 dark:hover:bg-gray-700'
                  >
                    <ChevronRight className='w-4 h-4' />
                  </button>
                )}
              </div>

              {/* Send Button */}
              {selectedContacts.size > 0 && (
                <div className='space-y-3'>
                  <input
                    type='text'
                    value={messengerMessage}
                    onChange={(e) => setMessengerMessage(e.target.value)}
                    placeholder='Add a message (optional)...'
                    className='w-full px-4 py-2 rounded-lg border border-borderSubtle focus:border-sage-500 focus:ring-2 focus:ring-sage-500/20 outline-none transition-colors text-sm text-textMain placeholder-textSecondary bg-white dark:bg-gray-900'
                  />
                  <button
                    onClick={handleSendToMessenger}
                    disabled={isSending}
                    className='w-full py-2.5 rounded-lg font-semibold text-sm bg-sage-600 text-white hover:bg-sage-700 dark:hover:bg-sage-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2'
                  >
                    {isSending ? (
                      <>
                        <div className='animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent' />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className='w-4 h-4' />
                        Send to {selectedContacts.size} {selectedContacts.size === 1 ? "person" : "people"}
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Share To - Quick Actions */}
            <div className='px-6 py-6 space-y-4'>
              <h3 className='font-semibold text-textMain'>Share To</h3>

              {/* Horizontal Scrollable Buttons */}
              <div className='flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth pb-2'>
                {/* Messenger */}
                <button
                  onClick={() => {
                    // Scroll to messenger section
                    document.getElementById("contact-carousel")?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className='flex-shrink-0 flex flex-col items-center gap-2 w-16'
                >
                  <div className='w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white'>
                    <MessageCircle className='w-6 h-6' />
                  </div>
                  <span className='text-xs font-medium text-textMain text-center leading-tight'>Messenger</span>
                </button>

                {/* WhatsApp */}
                <button onClick={() => handleShareExternal("whatsapp")} className='flex-shrink-0 flex flex-col items-center gap-2 w-16'>
                  <div className='w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center text-white'>
                    <svg className='w-6 h-6' fill='currentColor' viewBox='0 0 24 24'>
                      <path d='M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z' />
                    </svg>
                  </div>
                  <span className='text-xs font-medium text-textMain text-center leading-tight'>WhatsApp</span>
                </button>

                {/* Your Story */}
                <button
                  onClick={handleShareToStory}
                  disabled={!content.image}
                  className='flex-shrink-0 flex flex-col items-center gap-2 w-16 disabled:opacity-50'
                >
                  <div className='w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white'>
                    <ImageIcon className='w-6 h-6' />
                  </div>
                  <span className='text-xs font-medium text-textMain text-center leading-tight'>Story</span>
                </button>

                {/* Copy Link */}
                <button onClick={handleCopyLink} className='flex-shrink-0 flex flex-col items-center gap-2 w-16'>
                  <div className='w-10 h-10 rounded-full bg-gray-600 dark:bg-gray-500 flex items-center justify-center text-white'>
                    {copySuccess ? <Check className='w-6 h-6' /> : <Copy className='w-6 h-6' />}
                  </div>
                  <span className='text-xs font-medium text-textMain text-center leading-tight'>{copySuccess ? "Copied!" : "Copy"}</span>
                </button>

                {/* Group */}
                <button onClick={handleShareToGroup} className='flex-shrink-0 flex flex-col items-center gap-2 w-16'>
                  <div className='w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white'>
                    <Users className='w-6 h-6' />
                  </div>
                  <span className='text-xs font-medium text-textMain text-center leading-tight'>Group</span>
                </button>

                {/* Friend's Profile */}
                <button onClick={handleShareToFriendProfile} className='flex-shrink-0 flex flex-col items-center gap-2 w-16'>
                  <div className='w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center text-white'>
                    <UserCheck className='w-6 h-6' />
                  </div>
                  <span className='text-xs font-medium text-textMain text-center leading-tight'>Friend</span>
                </button>

                {/* Facebook */}
                <button onClick={() => handleShareExternal("facebook")} className='flex-shrink-0 flex flex-col items-center gap-2 w-16'>
                  <div className='w-10 h-10 rounded-full bg-[#1877F2] flex items-center justify-center text-white'>
                    <svg className='w-6 h-6' fill='currentColor' viewBox='0 0 24 24'>
                      <path d='M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' />
                    </svg>
                  </div>
                  <span className='text-xs font-medium text-textMain text-center leading-tight'>Facebook</span>
                </button>

                {/* Twitter */}
                <button onClick={() => handleShareExternal("twitter")} className='flex-shrink-0 flex flex-col items-center gap-2 w-16'>
                  <div className='w-10 h-10 rounded-full bg-black dark:bg-white flex items-center justify-center'>
                    <svg className='w-6 h-6 text-white dark:text-black' fill='currentColor' viewBox='0 0 24 24'>
                      <path d='M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' />
                    </svg>
                  </div>
                  <span className='text-xs font-medium text-textMain text-center leading-tight'>Twitter</span>
                </button>

                {/* Telegram */}
                <button onClick={() => handleShareExternal("telegram")} className='flex-shrink-0 flex flex-col items-center gap-2 w-16'>
                  <div className='w-10 h-10 rounded-full bg-[#0088cc] flex items-center justify-center text-white'>
                    <svg className='w-6 h-6' fill='currentColor' viewBox='0 0 24 24'>
                      <path d='M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z' />
                    </svg>
                  </div>
                  <span className='text-xs font-medium text-textMain text-center leading-tight'>Telegram</span>
                </button>

                {/* LinkedIn */}
                <button onClick={() => handleShareExternal("linkedin")} className='flex-shrink-0 flex flex-col items-center gap-2 w-16'>
                  <div className='w-10 h-10 rounded-full bg-[#0077B5] flex items-center justify-center text-white'>
                    <svg className='w-6 h-6' fill='currentColor' viewBox='0 0 24 24'>
                      <path d='M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z' />
                    </svg>
                  </div>
                  <span className='text-xs font-medium text-textMain text-center leading-tight'>LinkedIn</span>
                </button>

                {/* More Apps */}
                {typeof navigator !== "undefined" && typeof navigator.share !== "undefined" && (
                  <button onClick={handleNativeShare} className='flex-shrink-0 flex flex-col items-center gap-2 w-16'>
                    <div className='w-10 h-10 rounded-full bg-sage-600 flex items-center justify-center text-white'>
                      <Share2 className='w-6 h-6' />
                    </div>
                    <span className='text-xs font-medium text-textMain text-center leading-tight'>More</span>
                  </button>
                )}

                {/* Your Story */}
                <button
                  onClick={handleShareToStory}
                  disabled={!content.image}
                  className='flex-shrink-0 flex flex-col items-center gap-2 w-16'
                >
                  <div className='w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white'>
                    <ImageIcon className='w-5 h-5' />
                  </div>
                  <span className='text-xs font-medium text-purple-700 dark:text-purple-300 text-center leading-tight'>Story</span>
                </button>

                {/* Copy Link */}
                <button onClick={handleCopyLink} className='flex-shrink-0 flex flex-col items-center gap-2 w-16'>
                  <div className='w-10 h-10 rounded-full bg-gray-600 dark:bg-gray-500 flex items-center justify-center text-white'>
                    {copySuccess ? <Check className='w-5 h-5' /> : <Copy className='w-5 h-5' />}
                  </div>
                  <span className='text-xs font-medium text-gray-700 dark:text-gray-300 text-center leading-tight'>
                    {copySuccess ? "Copied!" : "Copy"}
                  </span>
                </button>

                {/* Group */}
                <button onClick={handleShareToGroup} className='flex-shrink-0 flex flex-col items-center gap-2 w-16'>
                  <div className='w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white'>
                    <Users className='w-5 h-5' />
                  </div>
                  <span className='text-xs font-medium text-orange-700 dark:text-orange-300 text-center leading-tight'>Group</span>
                </button>

                {/* Friend's Profile */}
                <button onClick={handleShareToFriendProfile} className='flex-shrink-0 flex flex-col items-center gap-2 w-16'>
                  <div className='w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center text-white'>
                    <UserCheck className='w-5 h-5' />
                  </div>
                  <span className='text-xs font-medium text-teal-700 dark:text-teal-300 text-center leading-tight'>Friend</span>
                </button>

                {/* Facebook */}
                <button onClick={() => handleShareExternal("facebook")} className='flex-shrink-0 flex flex-col items-center gap-2 w-16'>
                  <div className='w-10 h-10 rounded-full bg-[#1877F2] flex items-center justify-center text-white'>
                    <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 24 24'>
                      <path d='M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' />
                    </svg>
                  </div>
                  <span className='text-xs font-medium text-blue-700 dark:text-blue-300 text-center leading-tight'>Facebook</span>
                </button>

                {/* Twitter */}
                <button onClick={() => handleShareExternal("twitter")} className='flex-shrink-0 flex flex-col items-center gap-2 w-16'>
                  <div className='w-10 h-10 rounded-full bg-black dark:bg-white flex items-center justify-center'>
                    <svg className='w-5 h-5 text-white dark:text-black' fill='currentColor' viewBox='0 0 24 24'>
                      <path d='M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' />
                    </svg>
                  </div>
                  <span className='text-xs font-medium text-gray-700 dark:text-gray-300 text-center leading-tight'>Twitter</span>
                </button>

                {/* Telegram */}
                <button onClick={() => handleShareExternal("telegram")} className='flex-shrink-0 flex flex-col items-center gap-2 w-16'>
                  <div className='w-10 h-10 rounded-full bg-[#0088cc] flex items-center justify-center text-white'>
                    <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 24 24'>
                      <path d='M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z' />
                    </svg>
                  </div>
                  <span className='text-xs font-medium text-blue-700 dark:text-blue-300 text-center leading-tight'>Telegram</span>
                </button>

                {/* LinkedIn */}
                <button onClick={() => handleShareExternal("linkedin")} className='flex-shrink-0 flex flex-col items-center gap-2 w-16'>
                  <div className='w-10 h-10 rounded-full bg-[#0077B5] flex items-center justify-center text-white'>
                    <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 24 24'>
                      <path d='M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z' />
                    </svg>
                  </div>
                  <span className='text-xs font-medium text-blue-700 dark:text-blue-300 text-center leading-tight'>LinkedIn</span>
                </button>

                {/* More Apps */}
                {typeof navigator !== "undefined" && typeof navigator.share !== "undefined" && (
                  <button onClick={handleNativeShare} className='flex-shrink-0 flex flex-col items-center gap-2 w-16'>
                    <div className='w-10 h-10 rounded-full bg-sage-600 flex items-center justify-center text-white'>
                      <Share2 className='w-5 h-5' />
                    </div>
                    <span className='text-xs font-medium text-sage-700 dark:text-sage-300 text-center leading-tight'>More</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
