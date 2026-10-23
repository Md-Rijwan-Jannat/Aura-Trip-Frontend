import React, { Suspense } from 'react';
import CreateGroupForm from './_component/module/createGroupForm';
import { CardSkeleton } from '@/src/components/ui/communityKit';
import { PageHeader } from '@/src/components/ui/communityKit';
import { FaPlus } from 'react-icons/fa';

export const metadata = {
  title: 'AURA TRIP — Create Group',
};

export default function CreateGroupPage() {
  return (
    <div className="w-full mx-auto">
      <PageHeader
        icon={<FaPlus />}
        title="Create a travel group"
        subtitle="Set the vibe, pick who can join, and invite your people."
      />
      <Suspense fallback={<CardSkeleton count={2} />}>
        <CreateGroupForm />
      </Suspense>
    </div>
  );
}
