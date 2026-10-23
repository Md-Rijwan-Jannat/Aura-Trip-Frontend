import NextLink from 'next/link';
import React from 'react';
import NavDropdown from '@/src/app/(withCommonLayout)/_component/ui/navbar/navDropdown';
import SearchInput from '@/src/app/(withCommonLayout)/_component/ui/navbar/searchInput';
import BrandLogo from '@/src/components/shared/logo';
import { Bell, Link, Plus } from 'lucide-react';
import { Badge } from '@nextui-org/badge';
import NavRightContent from './navRightContent';

export default function FeedNavbar() {
  return (
    <header className="fixed top-0 z-50 w-full bg-surface/90 backdrop-blur-md border-b border-borderSubtle shadow-[0_1px_2px_rgba(31,78,61,0.06)]">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-1 lg:px-5 py-3">
        <div className="flex items-center gap-3">
          <NextLink className="flex justify-start items-center gap-1 shrink-0" href="/">
            <BrandLogo />
          </NextLink>
          <div className="md:w-[300px]">
            <SearchInput />
          </div>
        </div>
        <NavRightContent />
      </div>
    </header>
  );
}
