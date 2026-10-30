"use client";

import React, { useState, useEffect } from "react";
import { ReactionPicker, ReactionType } from "./ReactionPicker";
import { ReactionSummaryDisplay } from "./ReactionSummary";
import { ShareModalNew } from "./ShareModal";
import { useGetReactionSummaryQuery, useSetReactionMutation, useRemoveReactionMutation } from "@/src/redux/features/post/postApi";
import { useGetCommentsForPostsQuery } from "@/src/redux/features/post/commentApi";
import { useIsConnected } from "@/src/context/isConnectProvider";
import { toast } from "sonner";

interface PostEngagementProps {
  postId: string;
  postTitle?: string;
  postDescription?: string;
  postImage?: string;
  postUrl: string;
  targetType?: "post" | "short";
  commentCount?: number;
  onCommentClick?: () => void;
  className?: string;
}

export const PostEngagement: React.FC<PostEngagementProps> = ({
  postId,
  postTitle,
  postDescription,
  postImage,
  postUrl,
  targetType = "post",
  commentCount: propCommentCount = 0,
  onCommentClick,
  className = "",
}) => {
  const { socket } = useIsConnected();
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [optimisticReaction, setOptimisticReaction] = useState<ReactionType | null>(null);

  // Queries & mutations
  const { data: reactionData, refetch } = useGetReactionSummaryQuery({
    targetType,
    targetId: postId,
  });

  // Fetch comments to get accurate total count (including replies)
  const { data: commentsData } = useGetCommentsForPostsQuery({ postId });

  // Calculate accurate comment count (all non-deleted comments + replies)
  const commentCount = commentsData?.data?.filter((c: { isDeleted: boolean }) => !c.isDeleted).length || propCommentCount;

  const [setReaction, { isLoading: isSettingReaction }] = useSetReactionMutation();
  const [removeReaction, { isLoading: isRemovingReaction }] = useRemoveReactionMutation();

  const reactionSummary = reactionData?.data;
  const currentReaction = optimisticReaction || reactionSummary?.myReaction;

  // Real-time updates
  useEffect(() => {
    if (!socket) return;

    const handleReactionUpdate = () => {
      refetch();
      setOptimisticReaction(null);
    };

    socket.on(`reaction:update:${targetType}:${postId}`, handleReactionUpdate);

    return () => {
      socket.off(`reaction:update:${targetType}:${postId}`, handleReactionUpdate);
    };
  }, [socket, targetType, postId, refetch]);

  const handleReactionSelect = async (type: ReactionType) => {
    // Optimistic update
    const previousReaction = currentReaction;

    setOptimisticReaction(type);

    try {
      await setReaction({
        targetType,
        targetId: postId,
        type,
      }).unwrap();
      // Success - keep optimistic update until socket event arrives
    } catch (error) {
      // Rollback on failure
      setOptimisticReaction(previousReaction);
      toast.error("Failed to react");
    }
  };

  const handleReactionRemove = async () => {
    // Optimistic update
    const previousReaction = currentReaction;

    setOptimisticReaction(null);

    try {
      await removeReaction({
        targetType,
        targetId: postId,
      }).unwrap();
      // Success - keep optimistic update until socket event arrives
    } catch (error) {
      // Rollback on failure
      setOptimisticReaction(previousReaction);
      toast.error("Failed to remove reaction");
    }
  };

  const isLoading = isSettingReaction || isRemovingReaction;

  return (
    <>
      <div className={`border-t border-borderSubtle ${className}`}>
        {/* Reaction summary */}
        {reactionSummary && reactionSummary.total > 0 && (
          <div className='px-4 py-2'>
            <ReactionSummaryDisplay summary={reactionSummary} onReactionTypeClick={(type) => handleReactionSelect(type)} />
          </div>
        )}

        {/* Action buttons */}
        <div className='flex items-center gap-1 px-2 py-2 border-t border-borderSubtle'>
          {/* Reaction picker */}
          <div className={`flex-1 ${isLoading ? "opacity-50 pointer-events-none" : ""}`}>
            <ReactionPicker
              currentReaction={currentReaction}
              onReactionSelect={handleReactionSelect}
              onReactionRemove={handleReactionRemove}
              trigger='hover'
              position='top'
              className='w-full justify-center'
            />
          </div>

          {/* Comment button */}
          <button
            onClick={onCommentClick}
            className='
              flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg
              text-textSecondary hover:text-sage-600 dark:hover:text-sage-400
              hover:bg-sage-50 dark:hover:bg-sage-900/20
              transition-all duration-200
            '
          >
            <svg className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'
              />
            </svg>
            <span className='text-sm font-medium'>{commentCount > 0 ? `Comment (${commentCount})` : "Comment"}</span>
          </button>

          {/* Share button */}
          <button
            onClick={() => setIsShareModalOpen(true)}
            className='
              flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg
              text-textSecondary hover:text-sage-600 dark:hover:text-sage-400
              hover:bg-sage-50 dark:hover:bg-sage-900/20
              transition-all duration-200
            '
          >
            <svg className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z'
              />
            </svg>
            <span className='text-sm font-medium'>Share</span>
          </button>
        </div>
      </div>

      {/* Share modal */}
      <ShareModalNew
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        content={{
          type: targetType,
          id: postId,
          title: postTitle,
          description: postDescription,
          image: postImage,
          url: postUrl,
        }}
      />
    </>
  );
};
