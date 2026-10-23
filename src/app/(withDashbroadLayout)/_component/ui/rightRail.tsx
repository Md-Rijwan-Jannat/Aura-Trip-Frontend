'use client';

import React from 'react';
import MiniDashboard from '../module/adminDashboard/analytics/miniDashboard';
import Suggestions from '../module/dashboardSuggessions';
import GroupLivePreview from '../../groups/_component/ui/groupLivePreview';
import RailChatList from './railChatList';
import { useAppSelector } from '@/src/redux/hook';

export default function RightRail({ role }: { role?: 'USER' | 'ADMIN' }) {
  const preview = useAppSelector((state) => state.groupPreview);
  const chatUi = useAppSelector((state) => state.chatUi);

  if (preview.active && preview.data) {
    return (
      <aside className="hidden lg:block md:sticky top-0 pt-28 h-screen w-1/4 space-y-5 overflow-y-auto scrollbar-hide pb-5 px-3 rounded-2xl bg-surface border border-borderSubtle shadow-[0_1px_2px_rgba(31,78,61,0.04),0_8px_24px_-12px_rgba(31,78,61,0.12)]">
        <p className="text-xs font-bold text-default-500 uppercase tracking-wider">
          Live preview
        </p>
        <GroupLivePreview data={preview.data} />
      </aside>
    );
  }

  if (chatUi.open) {
    return <RailChatList />;
  }

  return <>{role === 'ADMIN' ? <MiniDashboard /> : <Suggestions />}</>;
}
