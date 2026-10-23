'use client';

import React from 'react';
import MiniDashboard from '../module/adminDashboard/analytics/miniDashboard';
import Suggestions from '../module/dashboardSuggessions';
import GroupLivePreview from '../../groups/_component/ui/groupLivePreview';
import { useAppSelector } from '@/src/redux/hook';

export default function RightRail({ role }: { role?: 'USER' | 'ADMIN' }) {
  const preview = useAppSelector((state) => state.groupPreview);

  if (preview.active && preview.data) {
    return (
      <aside className="hidden lg:block md:sticky top-0 pt-28 h-screen w-1/4 space-y-5 overflow-y-auto scrollbar-hide pb-5">
        <p className="text-xs font-bold text-default-500 uppercase tracking-wider">
          Live preview
        </p>
        <GroupLivePreview data={preview.data} />
      </aside>
    );
  }

  return <>{role === 'ADMIN' ? <MiniDashboard /> : <Suggestions />}</>;
}
