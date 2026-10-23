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
        <div className="flex w-full scrollbar-hide">
          {/* Sidebar Menu */}
          <aside className="hidden lg:block md:sticky top-0 pt-28 h-screen w-1/4 lg:w-1/5">
            <MenuBar className="space-y-3" />
          </aside>

          {/* Main Section */}
          <MainShell role={user?.role}>{children}</MainShell>

          {/* Right rail: live preview while creating/editing a group, else suggestions/admin dashboard */}
          <RightRail role={user?.role} />

          {/* Bottom Menu for Mobile Devices */}
          <div className="fixed bottom-0 left-0 right-0 lg:hidden border-t border-default-200">
            <MenuBar className="flex w-full justify-between bg-default-50 py-2 px-2" />
          </div>
        </div>
      </Container>
    </div>
  );
}
