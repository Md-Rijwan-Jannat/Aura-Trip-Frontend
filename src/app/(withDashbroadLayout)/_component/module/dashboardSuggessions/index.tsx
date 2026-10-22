'use client';

import React from 'react';
import PremiumPostsSuggestions from './premiumPostsSuggestions';
import ConnectionsSuggestions from './connectionSuggestions';

export default function Suggestions() {
  return (
    <aside className="hidden lg:block md:sticky top-0 pt-28 h-screen w-1/4 space-y-5 overflow-y-auto scrollbar-hide pb-5">
      <PremiumPostsSuggestions />
      <ConnectionsSuggestions />
    </aside>
  );
}
