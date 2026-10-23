'use client';

import React from 'react';
import Link from 'next/link';
import { Avatar } from '@nextui-org/avatar';
import { FaComments, FaPen, FaUserPlus, FaDoorOpen } from 'react-icons/fa';
import { TGroup, TGroupFeedContext } from '@/src/types';
import {
  CommunityButton,
  Badge,
  CoverBanner,
  AvatarStack,
  NavPills,
} from '@/src/components/ui/communityKit';

interface GroupHeaderProps {
  group: TGroup;
  context?: TGroupFeedContext;
  isMember: boolean;
  isPending: boolean;
  isStaff: boolean;
  isOwner: boolean;
  onJoin: () => void;
  onLeave: () => void;
  onOpenPost: () => void;
  onOpenChat: () => void;
  busy?: boolean;
}

export default function GroupHeader({
  group,
  context,
  isMember,
  isPending,
  isStaff,
  isOwner,
  onJoin,
  onLeave,
  onOpenPost,
  onOpenChat,
  busy,
}: GroupHeaderProps) {
  const isPrivate = group.visibility === 'PRIVATE';

  const tabs = [
    { key: 'feed', label: 'Feed', href: `/groups/${group._id}` },
    { key: 'members', label: 'Members', href: `/groups/${group._id}/members` },
    ...(isStaff
      ? [
          {
            key: 'moderation',
            label: 'Moderation',
            href: `/groups/${group._id}/moderation`,
          },
          { key: 'invites', label: 'Invites', href: `/groups/${group._id}/invites` },
        ]
      : []),
    ...(isOwner
      ? [
          {
            key: 'settings',
            label: 'Settings',
            href: `/groups/${group._id}/settings`,
          },
        ]
      : []),
  ];

  return (
    <div className="rounded-2xl bg-surface border border-borderSubtle shadow-[0_1px_2px_rgba(31,78,61,0.04),0_8px_24px_-12px_rgba(31,78,61,0.12)] overflow-hidden">
      {/* Cinematic cover */}
      <div className="relative">
        <CoverBanner src={group.coverImage || group.image} alt={group.name} height="h-32 sm:h-48 md:h-60" />
        <div className="absolute inset-x-0 bottom-0 h-20 sm:h-24 bg-gradient-to-t from-black/50 to-transparent" />
        <span className="absolute top-3 right-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur text-white text-[11px] sm:text-xs font-semibold">
          {isPrivate ? '🔒 Private' : '🌐 Public'}
        </span>
      </div>

      {/* Identity row */}
      <div className="px-4 sm:px-8 pb-5 -mt-10 sm:-mt-12 relative">
        <div className="flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-4">
          <Avatar
            radius="lg"
            className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 text-2xl sm:text-3xl ring-4 ring-surface shadow-xl flex-shrink-0"
            name={group.name.charAt(0).toUpperCase()}
            src={group.image || undefined}
          />
          <div className="flex-1 min-w-0 sm:pb-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <h1 className="text-lg sm:text-2xl font-bold text-default-900 tracking-tight break-words min-w-0">
                {group.name}
              </h1>
              <Badge color="PUBLIC">{group.category}</Badge>
              {group.postApprovalEnabled && <Badge color="PENDING">Approval on</Badge>}
            </div>
            <p className="text-sm text-default-500 mt-1 line-clamp-2 max-w-2xl break-words">
              {group.description}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 sm:pb-1 w-full sm:w-auto">
            {isMember ? (
              <>
                {context?.chatEnabled !== false && (
                  <CommunityButton
                    variant="secondary"
                    size="sm"
                    className="flex-1 sm:flex-none justify-center"
                    startContent={<FaComments />}
                    onPress={onOpenChat}
                  >
                    Chat
                  </CommunityButton>
                )}
                {(!context || context.canPost) && (
                  <CommunityButton
                    variant="primary"
                    size="sm"
                    className="flex-1 sm:flex-none justify-center"
                    startContent={<FaPen />}
                    onPress={onOpenPost}
                  >
                    New post
                  </CommunityButton>
                )}
                {!isOwner && (
                  <CommunityButton
                    variant="ghost"
                    size="sm"
                    className="flex-1 sm:flex-none justify-center"
                    isDisabled={busy}
                    onPress={onLeave}
                  >
                    Leave
                  </CommunityButton>
                )}
              </>
            ) : isPending ? (
              <CommunityButton variant="ghost" size="sm" isDisabled>
                Request pending
              </CommunityButton>
            ) : (
              <CommunityButton
                variant="primary"
                size="sm"
                isLoading={busy}
                startContent={group.joinPolicy === 'OPEN' ? <FaDoorOpen /> : <FaUserPlus />}
                onPress={onJoin}
              >
                {group.joinPolicy === 'OPEN' ? 'Join group' : 'Request to join'}
              </CommunityButton>
            )}
          </div>
        </div>

        {/* Stats row */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-4 text-sm text-default-500">
          <span className="inline-flex items-center gap-2">
            <AvatarStack users={[]} total={group.memberCount} size={22} />
            <span>
              <b className="text-default-800">{group.memberCount}</b>{' '}
              {group.memberCount === 1 ? 'member' : 'members'}
            </span>
          </span>
          {group.location && <span>📍 {group.location}</span>}
          {group.pendingCount > 0 && isStaff && (
            <Link
              href={`/groups/${group._id}/members`}
              className="text-amber-600 font-semibold hover:underline"
            >
              {group.pendingCount} pending request
              {group.pendingCount === 1 ? '' : 's'}
            </Link>
          )}
        </div>

        {/* Tabs */}
        <div className="mt-4 sm:mt-5 -mx-1 px-1 overflow-x-auto scrollbar-hide">
          <NavPills tabs={tabs} />
        </div>
      </div>
    </div>
  );
}
