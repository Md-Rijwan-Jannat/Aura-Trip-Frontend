'use client';

import React from 'react';
import { FaRegComment } from 'react-icons/fa';
import { MdOutlineContentCopy } from 'react-icons/md';
import { useUser } from '@/src/hooks/useUser';
import { TPost } from '@/src/types';
import { motion } from 'framer-motion';
import Comment from './postComments/comment';
import { copyToClipboard } from '@/src/utils/copyToClipboard';
import { RiShareForwardLine } from 'react-icons/ri';
import PostShare from './postShare';
import ReactionBar from './reactionBar';
import { useGetReactionSummaryQuery } from '@/src/redux/features/post/postApi';

interface PostActionsProps {
  post: TPost;
}

export default function PostActions({ post }: PostActionsProps) {
  const { userInfo: currentUser } = useUser();

  const { _id, comments } = (post as TPost) || {};

  const { data: summaryData } = useGetReactionSummaryQuery({
    targetType: 'post',
    targetId: _id,
  });
  const reactionTotal = (summaryData?.data?.total as number | undefined) ?? 0;

  // Copy handler
  const handleCopyLink = () => {
    const postUrl = `${window.location.origin}/posts/${_id}`;

    copyToClipboard(postUrl);
  };

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <div className="flex flex-col items-start">
      <div className="flex justify-between border-t border-b border-default-200 py-2 w-full mt-5 text-xs text-default-500">
        <div className="flex items-center gap-1">
          {reactionTotal > 0 ? (
            <>
              <span aria-hidden>👍</span>
              <span className="tabular-nums">{reactionTotal}</span>
            </>
          ) : (
            <span>Be the first to react</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <FaRegComment size={16} /> {comments?.length}
        </div>
        <div className="flex items-center gap-1">
          <RiShareForwardLine size={18} /> {0}
        </div>
      </div>

      {/* Seven-type emoji reaction bar */}
      <div className="w-full border-b border-default-100 pb-2">
        <ReactionBar targetType="post" targetId={_id} />
      </div>

      <div className="flex items-center justify-between gap-2 py-2 w-full border-t border-default-100">
        {/* Comment Button */}
        <Comment _id={post?._id} />

        {/* Copy Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center text-xs md:text-sm text-default-600 hover:text-blue-500 gap-1 rounded py-1"
          onClick={handleCopyLink}
        >
          <MdOutlineContentCopy size={16} />
          Copy
        </motion.button>

        {/* Share Button */}
        <PostShare url={currentUrl} title={post?.title} />
      </div>

      {/* Owner-only quick pin/highlight indicators */}
      {currentUser?._id === post?.user?._id && (post?.pinned || post?.featured) && (
        <div className="flex gap-2 pb-2 text-xs">
          {post?.pinned && (
            <span className="rounded-full bg-primary-100 px-2 py-0.5 text-primary">
              📌 Pinned
            </span>
          )}
          {post?.featured && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-amber-700">
              ⭐ Highlighted
            </span>
          )}
        </div>
      )}
    </div>
  );
}
