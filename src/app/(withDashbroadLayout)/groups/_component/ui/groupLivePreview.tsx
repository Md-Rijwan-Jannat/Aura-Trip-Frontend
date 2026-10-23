'use client';

import React from 'react';
import { GroupPreviewCard } from '@/src/components/ui/communityKit';
import type { GroupPreviewData } from '@/src/redux/features/group/groupPreviewSlice';

export default function GroupLivePreview({ data }: { data: GroupPreviewData }) {
  return (
    <div>
      <GroupPreviewCard
        name={data.name}
        description={data.description}
        category={data.category}
        visibility={data.visibility}
        image={data.image}
        coverImage={data.coverImage}
        memberCount={data.memberCount}
      />
      {data.mode === 'create' && (
        <p className="text-[11px] text-default-400 mt-3 leading-relaxed">
          You can change these settings later from the group page. Only group
          owners can manage members, invites, and moderation.
        </p>
      )}
    </div>
  );
}
