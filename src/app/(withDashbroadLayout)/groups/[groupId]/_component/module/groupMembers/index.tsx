'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { Avatar } from '@nextui-org/avatar';
import { Select, SelectItem } from '@nextui-org/select';
import { toast } from 'sonner';
import { FaCheck, FaTimes, FaUsers, FaUserClock, FaBan } from 'react-icons/fa';
import {
  useGetSingleGroupQuery,
  useListGroupMembersQuery,
  useReviewJoinRequestMutation,
  useChangeMemberRoleMutation,
  useRemoveMemberMutation,
  useUnbanMemberMutation,
} from '@/src/redux/features/group/groupApi';
import { TGroup, TGroupMembership } from '@/src/types';
import { useUser } from '@/src/hooks/useUser';
import {
  CommunityCard,
  CommunityButton,
  Badge,
  PillTabs,
  SearchInput,
  ConfirmDialog,
  EmptyState,
  ListSkeleton,
  FadeIn,
} from '@/src/components/ui/communityKit';

const ROLE_OPTIONS = [
  { key: 'MEMBER', label: 'Member' },
  { key: 'MODERATOR', label: 'Moderator' },
  { key: 'ADMIN', label: 'Admin' },
];

export default function GroupMembers({ groupId }: { groupId: string }) {
  const { userInfo } = useUser();
  const [tab, setTab] = useState('APPROVED');
  const [search, setSearch] = useState('');
  const [confirm, setConfirm] = useState<{
    type: 'remove' | 'ban' | null;
    member?: TGroupMembership;
  }>({ type: null });

  const { data: groupRes } = useGetSingleGroupQuery(groupId);
  const { data: membersRes, isLoading } = useListGroupMembersQuery({
    id: groupId,
    status: tab,
    limit: 50,
  });
  const [review] = useReviewJoinRequestMutation();
  const [changeRole] = useChangeMemberRoleMutation();
  const [removeMember] = useRemoveMemberMutation();
  const [unban] = useUnbanMemberMutation();

  const groupData = groupRes?.data as
    | { group: TGroup; membership: unknown }
    | undefined;
  const group = groupData?.group;
  const ownerId =
    typeof group?.owner === 'string' ? group?.owner : group?.owner?._id;
  const isOwner = String(ownerId) === String(userInfo?._id);
  const canManage = isOwner || userInfo?.role === 'ADMIN';

  const members: TGroupMembership[] =
    (membersRes?.data as TGroupMembership[]) || [];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    if (!q) return members;

    return members.filter(
      (m) =>
        m.user?.name?.toLowerCase().includes(q) ||
        m.user?.email?.toLowerCase().includes(q),
    );
  }, [members, search]);

  const run = async (fn: any, args: any, okMsg: string) => {
    const res: any = await fn(args);

    if (res?.error) {
      toast.error(res?.error?.data?.message || 'Action failed');
    } else {
      toast.success(okMsg);
    }
  };

  const emptyByTab = {
    APPROVED: {
      icon: <FaUsers />,
      title: 'No members found',
      description: search
        ? 'Try a different name or email.'
        : 'Members will appear here as they join.',
    },
    PENDING: {
      icon: <FaUserClock />,
      title: 'No pending requests',
      description: 'Join requests that need your approval will wait here.',
    },
    BANNED: {
      icon: <FaBan />,
      title: 'No banned members',
      description: 'Members you ban can be restored from this list.',
    },
  }[tab as 'APPROVED' | 'PENDING' | 'BANNED'];

  return (
    <FadeIn className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <PillTabs
          value={tab}
          onChange={setTab}
          tabs={[
            { key: 'APPROVED', label: 'Members' },
            { key: 'PENDING', label: 'Requests' },
            { key: 'BANNED', label: 'Banned' },
          ]}
        />
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search members…"
          className="w-full sm:ml-auto sm:max-w-xs"
        />
      </div>

      {isLoading ? (
        <ListSkeleton count={5} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={emptyByTab?.icon}
          title={emptyByTab?.title || 'Nothing here'}
          description={emptyByTab?.description}
        />
      ) : (
        <CommunityCard hover={false} className="divide-y divide-borderSubtle overflow-hidden">
          {filtered.map((m) => {
            const user = m.user;

            return (
              <div
                key={m._id}
                className="flex flex-wrap items-center gap-x-3 gap-y-2 px-4 sm:px-5 py-3.5 min-w-0 hover:bg-sage-50/50 dark:hover:bg-sage-500/5 transition-colors"
              >
                <Avatar
                  as={Link}
                  href={`/profile/${user?._id}`}
                  name={user?.name?.charAt(0)?.toUpperCase()}
                  src={user?.image || undefined}
                  className="w-11 h-11 flex-shrink-0"
                />
                <div className="flex-1 basis-40 min-w-0">
                  <Link
                    href={`/profile/${user?._id}`}
                    className="text-sm font-bold text-default-800 hover:underline"
                  >
                    {user?.name}
                  </Link>
                  <p className="text-xs text-default-400 truncate">{user?.email}</p>
                </div>

                <Badge color={m.role}>{m.role}</Badge>

                {tab === 'PENDING' && canManage && (
                  <div className="flex gap-2">
                    <CommunityButton
                      variant="primary"
                      size="sm"
                      startContent={<FaCheck />}
                      onPress={() =>
                        run(
                          review,
                          { id: groupId, userId: user?._id, decision: 'APPROVED' },
                          'Member approved',
                        )
                      }
                    >
                      Approve
                    </CommunityButton>
                    <CommunityButton
                      variant="dangerGhost"
                      size="sm"
                      startContent={<FaTimes />}
                      onPress={() =>
                        run(
                          review,
                          { id: groupId, userId: user?._id, decision: 'REJECTED' },
                          'Request rejected',
                        )
                      }
                    >
                      Reject
                    </CommunityButton>
                  </div>
                )}

                {tab === 'APPROVED' && m.role !== 'OWNER' && canManage && (
                  <>
                    <Select
                      size="sm"
                      radius="lg"
                      className="w-36 max-w-full"
                      selectedKeys={[m.role]}
                      onSelectionChange={(keys) => {
                        const role = Array.from(keys)[0] as string;

                        if (role && role !== m.role) {
                          run(
                            changeRole,
                            { id: groupId, userId: user?._id, role },
                            'Role updated',
                          );
                        }
                      }}
                    >
                      {ROLE_OPTIONS.map((r) => (
                        <SelectItem key={r.key} value={r.key}>
                          {r.label}
                        </SelectItem>
                      ))}
                    </Select>
                    <CommunityButton
                      variant="dangerGhost"
                      size="sm"
                      onPress={() => setConfirm({ type: 'remove', member: m })}
                    >
                      Remove
                    </CommunityButton>
                    <CommunityButton
                      variant="ghost"
                      size="sm"
                      className="text-red-500"
                      onPress={() => setConfirm({ type: 'ban', member: m })}
                    >
                      Ban
                    </CommunityButton>
                  </>
                )}

                {tab === 'BANNED' && canManage && (
                  <CommunityButton
                    variant="secondary"
                    size="sm"
                    onPress={() =>
                      run(unban, { id: groupId, userId: user?._id }, 'Member unbanned')
                    }
                  >
                    Unban
                  </CommunityButton>
                )}
              </div>
            );
          })}
        </CommunityCard>
      )}

      {!canManage && (
        <p className="text-xs text-default-400">
          You can view members, but only the group owner can manage them.
        </p>
      )}

      <ConfirmDialog
        isOpen={confirm.type !== null}
        onOpenChange={(open) => !open && setConfirm({ type: null })}
        danger
        title={
          confirm.type === 'ban'
            ? `Ban ${confirm.member?.user?.name}?`
            : `Remove ${confirm.member?.user?.name}?`
        }
        description={
          confirm.type === 'ban'
            ? 'They will lose access immediately and cannot rejoin until unbanned.'
            : 'They will lose access to the group posts and chat. They can rejoin later if the group allows it.'
        }
        confirmLabel={confirm.type === 'ban' ? 'Ban member' : 'Remove member'}
        onConfirm={() => {
          if (!confirm.member || !confirm.type) return;
          run(
            removeMember,
            {
              id: groupId,
              userId: confirm.member.user?._id,
              ban: confirm.type === 'ban',
            },
            confirm.type === 'ban' ? 'Member banned' : 'Member removed',
          );
        }}
      />
    </FadeIn>
  );
}
