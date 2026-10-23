'use client';

import PostHeader from './postHeader';
import PostContent from './postContent';
import PostImage from './postImages';

import { TPost } from '@/src/types';
import { motion } from 'framer-motion';
import PostActions from '../postActions/postActions';
import { Chip } from '@nextui-org/chip';
import { PiCrownSimpleDuotone } from 'react-icons/pi';
import { useUser } from '@/src/hooks/useUser';
import CommentCard from '../postActions/postComments/commentCard';

interface TPostCardProps {
  post: TPost;
}

export default function PostCard({ post }: TPostCardProps) {
  const { userInfo: currentUser } = useUser();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.7 }}
      className="w-full"
    >
      <article className="group/post space-y-4 rounded-xl border border-borderSubtle bg-default-100/60 dark:bg-white/[0.03] p-3 md:p-6 duration-300 ease-in-out transition-colors hover:border-sage-300/70 dark:hover:border-sage-700/60">
        {/* Post Header */}
        <PostHeader post={post} />

        {/* Post Content */}
        <PostContent post={post} />

        {/* Post Image */}
        {post?.images.length > 0 && <PostImage post={post} />}

        {post.status === 'PREMIUM' && (
          <Chip
            className="px-2"
            endContent={
              <PiCrownSimpleDuotone
                className="text-yellow-500 mb-0.5"
                size={14}
              />
            }
          >
            {currentUser?.verified ? 'Subscribed' : 'Premium'}
          </Chip>
        )}

        {/* Post Actions */}
        <PostActions post={post} />

        {/* Comment Card */}
        <CommentCard postId={post?._id} postUserId={post?.user?._id} />
      </article>
    </motion.div>
  );
}
