import React, { Suspense } from 'react';
import GroupDiscovery from './_component/module/groupDiscovery';
import { CardSkeleton, PageHeader } from '@/src/components/ui/communityKit';
import { FaUsers } from 'react-icons/fa';

export const metadata = {
  title: 'AURA TRIP — Travel Groups',
};

export default function GroupsPage() {
  return (
    <div className="w-full mx-auto">
      <PageHeader
        icon={<FaUsers />}
        title="Travel Groups"
        subtitle="Communities of travelers sharing tips, routes, and good company."
      />
      <Suspense fallback={<CardSkeleton count={6} />}>
        <GroupDiscovery />
      </Suspense>
    </div>
  );
}
