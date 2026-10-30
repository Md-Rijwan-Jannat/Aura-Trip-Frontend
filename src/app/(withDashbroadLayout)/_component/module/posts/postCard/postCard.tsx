"use client";

import { useState } from "react";
import PostHeader from "./postHeader";
import PostContent from "./postContent";
import PostImage from "./postImages";

import { TPost } from "@/src/types";
import { motion } from "framer-motion";
import { Chip } from "@nextui-org/chip";
import { PiCrownSimpleDuotone } from "react-icons/pi";
import { useUser } from "@/src/hooks/useUser";

// Import the new modern components
import { PostEngagement } from "@/src/components/ui/PostEngagement";
import { CommentSection } from "@/src/components/ui/CommentSection";

interface TPostCardProps {
  post: TPost;
}

export default function PostCard({ post }: TPostCardProps) {
  const { userInfo: currentUser } = useUser();
  const [showComments, setShowComments] = useState(false);

  // Generate post URL for sharing
  const postUrl = typeof window !== "undefined" ? `${window.location.origin}/posts/${post._id}` : "";

  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7 }} className='w-full'>
      <article className='group/post space-y-4 rounded-xl border border-borderSubtle bg-default-100/60 dark:bg-white/[0.03] p-3 md:p-6 duration-300 ease-in-out transition-colors hover:border-sage-300/70 dark:hover:border-sage-700/60'>
        {/* Post Header */}
        <PostHeader post={post} />

        {/* Post Content */}
        <PostContent post={post} />

        {/* Post Image */}
        {post?.images.length > 0 && <PostImage post={post} />}

        {post.status === "PREMIUM" && (
          <Chip className='px-2' endContent={<PiCrownSimpleDuotone className='text-yellow-500 mb-0.5' size={14} />}>
            {currentUser?.verified ? "Subscribed" : "Premium"}
          </Chip>
        )}

        {/* NEW: Modern Post Engagement Component */}
        <PostEngagement
          postId={post._id}
          postTitle={post.title}
          postDescription={post.description}
          postImage={post.images?.[0]}
          postUrl={postUrl}
          targetType='post'
          commentCount={post.comments?.length || 0}
          onCommentClick={() => setShowComments(!showComments)}
        />

        {/* NEW: Modern Comment Section (shown when toggled) */}
        {showComments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <CommentSection postId={post._id} postOwnerId={post.user._id} className='pt-4 border-t border-borderSubtle' />
          </motion.div>
        )}
      </article>
    </motion.div>
  );
}
