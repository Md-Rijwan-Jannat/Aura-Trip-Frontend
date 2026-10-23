import React, { Suspense } from 'react';
import { CardSkeleton, PageHeader } from '@/src/components/ui/communityKit';
import { FaLink } from 'react-icons/fa6';
import GroupInvites from '../_component/module/groupInvites';

export const metadata = {
  title: 'AURA TRIP — Group Invites',
};

export default function GroupInvitesPage({
  params,
}: {
  params: { groupId: string };
}) {
  return (
    <div className="w-full mx-auto">
      <PageHeader
        icon={<FaLink />}
        title="Invite links"
        subtitle="Invite links are the only way for outsiders to join a closed group. Tokens are unguessable and only their hashes are stored."
      />
      <Suspense fallback={<CardSkeleton count={2} />}>
        <GroupInvites groupId={params.groupId} />
      </Suspense>
    </div>
  );
}
