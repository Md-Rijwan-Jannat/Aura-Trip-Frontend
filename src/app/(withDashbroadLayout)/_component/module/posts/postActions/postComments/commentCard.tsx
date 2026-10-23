import React, { useMemo, useState } from "react";
import {
  useAddCommentsForPostsMutation,
  useGetCommentsForPostsQuery,
  useReplayCommentsForPostsMutation,
} from "@/src/redux/features/post/commentApi";
import { useUpdateCommentSettingsMutation } from "@/src/redux/features/post/postApi";
import { TComment, TCommentSortMode } from "@/src/types";
import "react-comments-section/dist/index.css";
import CommentInput from "./commentInput";
import ReplyCommentInput from "./replyCommentInput";
import CommentDropdown from "./commentDropdown";
import { useUser } from "@/src/hooks/useUser";
import Link from "next/link";
import { toast } from "sonner";
import { GoVerified } from "react-icons/go";
import { ActiveAvatar } from "@/src/app/(withCommonLayout)/_component/ui/navbar/activeAvatar";
import ReactionBar from "../reactionBar";

interface TCommentCardProps {
  postId: string;
  /** Post owner id — enables the owner's "feature comment" affordance. */
  postUserId?: string;
}

export interface TRenderedComment {
  [x: string]: any;
  userId: string;
  comId: string;
  fullName: string;
  avatarUrl: string | undefined;
  verified?: boolean;
  text: string;
  isDeleted?: boolean;
  edited?: boolean;
  parentComment?: string | null;
  isFeatured?: boolean;
  replies?: TRenderedComment[];
}

const EMPTY_COMMENTS: TComment[] = [];

const SORT_OPTIONS: { key: TCommentSortMode; label: string }[] = [
  { key: "TOP", label: "Top" },
  { key: "NEWEST", label: "Newest" },
  { key: "OLDEST", label: "Oldest" },
];

/**
 * Comment thread for a post:
 * - flat API list rebuilt into a tree via `parentComment` (reply-to-reply works
 *   at any depth, soft-deleted parents render as neutral placeholders),
 * - viewer-selectable ordering (Top / Newest / Oldest),
 * - the featured comment (owner's manual pick or automatic engagement
 *   fallback) rendered with a star chip,
 * - "Edited" markers on edited comments.
 */
const CommentCard: React.FC<TCommentCardProps> = ({ postId, postUserId }) => {
  const { data: commentsData } = useGetCommentsForPostsQuery({ postId });
  const comments = commentsData?.data as TComment[] | undefined;
  const meta = commentsData?.meta as
    | {
        sortMode?: TCommentSortMode;
        featuredCommentId?: string | null;
        featuredMode?: string;
      }
    | undefined;

  const { userInfo: currentUser } = useUser();
  const isPostOwner = Boolean(
    postUserId && currentUser?._id && postUserId === currentUser._id,
  );

  const [sort, setSort] = useState<TCommentSortMode | undefined>(undefined);
  // Follow the server's resolved default until the viewer picks a mode.
  const activeSort = sort ?? meta?.sortMode ?? "TOP";
  const { data: sortedData } = useGetCommentsForPostsQuery(
    { postId, sort: sort ?? undefined },
    { skip: !sort },
  );
  const effectiveComments = (
    sort ? sortedData?.data : commentsData?.data
  ) as TComment[] | undefined;
  const effectiveMeta = (sort ? sortedData?.meta : commentsData?.meta) as
    | { sortMode?: TCommentSortMode; featuredCommentId?: string | null }
    | undefined;
  const featuredId =
    effectiveMeta?.featuredCommentId ?? meta?.featuredCommentId ?? null;

  const [addComment] = useAddCommentsForPostsMutation();
  const [replyComment] = useReplayCommentsForPostsMutation();
  const [updateCommentSettingsFn] = useUpdateCommentSettingsMutation();

  const [newComment, setNewComment] = useState<string>("");
  const [replyCommentText, setReplyCommentText] = useState<string>("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const [visibleComments, setVisibleComments] = useState<number>(2);
  const [isAllCommentsVisible, setIsAllCommentsVisible] =
    useState<boolean>(false);

  const source = effectiveComments ?? EMPTY_COMMENTS;

  // Build the thread tree from the flat list (two passes so a reply can be
  // linked even if it appears before its parent in the array).
  const transformedComments: TRenderedComment[] = useMemo(() => {
    const nodes = new Map<string, TRenderedComment>();

    for (const comment of source) {
      if (!comment?._id) continue;
      nodes.set(comment._id, {
        userId: comment.user?._id,
        comId: comment._id,
        fullName: comment.user?.name || "Anonymous",
        avatarUrl: comment.user?.image || undefined,
        verified: comment?.user?.verified,
        text: comment.isDeleted ? "" : comment.text,
        isDeleted: Boolean(comment.isDeleted),
        edited: Boolean(comment.editedAt),
        parentComment: comment.parentComment ?? null,
        isFeatured: comment._id === featuredId,
        replies: [],
      });
    }

    const roots: TRenderedComment[] = [];
    Array.from(nodes.values()).forEach((node) => {
      const parentId = node.parentComment ? String(node.parentComment) : null;
      const parent = parentId ? nodes.get(parentId) : undefined;
      if (parent) {
        parent.replies!.push(node);
      } else {
        roots.push(node);
      }
    });

    // The featured comment always surfaces to the top of the root list.
    roots.sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured));
    return roots;
  }, [source, featuredId]);

  const handleNewCommentSubmit = async () => {
    if (!newComment.trim()) return;
    try {
      const commentData = { post: postId, text: newComment };
      await addComment(commentData);
      toast.success("Comment added successfully!");
      setNewComment("");
    } catch (error) {
      console.error("Error submitting new comment:", error);
    }
  };

  const handleReplySubmit = async () => {
    if (!replyingTo || !replyCommentText.trim()) return;
    try {
      const replyData = {
        commentId: replyingTo,
        data: { post: postId, text: replyCommentText },
      };
      await replyComment(replyData);
      setReplyCommentText("");
      setReplyingTo(null);
    } catch (error) {
      console.error("Error submitting reply:", error);
    }
  };

  const handleReplyCancel = () => {
    setReplyCommentText("");
    setReplyingTo(null);
  };

  const handleToggleFeature = async (commentId: string, featured: boolean) => {
    try {
      await updateCommentSettingsFn({
        postId,
        data: { highlightedComment: featured ? null : commentId },
      }).unwrap();
      toast.success(featured ? "Highlight removed" : "Comment featured");
    } catch {
      toast.error("Could not update the featured comment");
    }
  };

  const handleLoadMore = () => {
    setVisibleComments(transformedComments.length);
    setIsAllCommentsVisible(true);
  };

  const handleShowLess = () => {
    setVisibleComments(2);
    setIsAllCommentsVisible(false);
  };

  const renderNode = (
    comment: TRenderedComment,
    depth: number,
    key: string,
  ): React.ReactNode => {
    const canReply = !comment.isDeleted;
    const isOwn = comment.userId === currentUser?._id;

    return (
      <div key={key} className={depth > 0 ? "mt-3" : ""}>
        <div className="flex items-start justify-between space-x-3">
          <div className="flex items-start space-x-3">
            <Link href={`/profile/${comment?.userId ?? ""}`}>
              <ActiveAvatar
                src={comment.avatarUrl}
                name={(comment.fullName || "?").charAt(0).toUpperCase()}
                alt={`${comment.fullName}'s avatar`}
                size="sm"
                userId={comment.userId as string}
                className="cursor-pointer"
              />
            </Link>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/profile/${comment?.userId ?? ""}`}
                  className="font-semibold text-sm flex items-center gap-1 text-default-700"
                >
                  {comment.fullName}
                  {comment?.verified && <GoVerified className="text-primaryColor" />}
                </Link>
                {comment.isFeatured && (
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700">
                    ⭐ Featured
                  </span>
                )}
              </div>

              {comment.isDeleted ? (
                <p className="text-xs italic text-default-400">
                  This comment was deleted
                </p>
              ) : (
                <p className="text-xs text-default-700 whitespace-pre-wrap break-words">
                  {comment.text}
                  {comment.edited && (
                    <span className="ml-1 text-[10px] text-default-400">
                      (edited)
                    </span>
                  )}
                </p>
              )}

              {!comment.isDeleted && (
                <div className="mt-1 max-w-[300px]">
                  <ReactionBar
                    targetType="comment"
                    targetId={comment.comId}
                    compact
                  />
                </div>
              )}

              <div className="mt-1 flex items-center gap-3">
                {canReply &&
                  (replyingTo === comment.comId ? (
                    <ReplyCommentInput
                      value={replyCommentText}
                      onChange={(e) => setReplyCommentText(e.target.value)}
                      onSubmit={handleReplySubmit}
                      onCancel={handleReplyCancel}
                    />
                  ) : (
                    <button
                      className="text-xs text-sage-600 dark:text-sage-400 hover:underline"
                      onClick={() => {
                        setReplyingTo(comment.comId);
                        setReplyCommentText("");
                      }}
                    >
                      Reply
                    </button>
                  ))}

                {/* Post owner: manual featured-comment toggle */}
                {isPostOwner && !comment.isDeleted && (
                  <button
                    className={`text-xs hover:underline ${
                      comment.isFeatured
                        ? "text-amber-600"
                        : "text-default-500"
                    }`}
                    onClick={() =>
                      handleToggleFeature(comment.comId, Boolean(comment.isFeatured))
                    }
                  >
                    {comment.isFeatured ? "Unfeature" : "Feature"}
                  </button>
                )}
              </div>
            </div>
          </div>

          {isOwn && <CommentDropdown comment={comment} />}
        </div>

        {/* Replies — recursive, any depth */}
        {comment.replies && comment.replies.length > 0 && (
          <div
            className={`mt-2 space-y-1 border-l-2 border-default-200 ${
              depth === 0 ? "pl-8" : "pl-4"
            }`}
          >
            {comment.replies.map((reply, index) =>
              renderNode(reply, depth + 1, `${key}-${reply.comId}-${index}`),
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold">Comments</h2>

        {/* Sort selector */}
        <div className="flex items-center gap-1 rounded-full border border-default-200 p-0.5">
          {SORT_OPTIONS.map((option) => (
            <button
              key={option.key}
              onClick={() => setSort(option.key)}
              className={`rounded-full px-2 py-0.5 text-[10px] transition-colors ${
                activeSort === option.key
                  ? "bg-primary text-white"
                  : "text-default-500 hover:text-default-700"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {transformedComments.slice(0, visibleComments).map((comment, index) =>
        renderNode(comment, 0, `${comment.comId}-${index}`),
      )}

      {transformedComments.length === 0 && (
        <p className="text-xs text-default-400">
          No comments yet. Start the conversation.
        </p>
      )}

      {/* Load More and Show Less buttons */}
      {transformedComments.length > 2 && (
        <div className="text-start ml-3">
          {!isAllCommentsVisible ? (
            <button
              className="text-sage-600 dark:text-sage-400 text-xs hover:underline"
              onClick={handleLoadMore}
            >
              More comments
            </button>
          ) : (
            <button
              className="text-sage-600 dark:text-sage-400 text-xs hover:underline"
              onClick={handleShowLess}
            >
              Less comments
            </button>
          )}
        </div>
      )}

      {/* Comment Input for new comments */}
      <CommentInput
        value={newComment}
        onChange={(e) => setNewComment(e.target.value)}
        onSubmit={handleNewCommentSubmit}
      />
    </div>
  );
};

export default CommentCard;
