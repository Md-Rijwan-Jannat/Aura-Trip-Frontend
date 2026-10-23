import React, { Suspense } from 'react';
import { CardSkeleton, PageHeader } from '@/src/components/ui/communityKit';
import { FaGear } from 'react-icons/fa6';
import GroupSettings from '../_component/module/groupSettings';

export const metadata = {
  title: 'AURA TRIP — Group Settings',
};

export default function GroupSettingsPage({
  params,
}: {
  params: { groupId: string };
}) {
  return (
    <div className="w-full mx-auto">
      <PageHeader
        icon={<FaGear />}
        title="Group settings"
        subtitle="Control visibility, joining, posting, and group chat."
      />
      <Suspense fallback={<CardSkeleton count={2} />}>
        <GroupSettings groupId={params.groupId} />
      </Suspense>
    </div>
  );
}
