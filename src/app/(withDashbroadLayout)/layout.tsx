import React from 'react';
import FeedNavbar from './_component/ui/navbar';
import MenuBar from './_component/ui/menuBar';
import Container from '@/src/components/shared/container';
import MiniDashboard from './_component/module/adminDashboard/analytics/miniDashboard';
import Suggestions from './_component/module/dashboardSuggessions';
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
          <main
            className={`flex-1 w-full md:w-[550px] xl:w-[640px] mx-auto ${
              user?.role === 'ADMIN' ? 'lg:w-full' : 'lg:w-3/5'
            }             md:px-4 overflow-hidden pt-20 md:pt-28 mb-20 lg:mb-5`}
          >
            {children}
          </main>

          {/* Premium Posts Section (hidden for ADMIN) */}
          {user?.role === 'ADMIN' ? <MiniDashboard /> : <Suggestions />}

          {/* Bottom Menu for Mobile Devices */}
          <div className="fixed bottom-0 left-0 right-0 lg:hidden border-t border-default-200">
            <MenuBar className="flex w-full justify-between bg-default-50 py-2 px-2" />
          </div>
        </div>
      </Container>
    </div>
  );
}
