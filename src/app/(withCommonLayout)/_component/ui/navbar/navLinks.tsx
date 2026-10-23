'use client';

import React from 'react';
import clsx from 'clsx';
import { NavbarItem } from '@nextui-org/navbar';
import { link as linkStyles } from '@nextui-org/theme';
import { NavRoutes } from './navRoute';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function NavLinks() {
  const pathname = usePathname();

  return (
    <ul className="flex flex-col md:flex-row gap-8 justify-start lg:ml-10">
      {NavRoutes.map((item) => {
        const isActive = pathname === item.href;

        return (
          <NavbarItem key={item.href}>
            <Link
              href={item.href}
              className={`rounded-lg px-3 py-1.5 text-[14px] transition-colors ${
                isActive
                  ? 'text-sage-600 dark:text-sage-400 font-semibold bg-sage-50 dark:bg-sage-500/10 border border-sage-200 dark:border-sage-700/50'
                  : 'text-default-700 dark:text-default-300 hover:text-sage-600 dark:hover:text-sage-400 hover:bg-default-100/70 dark:hover:bg-white/[0.05] border border-transparent'
              }`}
            >
              {item.label}
            </Link>
          </NavbarItem>
        );
      })}
    </ul>
  );
}
