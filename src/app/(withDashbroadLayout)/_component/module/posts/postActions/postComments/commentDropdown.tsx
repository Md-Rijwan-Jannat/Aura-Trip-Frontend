"use client";

import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@nextui-org/dropdown";
import { Button } from "@nextui-org/button";
import { BsThreeDotsVertical } from "react-icons/bs";
import { useDisclosure } from "@nextui-org/modal";
import { useUser } from "@/src/hooks/useUser";
import CommentEditModal from "../../../../modal/commentEditModal";
import CommentDeleteModal from "../../../../modal/commentDeleteModal";
import { TRenderedComment } from "./commentCard";

interface CommentDropdownProps {
  comment: TRenderedComment;
}

export default function CommentDropdown({ comment }: CommentDropdownProps) {
  const { userInfo: currentUser } = useUser();

  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onOpenChange: onEditChange,
  } = useDisclosure();

  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onOpenChange: onDeleteChange,
  } = useDisclosure();

  return (
    <>
      <Dropdown>
        <DropdownTrigger>
          <Button
            isIconOnly
            size="sm"
            className="bg-default-100 hover:bg-default-200"
            radius="full"
            startContent={<BsThreeDotsVertical />}
          />
        </DropdownTrigger>
        <DropdownMenu aria-label="Comment Actions">
          <DropdownItem
            className={`${comment?.user?._id !== currentUser?._id && "hidden"}`}
            key="edit-comment"
            onClick={onEditOpen}
          >
            Edit comment
          </DropdownItem>
          <DropdownItem
            key="delete-comment"
            className={`text-danger ${comment?.user?._id !== currentUser?._id && "hidden"}`}
            color="danger"
            onClick={onDeleteOpen}
          >
            Delete
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>

      {/* Edit Comment Modal */}
      <CommentEditModal
        isOpen={isEditOpen}
        onOpenChange={onEditChange}
        comment={comment}
      />

      {/* Delete Comment Modal */}
      <CommentDeleteModal
        isOpen={isDeleteOpen}
        onOpenChange={onDeleteChange}
        commentId={comment.comId}
      />
    </>
  );
}
