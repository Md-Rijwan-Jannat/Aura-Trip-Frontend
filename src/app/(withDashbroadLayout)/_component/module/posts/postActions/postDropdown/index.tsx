"use client";

import { Button } from "@nextui-org/button";
import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from "@nextui-org/dropdown";
import React from "react";
import { BsThreeDotsVertical } from "react-icons/bs";
import UpdatePostModal from "../../../../modal/updatepostModal";
import DeletePostModal from "../../../../modal/deletePostModal";
import { TPost, TUser } from "@/src/types";
import { useDisclosure } from "@nextui-org/modal";
import { useUser } from "@/src/hooks/useUser";
import { copyToClipboard } from "@/src/utils/copyToClipboard";
import ReportModal from "../../../../modal/reportModal";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import { useFeaturePostMutation, useHidePostMutation, usePinPostMutation } from "@/src/redux/features/post/postApi";
import { AiOutlineEyeInvisible } from "react-icons/ai";
import { BsPinAngle, BsPinAngleFill, BsStar, BsStarFill } from "react-icons/bs";

interface TPostDropdownProps {
  userInfo: TUser;
  postData: TPost;
}

export default function PostDropdown({ userInfo, postData }: TPostDropdownProps) {
  const { userInfo: currentUser } = useUser();

  const { isOpen: isEditOpen, onOpen: onEditOpen, onOpenChange: onEditChange } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onOpenChange: onDeleteChange } = useDisclosure();

  const { isOpen: isReportOpen, onOpen: onReportOpen, onOpenChange: onReportChange } = useDisclosure();

  const [pinPostFn] = usePinPostMutation();
  const [featurePostFn] = useFeaturePostMutation();
  const [hidePostFn] = useHidePostMutation();

  const isOwner = userInfo?.email === currentUser?.email;

  const handleTogglePin = async () => {
    try {
      const pinned = !postData?.pinned;

      await pinPostFn({ postId: postData._id, pinned }).unwrap();
      toast.success(pinned ? "Post pinned to the top of your profile" : "Post unpinned");
    } catch {
      toast.error("Could not update pin");
    }
  };

  const handleToggleFeature = async () => {
    try {
      const featured = !postData?.featured;

      await featurePostFn({ postId: postData._id, featured }).unwrap();
      toast.success(featured ? "Post highlighted on your profile" : "Highlight removed");
    } catch {
      toast.error("Could not update highlight");
    }
  };

  const handleHide = async () => {
    try {
      await hidePostFn(postData._id).unwrap();
      toast.success("Post hidden from your feed");
    } catch {
      toast.error("Could not hide the post");
    }
  };

  const handleCopyLink = () => {
    const postUrl = `${window.location.origin}/posts/${postData?._id}`;

    copyToClipboard(postUrl);
  };

  const handleDownloadImages = async () => {
    if (!postData?.images || postData.images.length === 0) {
      toast.error("No images to download");

      return;
    }

    try {
      // Download all images in the post
      for (let i = 0; i < postData.images.length; i++) {
        const imageUrl = postData.images[i];
        const link = document.createElement("a");

        link.href = imageUrl;
        link.download = `${postData.title || "post"}-image-${i + 1}.jpg`;
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Small delay between downloads to avoid browser blocking
        if (i < postData.images.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 200));
        }
      }

      toast.success(postData.images.length === 1 ? "Image downloaded" : `${postData.images.length} images downloaded`);
    } catch {
      toast.error("Could not download images");
    }
  };

  const pathname = usePathname();

  return (
    <>
      <Dropdown>
        <DropdownTrigger>
          <Button
            isIconOnly
            size='sm'
            className='bg-default-100 hover:bg-default-200'
            radius='full'
            startContent={<BsThreeDotsVertical />}
          />
        </DropdownTrigger>
        <DropdownMenu aria-label='Post Actions'>
          <DropdownItem key='copy-link' onClick={handleCopyLink}>
            Copy link
          </DropdownItem>

          {/* Download images - only show if post has images */}
          {postData?.images && postData.images.length > 0 && (
            <DropdownItem key='download-images' onClick={handleDownloadImages}>
              Download image{postData.images.length > 1 ? "s" : ""}
            </DropdownItem>
          )}

          <DropdownItem
            className={`${pathname === `/news-feed/posts/${postData?._id}` && "hidden"}`}
            key='view-details'
            as={Link}
            href={`/news-feed/posts/${postData?._id}`}
          >
            View details
          </DropdownItem>

          {/* Owner: single profile pin (one pinned post per author) */}
          <DropdownItem
            className={`${!isOwner && "hidden"}`}
            key='pin-post'
            onClick={handleTogglePin}
            startContent={postData?.pinned ? <BsPinAngleFill /> : <BsPinAngle />}
          >
            {postData?.pinned ? "Unpin from profile" : "Pin to profile"}
          </DropdownItem>

          {/* Owner: single profile highlight (one highlighted post) */}
          <DropdownItem
            className={`${!isOwner && "hidden"}`}
            key='feature-post'
            onClick={handleToggleFeature}
            startContent={postData?.featured ? <BsStarFill /> : <BsStar />}
          >
            {postData?.featured ? "Remove highlight" : "Highlight on profile"}
          </DropdownItem>

          <DropdownItem className={`${!isOwner && "hidden"}`} key='edit-post' onClick={onEditOpen}>
            Edit post
          </DropdownItem>

          {/* Anyone: hide from my own feed (never deletes the post) */}
          <DropdownItem key='hide-post' onClick={handleHide} startContent={<AiOutlineEyeInvisible />}>
            Hide from my feed
          </DropdownItem>

          <DropdownItem className={`text-danger ${isOwner && "hidden"}`} key='report-post' onClick={onReportOpen}>
            Report a post
          </DropdownItem>
          <DropdownItem key='delete-post' className={`text-danger ${!isOwner && "hidden"}`} color='danger' onClick={onDeleteOpen}>
            Delete
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>

      {/* Modal for editing the post */}
      <UpdatePostModal isOpen={isEditOpen} onOpenChange={onEditChange} postData={postData} userInfo={userInfo} />

      {/* Modal for deleting the post */}
      <DeletePostModal isOpen={isDeleteOpen} onOpenChange={onDeleteChange} postId={postData?._id} />

      {/* Report modal */}
      <ReportModal isOpen={isReportOpen} onOpenChange={onReportChange} post={postData} />
    </>
  );
}
