"use client";

import React from "react";
import CommentCard from "./commentCard";

interface DetailsCommentCardProps {
  postId: string;
  postUserId?: string;
}

/**
 * Details page comment thread — the upgraded CommentCard already renders the
 * full thread (tree, sorting, featured comment, all roots expanded by default
 * on the details page via "More comments" starting at 2; pass-through only).
 */
const DetailsCommentCard: React.FC<DetailsCommentCardProps> = ({
  postId,
  postUserId,
}) => <CommentCard postId={postId} postUserId={postUserId} />;

export default DetailsCommentCard;
