import React from 'react';
import FeedNavbar from './_component/ui/navbar';
import MenuBar from './_component/ui/menuBar';
import Container from '@/src/components/shared/container';
import RightRail from './_component/ui/rightRail';
import MainShell from './_component/ui/mainShell';
import { cookies } from 'next/headers';
import { jwtDecode } from 'jwt-decode';

type TUserProps = {
  id: string;
  email: string;
  role: 'USER' | 'ADMIN';
  iat: number;
  exp: number;
};

export default async function WithDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = cookies().get('accessToken')?.value;
  let user;

  if (token) {
    user = jwtDecode(token) as TUserProps;
  }

  return (
    <div>
      <FeedNavbar />

      <Container>
        <div className="flex w-full scrollbar-hide gap-3 pt-[74px] pb-[10px]">
          {/* Sidebar Menu — sticky surface panel, theme-aware (surface/border tokens) */}
          <aside className="hidden lg:block sticky top-[74px] h-[calc(100vh-84px)] w-1/4 lg:w-1/5 shrink-0">
            <MenuBar className="h-full space-y-2 rounded-2xl bg-surface border border-borderSubtle shadow-[0_1px_2px_rgba(31,78,61,0.04),0_8px_24px_-12px_rgba(31,78,61,0.12)] p-2 overflow-y-auto scrollbar-hide" />
          </aside>

          {/* Main Section */}
          <MainShell role={user?.role}>{children}</MainShell>

          {/* Right rail: live preview while creating/editing a group, else suggestions/admin dashboard */}
          <RightRail role={user?.role} />

          {/* Bottom Menu for Mobile Devices */}
          <div className="fixed bottom-0 left-0 right-0 lg:hidden border-t border-borderSubtle bg-surface/95 backdrop-blur-md">
            <MenuBar className="flex w-full justify-between py-2 px-2" />
          </div>
        </div>
      </Container>
    </div>
  );
}
