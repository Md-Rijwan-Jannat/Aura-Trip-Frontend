import React, { Suspense } from 'react';
import { CardSkeleton } from '@/src/components/ui/communityKit';
import GroupDetail from './_component/module/groupDetail';

export const metadata = {
  title: 'AURA TRIP — Group',
};

export default function GroupPage({ params }: { params: { groupId: string } }) {
  return (
    <div className="w-full mx-auto">
      <Suspense fallback={<CardSkeleton count={2} />}>
        <GroupDetail groupId={params.groupId} />
      </Suspense>
    </div>
  );
}
