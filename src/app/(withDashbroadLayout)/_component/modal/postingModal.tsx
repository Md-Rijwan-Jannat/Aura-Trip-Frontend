"use client";

import { TUser } from "@/src/types";
import CreatePostModal from "@/src/components/ui/CreatePost/CreatePostModal";

interface TPostModalProps {
  userInfo: TUser | undefined;
}

const PostModal = ({ userInfo }: TPostModalProps) => {
  return <CreatePostModal userInfo={userInfo} />;
};

export default PostModal;
