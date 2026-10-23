'use client';

import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { FaPlus, FaCompass, FaUsers } from 'react-icons/fa';
import {
  useGetAllGroupsQuery,
  useJoinGroupMutation,
  useLeaveGroupMutation,
} from '@/src/redux/features/group/groupApi';
import { GROUP_CATEGORIES, TGroup } from '@/src/types';
import {
  ChipSelector,
  DropdownSelect,
  SearchInput,
  CardSkeleton,
  EmptyState,
  CommunityButton,
  FadeIn,
} from '@/src/components/ui/communityKit';
import GroupCard from '../../ui/groupCard';

export default function GroupDiscovery() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [tab, setTab] = useState('all');

  const queryParams: Record<string, string> = {};

  if (search.trim()) queryParams.searchTerm = search.trim();
  if (category) queryParams.category = category;
  if (tab === 'mine') queryParams.tab = 'mine';
  if (tab === 'popular') queryParams.tab = 'popular';

  const { data, isLoading, isFetching } = useGetAllGroupsQuery(queryParams);
  const [joinGroup] = useJoinGroupMutation();
  const [leaveGroup] = useLeaveGroupMutation();
  const [actionId, setActionId] = useState<string | null>(null);

  const groups: TGroup[] = useMemo(() => (data?.data as TGroup[]) || [], [data]);

  const handleJoin = async (id: string) => {
    setActionId(id);
    try {
      const res: any = await joinGroup(id);

      if (res?.error) {
        toast.error(res?.error?.data?.message || 'Could not join group');
      } else if (res?.data?.data?.status === 'PENDING') {
        toast.success('Join request sent — waiting for approval');
      } else {
        toast.success('Welcome to the group!');
      }
    } finally {
      setActionId(null);
    }
  };

  const handleLeave = async (id: string) => {
    setActionId(id);
    try {
      const res: any = await leaveGroup(id);

      if (res?.error) {
        toast.error(res?.error?.data?.message || 'Could not leave group');
      } else {
        toast.success('You left the group');
      }
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Hero */}
      <FadeIn className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-sage-700 via-sage-600 to-sage-400 text-white p-5 sm:p-8">
        <div className="absolute -right-10 -top-10 w-48 sm:w-56 h-48 sm:h-56 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -left-16 -bottom-16 w-56 sm:w-64 h-56 sm:h-64 rounded-full bg-white/5 blur-3xl" />
        <div className="relative flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg sm:text-2xl font-bold leading-snug">
              Find your travel people
            </h2>
            <p className="text-white/80 text-sm mt-1 sm:max-w-lg">
              From backpacking routes to food trails — join a community that
              travels the way you do, or start your own.
            </p>
          </div>
          <CommunityButton
            href="/groups/create"
            variant="onDark"
            size="md"
            className="w-full sm:w-auto justify-center flex-shrink-0"
            startContent={<FaPlus />}
          >
            Create a group
          </CommunityButton>
        </div>
      </FadeIn>

      {/* Controls */}
      <FadeIn delay={0.05} className="space-y-3">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search groups by name, rules, location…"
            className="w-full md:max-w-sm"
          />
          <div className="md:ml-auto flex justify-end">
            <DropdownSelect
              ariaLabel="Filter groups"
              value={tab}
              onChange={setTab}
              options={[
                { key: 'all', label: 'Discover' },
                { key: 'mine', label: 'My groups' },
                { key: 'popular', label: 'Popular' },
              ]}
            />
          </div>
        </div>
        <ChipSelector
          options={GROUP_CATEGORIES}
          value={category}
          onChange={setCategory}
          allLabel="All categories"
        />
      </FadeIn>

      {/* Grid */}
      {isLoading || isFetching ? (
        <CardSkeleton count={6} />
      ) : groups.length === 0 ? (
        <EmptyState
          icon={tab === 'mine' ? <FaUsers /> : <FaCompass />}
          title={tab === 'mine' ? 'You have not joined any groups yet' : 'No groups found'}
          description={
            tab === 'mine'
              ? 'Discover travel communities above, or create your own in seconds.'
              : 'Try a different search term or clear the category filter.'
          }
          action={
            tab === 'mine' ? (
              <CommunityButton variant="primary" size="sm" onPress={() => setTab('all')}>
                Discover groups
              </CommunityButton>
            ) : null
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
          {groups.map((group, i) => (
            <FadeIn
              key={group._id}
              delay={Math.min(i * 0.04, 0.3)}
              className="h-full"
            >
              <GroupCard
                group={group}
                onJoin={handleJoin}
                onLeave={handleLeave}
                actionLoadingId={actionId}
              />
            </FadeIn>
          ))}
        </div>
      )}
    </div>
  );
}
