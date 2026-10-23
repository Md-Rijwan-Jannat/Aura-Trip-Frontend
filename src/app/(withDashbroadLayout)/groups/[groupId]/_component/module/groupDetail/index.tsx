'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Avatar } from '@nextui-org/avatar';
import { toast } from 'sonner';
import { FaClipboardList, FaShieldHalved } from 'react-icons/fa6';
import { FaInfoCircle } from 'react-icons/fa';
import {
  useGetSingleGroupQuery,
  useGetGroupFeedQuery,
  useJoinGroupMutation,
  useLeaveGroupMutation,
  useLazyGetGroupConversationQuery,
} from '@/src/redux/features/group/groupApi';
import { TGroup, TPost, TUser } from '@/src/types';
import { useUser } from '@/src/hooks/useUser';
import GroupHeader from '../../../../_component/ui/groupHeader';
import GroupPostCard from '../../../../_component/ui/groupPostCard';
import GroupPostModal from '../../../../_component/modal/groupPostModal';
import {
  CommunityCard,
  CommunityButton,
  EmptyState,
  CardSkeleton,
  FadeIn,
  formatRelative,
} from '@/src/components/ui/communityKit';

interface GroupDetailProps {
  groupId: string;
}

export default function GroupDetail({ groupId }: GroupDetailProps) {
  const router = useRouter();
  const { userInfo } = useUser();
  const [page, setPage] = useState(1);
  const [postModalOpen, setPostModalOpen] = useState(false);

  const { data: groupRes, isLoading } = useGetSingleGroupQuery(groupId);
  const { data: feedRes, isFetching: feedLoading } = useGetGroupFeedQuery({
    id: groupId,
    page,
    limit: 10,
  });
  const [joinGroup] = useJoinGroupMutation();
  const [leaveGroup] = useLeaveGroupMutation();
  const [getConversation] = useLazyGetGroupConversationQuery();

  const groupData = groupRes?.data as
    | { group: TGroup; membership: unknown }
    | undefined;
  const group = groupData?.group;
  const context = feedRes?.data?.context;
  const posts: TPost[] = feedRes?.data?.posts || [];
  const meta = feedRes?.meta;

  if (isLoading || !group) {
    return <CardSkeleton count={2} />;
  }

  const ownerId =
    typeof group.owner === 'string' ? group.owner : group.owner?._id;
  const isOwner = String(ownerId) === String(userInfo?._id);
  const isStaff =
    isOwner ||
    context?.isStaff ||
    group.myRole === 'ADMIN' ||
    group.myRole === 'MODERATOR';
  const isMember = group.myStatus === 'APPROVED' || isOwner;
  const isPending = group.myStatus === 'PENDING';
  const ownerUser =
    typeof group.owner === 'object' ? (group.owner as TUser) : undefined;

  const handleJoin = async () => {
    const res: any = await joinGroup(groupId);

    if (res?.error) {
      toast.error(res?.error?.data?.message || 'Could not join group');
    } else if (res?.data?.data?.status === 'PENDING') {
      toast.success('Join request sent');
    } else {
      toast.success('Welcome to the group!');
    }
  };

  const handleLeave = async () => {
    const res: any = await leaveGroup(groupId);

    if (res?.error) {
      toast.error(res?.error?.data?.message || 'Could not leave group');
    } else {
      toast.success('You left the group');
    }
  };

  const handleChat = async () => {
    const res: any = await getConversation(groupId);
    const chat = res?.data?.data;

    if (res?.error || !chat?._id) {
      toast.error(res?.error?.data?.message || 'Chat is unavailable');

      return;
    }
    router.push(`/messages?chat=${chat._id}`);
  };

  return (
    <div className="space-y-4">
      <GroupHeader
        group={group}
        context={context}
        isMember={isMember}
        isPending={isPending}
        isStaff={!!isStaff}
        isOwner={!!isOwner}
        onJoin={handleJoin}
        onLeave={handleLeave}
        onOpenPost={() => setPostModalOpen(true)}
        onOpenChat={handleChat}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 items-start">
        {/* Feed column */}
        <div className="lg:col-span-2 space-y-4 min-w-0">
          {feedLoading && posts.length === 0 ? (
            <CardSkeleton count={3} />
          ) : posts.length === 0 ? (
            <EmptyState
              icon={<FaInfoCircle />}
              title="No posts yet"
              description={
                isMember && context?.canPost !== false
                  ? 'Be the first to share a tip, route, or photo with this group.'
                  : 'When members post here, you will see it in this feed.'
              }
              action={
                isMember && context?.canPost !== false ? (
                  <CommunityButton
                    variant="primary"
                    size="sm"
                    onPress={() => setPostModalOpen(true)}
                  >
                    Write the first post
                  </CommunityButton>
                ) : null
              }
            />
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <FadeIn key={post._id}>
                  <GroupPostCard post={post as TPost} />
                </FadeIn>
              ))}
            </div>
          )}

          {meta && meta.totalPage > 1 && (
            <div className="flex justify-center items-center gap-3">
              <CommunityButton
                variant="ghost"
                size="sm"
                isDisabled={page <= 1}
                onPress={() => setPage((p) => p - 1)}
              >
                Previous
              </CommunityButton>
              <span className="text-sm text-default-500 tabular-nums">
                {meta.page} / {meta.totalPage}
              </span>
              <CommunityButton
                variant="ghost"
                size="sm"
                isDisabled={page >= meta.totalPage}
                onPress={() => setPage((p) => p + 1)}
              >
                Next
              </CommunityButton>
            </div>
          )}
        </div>

        {/* Sticky sidebar */}
        <FadeIn delay={0.08} className="lg:sticky lg:top-24 space-y-4 min-w-0">
          <CommunityCard className="p-5 space-y-4" hover={false}>
            <h3 className="flex items-center gap-2 text-sm font-bold text-default-800 uppercase tracking-wider">
              <FaInfoCircle className="text-sage-500" /> About
            </h3>
            <p className="text-sm text-default-600 leading-relaxed">
              {group.description}
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="text-xs px-2.5 py-1 rounded-full bg-sage-100 dark:bg-sage-500/15 text-sage-700 dark:text-sage-300 font-semibold">
                {group.category}
              </span>
              {group.location && (
                <span className="text-xs px-2.5 py-1 rounded-full bg-default-100 text-default-600">
                  📍 {group.location}
                </span>
              )}
            </div>
            <p className="text-xs text-default-400">
              Created {formatRelative(group.createdAt)}
            </p>
          </CommunityCard>

          {ownerUser && (
            <CommunityCard className="p-5 space-y-3" hover={false}>
              <h3 className="flex items-center gap-2 text-sm font-bold text-default-800 uppercase tracking-wider">
                <FaShieldHalved className="text-sage-500" /> Owner
              </h3>
              <Link
                href={`/profile/${ownerUser._id}`}
                className="flex items-center gap-3 group"
              >
                <Avatar
                  name={ownerUser.name?.charAt(0)?.toUpperCase()}
                  src={ownerUser.image || undefined}
                  className="w-10 h-10 flex-shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-default-800 group-hover:underline truncate">
                    {ownerUser.name}
                  </p>
                  <p className="text-xs text-default-400">Group owner</p>
                </div>
              </Link>
            </CommunityCard>
          )}

          {Array.isArray(group.rules) && group.rules.length > 0 && (
            <CommunityCard className="p-5 space-y-3" hover={false}>
              <h3 className="flex items-center gap-2 text-sm font-bold text-default-800 uppercase tracking-wider">
                <FaClipboardList className="text-sage-500" /> Group rules
              </h3>
              <ol className="space-y-2">
                {group.rules.map((rule, i) => (
                  <li
                    key={i}
                    className="flex gap-2.5 text-sm text-default-600 leading-snug"
                  >
                    <span className="mt-0.5 h-5 w-5 flex-shrink-0 rounded-full bg-sage-100 dark:bg-sage-500/15 text-sage-700 dark:text-sage-300 text-[11px] font-bold flex items-center justify-center">
                      {i + 1}
                    </span>
                    {rule}
                  </li>
                ))}
              </ol>
            </CommunityCard>
          )}
        </FadeIn>
      </div>

      <GroupPostModal
        groupId={groupId}
        isOpen={postModalOpen}
        onOpenChange={() => setPostModalOpen((v) => !v)}
      />
    </div>
  );
}
