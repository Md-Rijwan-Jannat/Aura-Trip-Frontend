'use client';

// Read-only group info sheet for the conversation header: name, member
// count, member list, and a jump-off to the add-people picker.

import React from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@nextui-org/modal';
import { Button } from '@nextui-org/button';
import { Avatar } from '@nextui-org/avatar';
import { UserPlus, Users } from 'lucide-react';
import { TChat, TUser } from '@/src/types';
import { useUser } from '@/src/hooks/useUser';

interface TGroupInfoModalProps {
  isOpen: boolean;
  onOpenChange: (v?: boolean) => void;
  chat?: TChat;
  onAddPeople?: () => void;
}

export default function GroupInfoModal({
  isOpen,
  onOpenChange,
  chat,
  onAddPeople,
}: TGroupInfoModalProps) {
  const { userInfo } = useUser();
  const members: TUser[] = chat?.users ?? [];

  return (
    <Modal placement="center" size="md" isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col items-center gap-2 pb-2">
              <Avatar
                name={chat?.chatName?.charAt(0)?.toUpperCase() || 'G'}
                className="w-16 h-16 text-2xl"
              />
              <span className="text-base font-semibold">{chat?.chatName}</span>
              <span className="flex items-center gap-1.5 text-xs font-normal text-default-500">
                <Users className="h-3.5 w-3.5" />
                {members.length} {members.length === 1 ? 'member' : 'members'}
              </span>
            </ModalHeader>
            <ModalBody>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-default-400">
                Members
              </p>
              <div className="max-h-[320px] overflow-y-auto scrollbar-hide -mx-1 px-1 space-y-1">
                {members.map((member) => (
                  <div
                    key={member._id}
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-default-100/70 dark:hover:bg-white/[0.05] transition-colors"
                  >
                    <Avatar
                      name={member.name?.charAt(0)?.toUpperCase()}
                      className="w-9 h-9 text-[18px] shrink-0"
                      src={member.image || undefined}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-default-800 truncate">
                        {member.name}
                      </span>
                    </span>
                    {member._id === userInfo?._id && (
                      <span className="text-[10px] font-semibold text-sage-600 dark:text-sage-400 bg-sage-50 dark:bg-sage-500/10 border border-sage-200 dark:border-sage-700/50 rounded px-1.5 py-0.5">
                        You
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onClose}>
                Close
              </Button>
              <Button
                className="bg-sage-600 text-white hover:bg-sage-700"
                startContent={<UserPlus className="h-4 w-4" />}
                onPress={() => {
                  onClose();
                  onAddPeople?.();
                }}
              >
                Add people
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
