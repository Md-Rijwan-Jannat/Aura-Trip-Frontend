import React, { Suspense } from 'react';
import { CardSkeleton, PageHeader } from '@/src/components/ui/communityKit';
import { FaShieldHalved } from 'react-icons/fa6';
import GroupModeration from '../_component/module/groupModeration';

export const metadata = {
  title: 'AURA TRIP — Group Moderation',
};

export default function GroupModerationPage({
  params,
}: {
  params: { groupId: string };
}) {
  return (
    <div className="w-full mx-auto">
      <PageHeader
        icon={<FaShieldHalved />}
        title="Moderation"
        subtitle="Review posts waiting for approval or reported by members."
      />
      <Suspense fallback={<CardSkeleton count={2} />}>
        <GroupModeration groupId={params.groupId} />
      </Suspense>
    </div>
  );
}
