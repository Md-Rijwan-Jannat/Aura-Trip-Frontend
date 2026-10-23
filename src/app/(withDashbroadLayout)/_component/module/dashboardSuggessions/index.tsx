'use client';

import React from 'react';
import PremiumPostsSuggestions from './premiumPostsSuggestions';
import ConnectionsSuggestions from './connectionSuggestions';

export default function Suggestions() {
  return (
    <aside className="hidden lg:block md:sticky top-0 pt-28 h-screen w-1/4 space-y-5 overflow-y-auto scrollbar-hide pb-5 px-3 rounded-2xl bg-surface border border-borderSubtle shadow-[0_1px_2px_rgba(31,78,61,0.04),0_8px_24px_-12px_rgba(31,78,61,0.12)]">
      <PremiumPostsSuggestions />
      <ConnectionsSuggestions />
    </aside>
  );
}
