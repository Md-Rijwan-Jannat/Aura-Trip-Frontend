import React, { useState } from "react";
import {
  useAddCommentsForPostsMutation,
  useGetCommentsForPostsQuery,
  useReplayCommentsForPostsMutation,
} from "@/src/redux/features/post/commentApi";
import { TComment } from "@/src/types";
import "react-comments-section/dist/index.css";
import CommentInput from "./commentInput";
import ReplyCommentInput from "./replyCommentInput";
import { Avatar } from "@nextui-org/avatar";
import { GoVerified } from "react-icons/go";
import CommentDropdown from "./commentDropdown";
import { useUser } from "@/src/hooks/useUser";
import Link from "next/link";
import { toast } from "sonner";
import { ActiveAvatar } from "@/src/app/(withCommonLayout)/_component/ui/navbar/activeAvatar";

interface TCommentCardProps {
  postId: string;
}

export interface TRenderedComment {
  [x: string]: any;
  userId: string;
  comId: string;
  fullName: string;
  avatarUrl: string | undefined;
  text: string;
  replies?: TRenderedComment[];
}

const CommentCard: React.FC<TCommentCardProps> = ({ postId }) => {
  const { data: commentsData } = useGetCommentsForPostsQuery(postId);
  const comments = commentsData?.data as TComment[] | undefined;

  const { userInfo: currentUser } = useUser();

  const repliesId =
    comments?.flatMap((comment) =>
      comment?.replies?.map((reply) => reply._id)
    ) ?? [];

  const filteredComments =
    comments?.filter((comment) => !repliesId.includes(comment._id)) ?? [];

  const transformedComments: TRenderedComment[] = filteredComments.map(
    (comment) => ({
      userId: comment.user._id,
      verified: comment?.user?.verified,
      comId: comment._id,
      fullName: comment.user.name,
      avatarUrl: comment.user.image,
      text: comment.text,
      replies: comment.replies?.map((reply) => ({
        userId: reply.user?._id,
        comId: reply._id,
        verified: reply?.user?.verified,
        fullName: reply.user?.name || "Anonymous",
        avatarUrl: reply.user?.image || undefined,
        text: reply.text,
      })),
    })
  );

  const [addComment] = useAddCommentsForPostsMutation();
  const [replyComment] = useReplayCommentsForPostsMutation();

  const [newComment, setNewComment] = useState<string>("");
  const [replyCommentText, setReplyCommentText] = useState<string>("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const [visibleComments, setVisibleComments] = useState<number>(2);
  const [isAllCommentsVisible, setIsAllCommentsVisible] =
    useState<boolean>(false);

  const handleNewCommentSubmit = async () => {
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
    if (!replyingTo) return;

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

  // Show all comments when "Load More" is clicked
  const handleLoadMore = () => {
    setVisibleComments(transformedComments.length);
    setIsAllCommentsVisible(true);
  };

  // Show fewer comments when "Show Less" is clicked
  const handleShowLess = () => {
    setVisibleComments(2);
    setIsAllCommentsVisible(false);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xs font-semibold">Comments</h2>
      {transformedComments.slice(0, visibleComments).map((comment) => (
        <div key={comment.comId} className="space-y-2">
          <div className="flex items-start justify-between space-x-3">
            <div className="flex items-start space-x-3">
              <Link href={`/profile/${comment?.userId}`}>
                {" "}
                <ActiveAvatar
                  src={comment.avatarUrl}
                  name={comment.fullName.charAt(0).toUpperCase()}
                  alt={`${comment.fullName}'s avatar`}
                  size="sm"
                  userId={comment.userId as string}
                  className="cursor-pointer"
                />
              </Link>

              <div>
                <Link
                  href={`/profile/${comment?.userId}`}
                  className="font-semibold text-sm flex items-center gap-1 text-default-700"
                >
                  {comment.fullName}
                  {comment?.verified! && (
                    <GoVerified className="text-primaryColor" />
                  )}
                </Link>
                <div className="text-xs">{comment.text}</div>

                {replyingTo === comment.comId ? (
                  <ReplyCommentInput
                    value={replyCommentText}
                    onChange={(e) => setReplyCommentText(e.target.value)}
                    onSubmit={handleReplySubmit}
                    onCancel={handleReplyCancel}
                  />
                ) : (
                  <button
                    className="text-xs text-sage-600 dark:text-sage-400 hover:underline"
                    onClick={() => setReplyingTo(comment.comId)}
                  >
                    Reply
                  </button>
                )}
              </div>
            </div>
            {comment.userId === currentUser?._id && (
              <CommentDropdown comment={comment} />
            )}
          </div>

          {comment?.replies?.length! > 0 && (
            <div className="mt-4 space-y-2 pl-8 border-l-2 border-default-200">
              {comment?.replies?.map((reply) => (
                <div
                  key={reply.comId}
                  className="flex items-start justify-between space-x-3"
                >
                  <div className="flex items-start space-x-3">
                    <Link href={`/profile/${reply?.userId}`}>
                      <ActiveAvatar
                        userId={reply._id as string}
                        src={reply.avatarUrl}
                        name={reply.fullName.charAt(0).toUpperCase()}
                        alt={`${reply.fullName}'s avatar`}
                        size="sm"
                        className="cursor-pointer"
                      />
                    </Link>

                    <div>
                      <Link
                        href={`/profile/${comment?.userId}`}
                        className="font-semibold text-sm flex items-center gap-1 text-default-700"
                      >
                        {reply.fullName}{" "}
                        {reply?.verified! && (
                          <GoVerified className="text-primaryColor" />
                        )}
                      </Link>
                      <div className="text-xs">{reply.text}</div>
                    </div>
                  </div>
                  {reply.userId === currentUser?._id && (
                    <CommentDropdown comment={reply} />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
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
