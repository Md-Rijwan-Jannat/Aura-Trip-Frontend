import React, { Suspense } from 'react';
import { CardSkeleton } from '@/src/components/ui/communityKit';
import ShortsFeed from './_component/module/shortsFeed';

export const metadata = {
  title: 'AURA TRIP — Shorts',
};

export default function ShortsPage() {
  return (
    <Suspense fallback={<CardSkeleton count={2} />}>
      <ShortsFeed />
    </Suspense>
  );
}
