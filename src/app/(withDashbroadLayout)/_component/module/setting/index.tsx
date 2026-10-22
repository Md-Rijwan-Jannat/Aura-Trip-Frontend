'use client';

import React, { Suspense, useState } from 'react';
import { Button } from '@nextui-org/button';
import { useTheme } from 'next-themes';
import { FiMoon, FiSun, FiLock, FiBell, FiShield } from 'react-icons/fi';
import { Avatar } from '@nextui-org/avatar';
import ThemeDropdown from '@/src/components/modal/themeDropdown';
import { Switch } from '@nextui-org/switch';
import { Modal, ModalBody, ModalFooter, ModalHeader } from '@nextui-org/modal';
import { Input } from '@nextui-org/input';
import { useUser } from '@/src/hooks/useUser';
import Link from 'next/link';
import UpdateUserModal from '../../modal/updateUserModal';
import ChangePasswordModal from '../../modal/passwordChangeModal';
import TwoFactorCard from './twoFactorCard';
import GoogleConnectionCard from './googleConnectionCard';

export default function Settings() {
  const { userInfo } = useUser();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  const [password, setPassword] = useState({
    current: '',
    new: '',
    confirm: '',
  });

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword({ ...password, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen">
      <div className="w-full mx-auto bg-default-50  rounded-xl shadow-2xl overflow-hidden border border-default-100">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-xl font-bold text-sage-700 dark:text-sage-300 ">Settings</h1>
            <Link href={`/profile/${userInfo?._id}`}>
              <Avatar
                size="lg"
                className="rounded-full object-cover text-[22px]"
                name={userInfo?.name?.charAt(0).toUpperCase()}
                src={userInfo?.image || undefined}
              />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Change Password Button */}
            <ChangePasswordModal />

            {/* Edit Profile Button */}
            <UpdateUserModal
              userId={userInfo?._id || ''}
              bio={userInfo?.bio || ''}
              defaultName={userInfo?.name || ''}
              defaultImage={userInfo?.image}
              country={userInfo?.country}
              address={userInfo?.address}
            />

            {/* Theme Toggle */}
            <div className="flex items-center justify-between bg-default-100 border border-default-200 p-4 rounded-lg">
              <p className="text-sage-700 dark:text-sage-300  flex items-center gap-2">
                {theme === 'dark' ? <FiMoon /> : <FiSun />} Theme
              </p>
              <ThemeDropdown />
            </div>

            {/* Notification Preferences */}
            <div className="bg-default-100 border border-default-200 p-4 rounded-lg">
              <p className="text-sage-700 dark:text-sage-300  flex items-center gap-2 mb-2">
                <FiBell /> Notifications
              </p>
              <div className="flex flex-col gap-2">
                <Switch color="secondary" size="sm" defaultSelected>
                  Email Notifications
                </Switch>
                <Switch color="secondary" size="sm" defaultSelected>
                  Push Notifications
                </Switch>
              </div>
            </div>

            {/* Privacy Settings */}
            <div className="bg-default-100 border border-default-200 p-4 rounded-lg col-span-full">
              <p className="text-sage-700 dark:text-sage-300  flex items-center gap-2 mb-2">
                <FiShield /> Privacy
              </p>
              <div className="flex flex-col gap-2">
                <Switch color="secondary" size="sm" defaultSelected>
                  Make profile public
                </Switch>
                <Switch color="secondary" size="sm">
                  Allow others to see online status
                </Switch>
              </div>
            </div>

            {/* Security */}
            <div className="col-span-full">
              <h2 className="text-lg font-bold text-sage-700 dark:text-sage-300 flex items-center gap-2 mb-3">
                <FiLock /> Security
              </h2>
              <div className="grid grid-cols-1 gap-4">
                <TwoFactorCard />
                <Suspense fallback={null}>
                  <GoogleConnectionCard />
                </Suspense>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      <Modal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        className="bg-surface p-6 rounded-2xl"
      >
        <ModalHeader>
          <p className="text-2xl font-bold text-sage-700 dark:text-sage-300 ">Change Password</p>
        </ModalHeader>
        <ModalBody>
          <Input
            label="Current Password"
            type="password"
            name="current"
            value={password.current}
            onChange={handlePasswordChange}
            className="mb-4"
          />
          <Input
            label="New Password"
            type="password"
            name="new"
            value={password.new}
            onChange={handlePasswordChange}
            className="mb-4"
          />
          <Input
            label="Confirm New Password"
            type="password"
            name="confirm"
            value={password.confirm}
            onChange={handlePasswordChange}
          />
        </ModalBody>
        <ModalFooter>
          <Button color="danger" onPress={() => setIsPasswordModalOpen(false)}>
            Change Password
          </Button>
        </ModalFooter>
      </Modal>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        className="bg-surface p-6 rounded-2xl"
      >
        <ModalHeader>
          <p className="text-2xl font-bold text-sage-700 dark:text-sage-300 ">Edit Profile</p>
        </ModalHeader>
        <ModalBody>
          <Input label="Name" placeholder="Your Name" className="mb-4" />
          <Input
            label="Email"
            placeholder="your.email@example.com"
            className="mb-4"
          />
          <Input label="Bio" placeholder="Tell us about yourself" />
        </ModalBody>
        <ModalFooter>
          <Button color="danger" onPress={() => setIsProfileModalOpen(false)}>
            Save Changes
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
