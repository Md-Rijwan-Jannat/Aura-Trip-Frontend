'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Avatar } from '@nextui-org/avatar';
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from '@nextui-org/dropdown';
import { FaUsers, FaMapMarkerAlt, FaLock, FaGlobeAmericas } from 'react-icons/fa';
import {
  FiMoreVertical,
  FiEdit2,
  FiLink2,
  FiUsers,
  FiShield,
  FiTrash2,
} from 'react-icons/fi';
import { toast } from 'sonner';
import { TGroup } from '@/src/types';
import {
  CommunityCard,
  Badge,
  CommunityButton,
  CoverBanner,
  ConfirmDialog,
  formatRelative,
} from '@/src/components/ui/communityKit';
import {
  useCreateGroupInviteMutation,
  useDeleteGroupMutation,
} from '@/src/redux/features/group/groupApi';

interface GroupCardProps {
  group: TGroup;
  onJoin?: (id: string) => void;
  onLeave?: (id: string) => void;
  actionLoadingId?: string | null;
}

export default function GroupCard({
  group,
  onJoin,
  onLeave,
  actionLoadingId,
}: GroupCardProps) {
  const isOwner = group.myRole === 'OWNER';
  const isStaff =
    isOwner || group.myRole === 'ADMIN' || group.myRole === 'MODERATOR';
  const isMember = group.myStatus === 'APPROVED' || isOwner;
  const isPending = group.myStatus === 'PENDING';
  const busy = actionLoadingId === group._id;
  const isPrivate = group.visibility === 'PRIVATE';

  const [deleteGroup, { isLoading: deleting }] = useDeleteGroupMutation();
  const [createInvite] = useCreateGroupInviteMutation();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  type MenuItem = {
    key: string;
    label: string;
    href?: string;
    icon: React.ReactNode;
    danger?: boolean;
    action?: 'invite';
  };
  const menuItems: MenuItem[] = [
    ...(isOwner
      ? [
          {
            key: 'edit',
            label: 'Edit group',
            href: `/groups/${group._id}/settings`,
            icon: <FiEdit2 />,
          },
        ]
      : []),
    { key: 'invite', label: 'Copy invite link', icon: <FiLink2 />, action: 'invite' as const },
    {
      key: 'members',
      label: 'Members',
      href: `/groups/${group._id}/members`,
      icon: <FiUsers />,
    },
    {
      key: 'moderation',
      label: 'Moderation',
      href: `/groups/${group._id}/moderation`,
      icon: <FiShield />,
    },
    ...(isOwner
      ? [
          {
            key: 'delete',
            label: 'Delete group',
            icon: <FiTrash2 />,
            danger: true,
          },
        ]
      : []),
  ];

  const copyInvite = async () => {
    const res: any = await createInvite({ id: group._id });

    if (res?.error) {
      toast.error(res?.error?.data?.message || 'Could not create invite');

      return;
    }
    const token = res?.data?.data?.token;

    if (token) {
      const url = `${window.location.origin}/invite/${token}`;

      navigator.clipboard.writeText(url);
      toast.success('Invite link copied — it is shown only once');
    }
  };

  const handleDelete = async () => {
    const res: any = await deleteGroup(group._id);

    if (res?.error) {
      toast.error(res?.error?.data?.message || 'Could not delete the group');
    } else {
      toast.success('Group deleted');
    }
  };

  return (
    <CommunityCard hover className="overflow-hidden group h-full flex flex-col">
      {/* Cover — Link wraps only the image so the 3-dot menu stays clickable */}
      <div className="relative">
        <Link href={`/groups/${group._id}`} className="block">
          <div>
            <CoverBanner
              src={group.coverImage || group.image}
              alt={group.name}
              height="h-24 sm:h-28"
            />
          </div>
        </Link>
        <span className="absolute top-2.5 left-2.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/45 backdrop-blur text-white text-[10px] font-semibold">
          {isPrivate ? <FaLock /> : <FaGlobeAmericas />}
          {isPrivate ? 'Private' : 'Public'}
        </span>

        {/* 3-dot menu (owner/staff only) */}
        {isStaff && (
          <div className="absolute top-2 right-2 z-10">
            <Dropdown isOpen={menuOpen} onOpenChange={setMenuOpen} placement="bottom-end">
              <DropdownTrigger>
                <button
                  type="button"
                  aria-label="Group options"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  className="w-7 h-7 rounded-full bg-black/45 backdrop-blur text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                >
                  <FiMoreVertical />
                </button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Group options"
                className="min-w-[190px]"
                items={menuItems}
              >
                {(item) =>
                  item.danger ? (
                    <DropdownItem
                      key={item.key}
                      className="text-danger"
                      color="danger"
                      startContent={<FiTrash2 />}
                      onPress={() => setConfirmDelete(true)}
                    >
                      {item.label}
                    </DropdownItem>
                  ) : item.action === 'invite' ? (
                    <DropdownItem
                      key={item.key}
                      startContent={<FiLink2 />}
                      onPress={copyInvite}
                    >
                      {item.label}
                    </DropdownItem>
                  ) : (
                    <DropdownItem
                      key={item.key}
                      as={Link}
                      href={item.href!}
                      startContent={item.icon}
                    >
                      {item.label}
                    </DropdownItem>
                  )
                }
              </DropdownMenu>
            </Dropdown>
          </div>
        )}
      </div>

      {/* Avatar overlapping cover */}
      <div className="px-4 sm:px-5 -mt-7 relative">
        <Avatar
          radius="lg"
          className="w-14 h-14 text-lg ring-4 ring-surface shadow-md"
          name={group.name.charAt(0).toUpperCase()}
          src={group.image || undefined}
        />
      </div>

      {/* Body */}
      <div className="px-4 sm:px-5 pt-2.5 pb-4 flex flex-col flex-1 min-w-0">
        <Link href={`/groups/${group._id}`} className="min-w-0">
          <h3 className="text-sm font-bold text-default-900 hover:text-sage-700 dark:hover:text-sage-300 transition-colors line-clamp-1 break-words">
            {group.name}
          </h3>
        </Link>
        <p className="text-xs md:text-sm text-default-500 line-clamp-2 mt-1 min-h-[2rem] break-words">
          {group.description}
        </p>

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2.5 text-xs text-default-500 min-w-0">
          <span className="inline-flex items-center gap-1">
            <FaUsers className="text-sage-500" />
            <span className="font-semibold text-default-700">{group.memberCount}</span>
            {group.memberCount === 1 ? 'member' : 'members'}
          </span>
          {group.location && (
            <span className="inline-flex items-center gap-1 min-w-0 max-w-full">
              <FaMapMarkerAlt className="text-sage-500 flex-shrink-0" />
              <span className="truncate">{group.location}</span>
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 mt-2.5">
          <Badge>{group.category}</Badge>
          <span className="text-[11px] text-default-400">
            {formatRelative(group.createdAt)}
          </span>
        </div>

        {/* Action — pinned to bottom so every card measures the same */}
        <div className="mt-auto pt-3">
          {isMember ? (
            <CommunityButton
              variant="secondary"
              size="sm"
              className="w-full justify-center"
              isDisabled={busy}
              onPress={() => onLeave?.(group._id)}
            >
              Leave group
            </CommunityButton>
          ) : isPending ? (
            <CommunityButton
              variant="ghost"
              size="sm"
              className="w-full justify-center"
              isDisabled
            >
              Request pending
            </CommunityButton>
          ) : (
            <CommunityButton
              variant="primary"
              size="sm"
              className="w-full justify-center"
              isLoading={busy}
              onPress={() => onJoin?.(group._id)}
            >
              {group.joinPolicy === 'OPEN' ? 'Join group' : 'Request to join'}
            </CommunityButton>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmDelete}
        onOpenChange={setConfirmDelete}
        danger
        title={`Delete “${group.name}”?`}
        description="All posts, chats, invites, and memberships will be removed. This cannot be undone."
        confirmLabel="Delete group"
        onConfirm={handleDelete}
      />
    </CommunityCard>
  );
}
