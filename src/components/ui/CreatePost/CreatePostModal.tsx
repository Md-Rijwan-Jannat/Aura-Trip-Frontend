"use client";

import { Modal, ModalContent } from "@nextui-org/modal";
import { useDisclosure } from "@nextui-org/modal";
import { useState } from "react";
import { TUser } from "@/src/types";
import CreatePostTrigger from "./CreatePostTrigger";
import CreatePostDesktop from "./CreatePostDesktop";
import CreatePostMobile from "./CreatePostMobile";
import { useMediaQuery } from "@/src/hooks/useMediaQuery";

interface CreatePostModalProps {
  userInfo: TUser | undefined;
}

export interface PostFormData {
  title: string;
  description: string;
  category: string;
  status: string;
  mediaLayout: string;
  tags: string[];
  location: string;
  feeling: string;
  aiGenerated: boolean;
  shareToGroups: string[];
  shareToStory: boolean;
  scheduledAt: Date | null;
}

const CreatePostModal = ({ userInfo }: CreatePostModalProps) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const isMobile = useMediaQuery("(max-width: 768px)");

  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  return (
    <>
      <CreatePostTrigger userInfo={userInfo} onOpen={onOpen} />

      <Modal
        size={isMobile ? "full" : "5xl"}
        placement='center'
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        classNames={{
          base: isMobile ? "m-0" : "",
          wrapper: isMobile ? "items-stretch" : "",
        }}
        hideCloseButton={isMobile}
      >
        <ModalContent className={isMobile ? "h-screen rounded-none" : ""}>
          {isMobile ? (
            <CreatePostMobile
              userInfo={userInfo}
              onClose={() => onOpenChange()}
              imagePreviews={imagePreviews}
              setImagePreviews={setImagePreviews}
              imageFiles={imageFiles}
              setImageFiles={setImageFiles}
            />
          ) : (
            <CreatePostDesktop
              userInfo={userInfo}
              onClose={() => onOpenChange()}
              imagePreviews={imagePreviews}
              setImagePreviews={setImagePreviews}
              imageFiles={imageFiles}
              setImageFiles={setImageFiles}
            />
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default CreatePostModal;
