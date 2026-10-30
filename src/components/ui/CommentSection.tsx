"use client";

import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ReactionType, REACTIONS, ReactionPicker } from "./ReactionPicker";
import { CommentMenu } from "./CommentMenu";
import {
  useGetCommentsForPostsQuery,
  useAddCommentsForPostsMutation,
  useReplayCommentsForPostsMutation,
  useDeleteCommentsForPostsMutation,
  useUpdateCommentsForPostsMutation,
  useSetHighlightedCommentMutation,
} from "@/src/redux/features/post/commentApi";
import { useGetReactionSummaryQuery, useSetReactionMutation, useRemoveReactionMutation } from "@/src/redux/features/post/postApi";
import { useUser } from "@/src/hooks/useUser";
import { toast } from "sonner";
import Image from "next/image";
import { useIsConnected } from "@/src/context/isConnectProvider";

interface Comment {
  _id: string;
  user: {
    _id: string;
    name: string;
    image?: string;
  };
  text: string;
  images?: string[];
  createdAt: string;
  editedAt?: string;
  isDeleted: boolean;
  parentComment?: string;
  replies?: Comment[];
}

interface CommentSectionProps {
  postId: string;
  postOwnerId: string;
  className?: string;
}

type SortMode = "TOP" | "NEWEST" | "OLDEST";

export const CommentSection: React.FC<CommentSectionProps> = ({ postId, postOwnerId, className = "" }) => {
  const { userInfo } = useUser();
  const { socket } = useIsConnected();
  const [sortMode, setSortMode] = useState<SortMode>("TOP");
  const [commentText, setCommentText] = useState("");
  const [replyingTo, setReplyingTo] = useState<{ id: string; name: string } | null>(null);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [collapsedThreads, setCollapsedThreads] = useState<Set<string>>(new Set());

  // Queries & mutations
  const { data: commentsData, refetch } = useGetCommentsForPostsQuery({ postId, sort: sortMode });
  const [addComment, { isLoading: isAddingComment }] = useAddCommentsForPostsMutation();
  const [replyToComment, { isLoading: isReplying }] = useReplayCommentsForPostsMutation();
  const [deleteComment] = useDeleteCommentsForPostsMutation();
  const [updateComment] = useUpdateCommentsForPostsMutation();
  const [setHighlightedComment] = useSetHighlightedCommentMutation();

  const comments: Comment[] = commentsData?.data || [];
  const featuredCommentId = commentsData?.meta?.featuredCommentId;
  const featuredMode = commentsData?.meta?.featuredMode;

  const isPostOwner = userInfo?._id === postOwnerId;

  // Real-time updates
  useEffect(() => {
    if (!socket) return;

    const handleNewComment = () => {
      refetch();
    };

    const handleCommentUpdate = () => {
      refetch();
    };

    socket.on(`comment:new:${postId}`, handleNewComment);
    socket.on(`comment:update:${postId}`, handleCommentUpdate);

    return () => {
      socket.off(`comment:new:${postId}`, handleNewComment);
      socket.off(`comment:update:${postId}`, handleCommentUpdate);
    };
  }, [socket, postId, refetch]);

  // Build comment tree
  // Build comment tree and calculate accurate total count
  const { commentTree, totalCount } = useMemo(() => {
    const topLevel: Comment[] = [];
    const repliesMap = new Map<string, Comment[]>();

    comments.forEach((comment) => {
      if (comment.parentComment) {
        const existing = repliesMap.get(comment.parentComment) || [];

        repliesMap.set(comment.parentComment, [...existing, comment]);
      } else {
        topLevel.push(comment);
      }
    });

    const tree = topLevel.map((comment) => ({
      ...comment,
      replies: repliesMap.get(comment._id) || [],
    }));

    // Count all non-deleted comments and replies
    const total = comments.filter((c) => !c.isDeleted).length;

    return { commentTree: tree, totalCount: total };
  }, [comments]);

  const toggleThreadCollapse = (commentId: string) => {
    const newCollapsed = new Set(collapsedThreads);

    if (newCollapsed.has(commentId)) {
      newCollapsed.delete(commentId);
    } else {
      newCollapsed.add(commentId);
    }
    setCollapsedThreads(newCollapsed);
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) {
      toast.error("Comment cannot be empty");

      return;
    }

    try {
      if (replyingTo) {
        await replyToComment({
          commentId: replyingTo.id,
          data: { text: commentText },
        }).unwrap();
        toast.success("Reply added");
      } else {
        await addComment({
          post: postId,
          text: commentText,
        }).unwrap();
        toast.success("Comment added");
      }

      setCommentText("");
      setReplyingTo(null);
    } catch (error) {
      toast.error("Failed to add comment");
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("Delete this comment?")) return;

    try {
      await deleteComment(commentId).unwrap();
      toast.success("Comment deleted");
    } catch (error) {
      toast.error("Failed to delete comment");
    }
  };

  const handleEditComment = async (commentId: string) => {
    if (!editText.trim()) {
      toast.error("Comment cannot be empty");

      return;
    }

    try {
      await updateComment({
        commentId,
        data: { text: editText },
      }).unwrap();
      toast.success("Comment updated");

      setEditingComment(null);
      setEditText("");
    } catch (error) {
      toast.error("Failed to update comment");
    }
  };

  const handleHighlight = async (commentId: string | null) => {
    try {
      await setHighlightedComment({ postId, commentId }).unwrap();
      toast.success(commentId ? "Comment highlighted" : "Highlight removed");
    } catch (error) {
      toast.error("Failed to set highlight");
    }
  };

  const formatTimeAgo = (dateString: string): string => {
    const now = Date.now();
    const created = new Date(dateString).getTime();
    const diffSeconds = Math.floor((now - created) / 1000);

    if (diffSeconds < 60) return "Just now";
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m`;
    if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h`;
    if (diffSeconds < 604800) return `${Math.floor(diffSeconds / 86400)}d`;

    return new Date(dateString).toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };

  const CommentItem: React.FC<{ comment: Comment; isReply?: boolean; depth?: number; isLastReply?: boolean }> = ({
    comment,
    isReply = false,
    depth = 0,
    isLastReply = false,
  }) => {
    const isOwner = userInfo?._id === comment.user._id;
    const isFeatured = comment._id === featuredCommentId;
    const isEditing = editingComment === comment._id;
    const isCollapsed = collapsedThreads.has(comment._id);
    const hasReplies = comment.replies && comment.replies.length > 0;

    // Get reaction summary for this comment
    const { data: reactionData } = useGetReactionSummaryQuery({
      targetType: "comment",
      targetId: comment._id,
    });
    const [setReaction] = useSetReactionMutation();
    const [removeReaction] = useRemoveReactionMutation();

    const reactionSummary = reactionData?.data;

    const handleReaction = async (type: ReactionType) => {
      try {
        await setReaction({
          targetType: "comment",
          targetId: comment._id,
          type,
        }).unwrap();
      } catch (error) {
        toast.error("Failed to react");
      }
    };

    const handleRemoveReaction = async () => {
      try {
        await removeReaction({
          targetType: "comment",
          targetId: comment._id,
        }).unwrap();
      } catch (error) {
        toast.error("Failed to remove reaction");
      }
    };

    // Top 3 reactions for compact display
    const topReactions = useMemo(() => {
      if (!reactionSummary?.counts) return [];

      return Object.entries(reactionSummary.counts)
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .slice(0, 3)
        .map(([type]) => REACTIONS.find((r) => r.type === type)?.emoji)
        .filter(Boolean);
    }, [reactionSummary]);

    if (comment.isDeleted) {
      return (
        <div className={`flex gap-2 ${isReply ? "ml-6 sm:ml-8" : ""} opacity-50`}>
          <div className='w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-700 flex-shrink-0' />
          <div className='flex-1'>
            <p className='text-sm text-textSecondary italic'>[Comment deleted]</p>
          </div>
        </div>
      );
    }

    // Calculate indentation with depth limit - reduced on mobile
    const indentClass = isReply ? (depth > 1 ? "ml-4 sm:ml-6" : "ml-6 sm:ml-8") : "";

    return (
      <div className={`${indentClass} mt-3 relative`}>
        {/* Elegant Curved Connector from Root Avatar to Nested Avatar with Arrow */}
        {isReply && (
          <div
            className='absolute pointer-events-none z-0'
            style={{
              left: depth > 1 ? "-20px" : "-28px",
              top: "-12px",
              width: depth > 1 ? "23px" : "28px",
              height: "32px",
            }}
          >
            {/* Complete curved path from parent avatar to reply avatar with arrow and 5px gap */}
            <svg
              className='absolute'
              style={{
                left: "0px",
                top: "0px",
                width: "100%",
                height: "100%",
              }}
              viewBox={`0 0 ${depth > 1 ? "23" : "31"} 32`}
              fill='none'
              preserveAspectRatio='xMidYMid meet'
            >
              {/* Main curved connector line ending 5px before avatar */}
              <path
                d={`M 2 0 L 2 12 Q 2 20, 10 20 L ${depth > 1 ? "17" : "25"} 20`}
                stroke='currentColor'
                strokeWidth='2'
                fill='none'
                className='text-gray-300 dark:text-gray-600'
                strokeLinecap='round'
                strokeLinejoin='round'
              />

              {/* Arrow pointing to reply avatar with 5px gap */}
              <path
                d={`M ${depth > 1 ? "15" : "23"} 17 L ${depth > 1 ? "20" : "28"} 20 L ${depth > 1 ? "15" : "23"} 23`}
                stroke='currentColor'
                strokeWidth='2'
                fill='none'
                className='text-gray-300 dark:text-gray-500'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
            </svg>
          </div>
        )}

        {/* Featured Comment Badge */}
        {isFeatured && !isReply && (
          <div className='mb-2 flex items-center gap-1.5 text-xs font-medium text-sage-600 dark:text-sage-400'>
            <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
              <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
            </svg>
            {featuredMode === "manual" ? "Highlighted by author" : "Top comment"}
          </div>
        )}

        <div className='flex gap-2'>
          {/* Avatar */}
          <div className='flex-shrink-0'>
            <div className='w-8 h-8 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700'>
              {comment.user.image ? (
                <Image src={comment.user.image} alt={comment.user.name} width={32} height={32} className='object-cover' />
              ) : (
                <div className='w-full h-full flex items-center justify-center text-xs font-semibold text-gray-600 dark:text-gray-400'>
                  {comment.user.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className='flex-1 min-w-0'>
            <div
              className={`
              inline-block rounded-2xl px-3 py-2
              ${isFeatured && !isReply ? "bg-sage-50 dark:bg-sage-900/20" : "bg-gray-100 dark:bg-gray-800"}
            `}
            >
              <div className='flex items-baseline gap-2'>
                <span className='font-semibold text-sm text-textMain'>{comment.user.name}</span>
                {comment.editedAt && <span className='text-[10px] text-textSecondary'>(edited)</span>}
              </div>

              {isEditing ? (
                <div className='mt-1 space-y-2'>
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className='w-full px-2 py-1.5 rounded-lg bg-white dark:bg-surface border border-borderSubtle focus:border-sage-500 outline-none resize-none text-sm'
                    rows={2}
                  />
                  <div className='flex gap-2'>
                    <button
                      onClick={() => handleEditComment(comment._id)}
                      className='text-xs px-3 py-1 bg-sage-600 text-white rounded-full hover:bg-sage-700 font-medium'
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setEditingComment(null);
                        setEditText("");
                      }}
                      className='text-xs px-3 py-1 bg-gray-300 dark:bg-gray-700 text-textMain rounded-full hover:bg-gray-400 dark:hover:bg-gray-600'
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className='text-sm text-textMain whitespace-pre-wrap break-words mt-0.5'>{comment.text}</p>
              )}
            </div>

            {/* Actions Row */}
            <div className='flex items-center gap-2 mt-1 ml-2 flex-wrap'>
              {/* Full 7-Reaction Picker */}
              <div className='inline-flex items-center'>
                <ReactionPicker
                  currentReaction={reactionSummary?.myReaction || null}
                  onReactionSelect={handleReaction}
                  onReactionRemove={handleRemoveReaction}
                  trigger='hover'
                  position='top'
                />
              </div>

              {/* Reply Button (max depth 2 levels) */}
              {depth < 2 && (
                <button
                  onClick={() => setReplyingTo({ id: comment._id, name: comment.user.name })}
                  className='text-xs font-semibold text-textSecondary hover:text-sage-600 dark:hover:text-sage-400 transition-colors px-2'
                >
                  Reply
                </button>
              )}

              {/* Time */}
              <span className='text-xs text-textSecondary'>{formatTimeAgo(comment.createdAt)}</span>

              {/* Compact Reaction Summary beside Three-Dot Menu */}
              <div className='flex items-center gap-1 ml-auto'>
                {reactionSummary && reactionSummary.total > 0 && (
                  <div className='flex items-center gap-0.5'>
                    <div className='flex -space-x-0.5'>
                      {topReactions.map((emoji, idx) => (
                        <div
                          key={idx}
                          className='text-xs w-4 h-4 bg-white dark:bg-surface rounded-full flex items-center justify-center shadow-sm border border-gray-200 dark:border-gray-700'
                        >
                          {emoji}
                        </div>
                      ))}
                    </div>
                    <span className='text-xs text-textSecondary font-medium ml-0.5'>{reactionSummary.total}</span>
                  </div>
                )}

                {/* Three-Dot Menu */}
                <CommentMenu
                  isOwner={isOwner}
                  isPostOwner={isPostOwner}
                  isEditing={isEditing}
                  isFeatured={isFeatured}
                  isReply={isReply}
                  onEdit={() => {
                    setEditingComment(comment._id);
                    setEditText(comment.text);
                  }}
                  onDelete={() => handleDeleteComment(comment._id)}
                  onFeature={() => handleHighlight(comment._id)}
                  onUnfeature={() => handleHighlight(null)}
                />
              </div>
            </div>

            {/* Nested Replies */}
            {hasReplies && (
              <div className='mt-2'>
                {!isCollapsed &&
                  comment.replies?.map((reply, index) => (
                    <CommentItem
                      key={reply._id}
                      comment={reply}
                      isReply
                      depth={depth + 1}
                      isLastReply={index === comment.replies!.length - 1}
                    />
                  ))}

                {comment.replies && comment.replies.length > 0 && (
                  <button
                    onClick={() => toggleThreadCollapse(comment._id)}
                    className='flex items-center gap-1 mt-2 ml-2 text-xs font-semibold text-sage-600 dark:text-sage-400 hover:underline'
                  >
                    {isCollapsed ? (
                      <>
                        <svg className='w-3 h-3' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
                        </svg>
                        View {comment.replies.length} {comment.replies.length === 1 ? "reply" : "replies"}
                      </>
                    ) : (
                      <>
                        <svg className='w-3 h-3' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 15l7-7 7 7' />
                        </svg>
                        Hide replies
                      </>
                    )}
                  </button>
                )}
              </div>
            )}

            {/* Reply Input */}
            {replyingTo?.id === comment._id && (
              <div className='mt-2 flex gap-2'>
                <div className='w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0 overflow-hidden'>
                  {userInfo?.image ? (
                    <Image src={userInfo.image} alt='You' width={24} height={24} className='object-cover' />
                  ) : (
                    <div className='w-full h-full flex items-center justify-center text-[10px] font-semibold text-gray-600 dark:text-gray-400'>
                      {userInfo?.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className='flex-1 space-y-2'>
                  <input
                    type='text'
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleAddComment()}
                    placeholder={`Reply to ${replyingTo.name}...`}
                    className='w-full px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 border border-transparent focus:border-sage-500 outline-none text-sm'
                  />
                  <div className='flex gap-2'>
                    <button
                      onClick={handleAddComment}
                      disabled={isReplying || !commentText.trim()}
                      className='px-3 py-1 bg-sage-600 text-white rounded-full hover:bg-sage-700 disabled:opacity-50 text-xs font-medium'
                    >
                      {isReplying ? "..." : "Reply"}
                    </button>
                    <button
                      onClick={() => {
                        setReplyingTo(null);
                        setCommentText("");
                      }}
                      className='px-3 py-1 bg-gray-200 dark:bg-gray-700 text-textMain rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 text-xs font-medium'
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`${className}`}>
      {/* Header with Sort Controls */}
      <div className='flex items-center justify-between mb-4 pb-3 border-b border-borderSubtle'>
        <h3 className='text-base font-bold text-textMain'>
          {totalCount} {totalCount === 1 ? "Comment" : "Comments"}
        </h3>
        <div className='flex gap-1'>
          {(["TOP", "NEWEST", "OLDEST"] as SortMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setSortMode(mode)}
              className={`
                px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
                ${
                  sortMode === mode
                    ? "bg-sage-600 text-white shadow-sm"
                    : "bg-transparent text-textSecondary hover:bg-gray-100 dark:hover:bg-gray-800"
                }
              `}
            >
              {mode === "TOP" ? "Top" : mode === "NEWEST" ? "Newest" : "Oldest"}
            </button>
          ))}
        </div>
      </div>

      {/* Add Comment Composer */}
      {!replyingTo && (
        <div className='flex gap-2 mb-4'>
          <div className='flex-shrink-0'>
            <div className='w-8 h-8 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700'>
              {userInfo?.image ? (
                <Image src={userInfo.image} alt='You' width={32} height={32} className='object-cover' />
              ) : (
                <div className='w-full h-full flex items-center justify-center text-xs font-semibold text-gray-600 dark:text-gray-400'>
                  {userInfo?.name?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </div>
          <div className='flex-1 flex gap-2'>
            <input
              type='text'
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleAddComment()}
              placeholder='Write a comment...'
              className='flex-1 px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 border border-transparent focus:border-sage-500 focus:bg-white dark:focus:bg-surface outline-none text-sm transition-colors'
            />
            {commentText.trim() && (
              <button
                onClick={handleAddComment}
                disabled={isAddingComment}
                className='px-5 py-2 bg-sage-600 text-white rounded-full hover:bg-sage-700 disabled:opacity-50 font-semibold text-sm transition-colors'
              >
                {isAddingComment ? "..." : "Post"}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Comments List */}
      <div>
        <AnimatePresence>
          {commentTree.map((comment) => (
            <motion.div
              key={comment._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <CommentItem comment={comment} />
            </motion.div>
          ))}
        </AnimatePresence>

        {commentTree.length === 0 && (
          <div className='text-center py-12'>
            <svg className='w-16 h-16 mx-auto text-gray-300 dark:text-gray-700 mb-3' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={1.5}
                d='M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'
              />
            </svg>
            <p className='text-sm text-textSecondary'>No comments yet</p>
            <p className='text-xs text-textSecondary mt-1'>Be the first to share your thoughts!</p>
          </div>
        )}
      </div>
    </div>
  );
};
