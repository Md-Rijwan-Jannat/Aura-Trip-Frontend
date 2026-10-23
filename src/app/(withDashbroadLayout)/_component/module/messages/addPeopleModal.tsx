'use client';

// Multi-select picker used to add people into the open group chat.
// Existing members are excluded; the server re-validates membership,
// group-only target and user existence on every add.

import React, { useMemo, useState } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@nextui-org/modal';
import { Input } from '@nextui-org/input';
import { Button } from '@nextui-org/button';
import { Chip } from '@nextui-org/chip';
import { Avatar } from '@nextui-org/avatar';
import { toast } from 'sonner';
import { GoVerified } from 'react-icons/go';
import { TChat, TUser } from '@/src/types';
import { useGetAllNormalForAnalyticsUsersQuery } from '@/src/redux/features/user/userApi';
import { useAddToGroupMutation } from '@/src/redux/features/message/chatApi';

interface TAddPeopleModalProps {
  isOpen: boolean;
  onOpenChange: (v?: boolean) => void;
  chat?: TChat;
}

export default function AddPeopleModal({
  isOpen,
  onOpenChange,
  chat,
}: TAddPeopleModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const { data: allUsersData } = useGetAllNormalForAnalyticsUsersQuery(undefined);
  const [addToGroupFn, { isLoading }] = useAddToGroupMutation();

  const memberIds = useMemo(
    () => new Set((chat?.users ?? []).map((u) => u._id)),
    [chat],
  );

  // Everyone except current members (group chat only — enforced server-side too).
  const candidates = useMemo(() => {
    const all: TUser[] = allUsersData?.data || [];
    const q = searchTerm.trim().toLowerCase();

    return all.filter(
      (u) => !memberIds.has(u._id) && (!q || u.name.toLowerCase().includes(q)),
    );
  }, [allUsersData, memberIds, searchTerm]);

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const addSelected = async () => {
    if (!chat || selected.length === 0 || isLoading) return;
    try {
      await Promise.all(
        selected.map((userId) =>
          addToGroupFn({ chatId: chat._id, userId }).unwrap(),
        ),
      );
      toast.success(
        `${selected.length} ${selected.length === 1 ? 'person' : 'people'} added`,
      );
      setSelected([]);
      setSearchTerm('');
      onOpenChange(false);
    } catch {
      toast.error('Could not add everyone — try again');
    }
  };

  return (
    <Modal
      placement="center"
      size="md"
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          setSelected([]);
          setSearchTerm('');
        }
        onOpenChange(open);
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <span className="text-base font-semibold">Add people</span>
              <span className="text-xs font-normal text-default-500 truncate">
                to {chat?.chatName || 'group'}
              </span>
            </ModalHeader>
            <ModalBody>
              <Input
                variant="bordered"
                placeholder="Search people…"
                type="search"
                size="md"
                radius="full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              {selected.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {selected.map((id) => {
                    const u = (allUsersData?.data || []).find(
                      (x: TUser) => x._id === id,
                    );

                    return (
                      <Chip
                        key={id}
                        size="sm"
                        variant="flat"
                        color="success"
                        onClose={() => toggle(id)}
                      >
                        {u?.name || 'User'}
                      </Chip>
                    );
                  })}
                </div>
              )}

              <div className="h-[280px] scrollbar-hide overflow-y-auto -mx-1 px-1">
                {candidates.length > 0 ? (
                  <div className="space-y-1">
                    {candidates.map((user: TUser) => {
                      const isSelected = selected.includes(user._id);

                      return (
                        <button
                          key={user._id}
                          type="button"
                          onClick={() => toggle(user._id)}
                          className={`w-full flex items-center gap-3 p-2 rounded-xl text-left transition-colors border ${
                            isSelected
                              ? 'border-sage-400 bg-sage-50 dark:bg-sage-500/10 ring-1 ring-sage-400/50'
                              : 'border-transparent hover:bg-default-100/70 dark:hover:bg-white/[0.05]'
                          }`}
                        >
                          <Avatar
                            className="w-10 h-10 text-[20px]"
                            name={user.name?.charAt(0).toUpperCase()}
                            src={user.image || undefined}
                          />
                          <span className="flex-1 min-w-0">
                            <span className="block font-semibold text-default-800 truncate">
                              {user.name}{' '}
                              {user.verified && (
                                <GoVerified className="inline text-primaryColor" />
                              )}
                            </span>
                          </span>
                          <span
                            className={`text-[11px] font-semibold ${
                              isSelected ? 'text-sage-600 dark:text-sage-400' : 'text-default-400'
                            }`}
                          >
                            {isSelected ? 'Selected' : 'Add'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-center text-sm text-default-500 my-6">
                    No people found
                  </p>
                )}
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onClose}>
                Cancel
              </Button>
              <Button
                className="bg-sage-600 text-white hover:bg-sage-700"
                isDisabled={selected.length === 0}
                isLoading={isLoading}
                onPress={() => void addSelected()}
              >
                Add {selected.length > 0 ? `${selected.length}` : ''}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
