import React, { Suspense } from 'react';
import { CardSkeleton, PageHeader } from '@/src/components/ui/communityKit';
import { FaUsers } from 'react-icons/fa6';
import GroupMembers from '../_component/module/groupMembers';

export const metadata = {
  title: 'AURA TRIP — Group Members',
};

export default function GroupMembersPage({
  params,
}: {
  params: { groupId: string };
}) {
  return (
    <div className="w-full mx-auto">
      <PageHeader
        icon={<FaUsers />}
        title="Members"
        subtitle="Approve requests, set roles, and manage your community."
      />
      <Suspense fallback={<CardSkeleton count={2} />}>
        <GroupMembers groupId={params.groupId} />
      </Suspense>
    </div>
  );
}
