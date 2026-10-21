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
              className={`${
                isActive
                  ? 'text-sage-500 dark:text-sage-400 font-medium text-[14px]'
                  : 'text-default-800 text-[14px]'
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
