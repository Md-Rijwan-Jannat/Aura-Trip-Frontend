"use client";

import React, { Suspense, useState } from "react";
import { Button } from "@nextui-org/button";
import { useTheme } from "next-themes";
import { FiSun, FiLock, FiBell, FiShield, FiChevronRight, FiEdit2 } from "react-icons/fi";
import { Avatar } from "@nextui-org/avatar";
import ThemeDropdown from "@/src/components/modal/themeDropdown";
import { Switch } from "@nextui-org/switch";
import { useUser } from "@/src/hooks/useUser";
import Link from "next/link";
import ChangePasswordModal from "../../modal/passwordChangeModal";
import TwoFactorCard from "./twoFactorCard";
import GoogleConnectionCard from "./googleConnectionCard";

type TabKey = "appearance" | "notifications" | "privacy";

export default function Settings() {
  const { userInfo } = useUser();
  const [activeTab, setActiveTab] = useState<TabKey>("appearance");
  const { theme } = useTheme();

  const SwitchItem = ({ label, description, defaultValue = true }: { label: string; description?: string; defaultValue?: boolean }) => (
    <div className='flex items-center justify-between py-2.5 px-0'>
      <div className='flex-1 pr-3'>
        <p className='text-sm font-medium text-sage-700 dark:text-sage-300'>{label}</p>
        {description && <p className='text-xs text-gray-500 dark:text-gray-400 mt-0.5'>{description}</p>}
      </div>
      <Switch
        classNames={{
          base: "flex flex-row-reverse gap-2 m-0",
          wrapper: "group-data-[selected=true]:bg-sage-600 bg-default-300",
          thumb: "group-data-[selected=true]:bg-white bg-white",
        }}
        size='sm'
        defaultSelected={defaultValue}
      />
    </div>
  );

  const SettingSection = ({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) => (
    <div className='bg-default-50 border border-default-200 rounded-lg p-3 mb-3'>
      <h3 className='text-xs font-semibold text-sage-700 dark:text-sage-300 flex items-center gap-1.5 mb-3'>
        <Icon size={14} /> {title}
      </h3>
      <div className='space-y-2 divide-y divide-default-200'>{children}</div>
    </div>
  );

  const tabs = [
    { key: "appearance" as TabKey, label: "Appearance", icon: FiSun },
    { key: "notifications" as TabKey, label: "Notifications", icon: FiBell },
    { key: "privacy" as TabKey, label: "Privacy", icon: FiShield },
  ];

  return (
    <div className='min-h-screen'>
      <div className='w-full max-w-4xl mx-auto'>
        <div className='p-1 md:p-2'>
          {/* Header */}
          <div className='flex items-center justify-between mb-5'>
            <div>
              <h1 className='text-2xl md:text-3xl font-bold text-sage-700 dark:text-sage-300 mb-0.5'>Settings</h1>
              <p className='text-xs md:text-sm text-gray-500 dark:text-gray-400'>Manage your account preferences</p>
            </div>
            <Link href={`/profile/${userInfo?._id}`}>
              <Avatar
                size='lg'
                className='rounded-full object-cover text-[22px] cursor-pointer hover:opacity-80 transition-opacity'
                name={userInfo?.name?.charAt(0).toUpperCase()}
                src={userInfo?.image || undefined}
              />
            </Link>
          </div>

          {/* Account Overview Card */}
          <div className='bg-white dark:bg-default-100 border border-default-200 rounded-lg p-3 mb-5'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <Avatar
                  size='md'
                  className='rounded-full object-cover text-[16px]'
                  name={userInfo?.name?.charAt(0).toUpperCase()}
                  src={userInfo?.image || undefined}
                />
                <div>
                  <p className='text-sm font-semibold text-sage-700 dark:text-sage-300'>{userInfo?.name}</p>
                  <p className='text-xs text-gray-500 dark:text-gray-400'>{userInfo?.email}</p>
                </div>
              </div>
              <Link href={`/profile/${userInfo?._id}`}>
                <Button isIconOnly variant='light' size='sm' className='text-sage-600 dark:text-sage-400'>
                  <FiChevronRight size={18} />
                </Button>
              </Link>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5'>
            <ChangePasswordModal />
            <Link href='/profile/edit'>
              <Button className='w-full primary-button'>
                <FiEdit2 /> Edit Profile
              </Button>
            </Link>
          </div>

          {/* Settings Card */}
          <div className='bg-white dark:bg-default-100 border border-default-200 rounded-lg overflow-hidden'>
            {/* Tab Buttons */}
            <div className='flex gap-0 border-b border-default-200 p-2 bg-default-50 dark:bg-default-100'>
              {tabs.map((tab) => {
                const Icon = tab.icon;

                const isActive = activeTab === tab.key;

                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs md:text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                      isActive
                        ? "bg-white dark:bg-default-200 text-sage-600 dark:text-sage-400 shadow-sm"
                        : "text-gray-600 dark:text-gray-400 hover:text-sage-600 dark:hover:text-sage-400"
                    }`}
                  >
                    <Icon size={16} />
                    <span className='hidden sm:inline'>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Tab Content */}
            <div className='p-4 md:p-5'>
              {/* Appearance Tab */}
              {activeTab === "appearance" && (
                <div className='space-y-3 animate-fade-in'>
                  <SettingSection title='Theme' icon={FiSun}>
                    <div className='flex items-center justify-between py-2'>
                      <div>
                        <p className='text-sm text-gray-600 dark:text-gray-300'>{theme === "dark" ? "Dark Mode" : "Light Mode"}</p>
                        <p className='text-xs text-gray-500 dark:text-gray-400 mt-0.5'>Choose your preferred color theme</p>
                      </div>
                      <ThemeDropdown />
                    </div>
                  </SettingSection>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === "notifications" && (
                <div className='space-y-3 animate-fade-in'>
                  <SettingSection title='Email Notifications' icon={FiBell}>
                    <SwitchItem label='Messages' description='Get notified about new messages' defaultValue={true} />
                    <div className='py-0' />
                    <SwitchItem label='Comments' description='When someone comments on your post' defaultValue={true} />
                    <div className='py-0' />
                    <SwitchItem label='Likes & Reactions' description='When someone likes your content' defaultValue={true} />
                    <div className='py-0' />
                    <SwitchItem label='Group Activities' description='Updates from groups you follow' defaultValue={true} />
                  </SettingSection>

                  <SettingSection title='Push Notifications' icon={FiBell}>
                    <SwitchItem label='Enable Push Notifications' description='Receive notifications on your device' defaultValue={true} />
                    <div className='py-0' />
                    <SwitchItem label='Sound' description='Play sound for notifications' defaultValue={true} />
                    <div className='py-0' />
                    <SwitchItem label='Vibration' description='Vibrate on notifications' defaultValue={true} />
                  </SettingSection>

                  <SettingSection title='Frequency' icon={FiBell}>
                    <div className='py-2 px-0'>
                      <select className='w-full px-2.5 py-1.5 text-xs md:text-sm border border-default-200 rounded-md bg-default-50 dark:bg-default-200 text-sage-700 dark:text-sage-300 focus:outline-none focus:ring-2 focus:ring-sage-600'>
                        <option>Real-time</option>
                        <option>Hourly digest</option>
                        <option>Daily digest</option>
                        <option>Weekly digest</option>
                      </select>
                    </div>
                  </SettingSection>
                </div>
              )}

              {/* Privacy Tab */}
              {activeTab === "privacy" && (
                <div className='space-y-3 animate-fade-in'>
                  <SettingSection title='Profile Visibility' icon={FiShield}>
                    <SwitchItem label='Make profile public' description='Others can view your profile' defaultValue={true} />
                    <div className='py-0' />
                    <SwitchItem label='Show online status' description='Let others see when you are online' defaultValue={false} />
                    <div className='py-0' />
                    <SwitchItem label='Show last seen' description='Display when you last visited' defaultValue={false} />
                  </SettingSection>

                  <SettingSection title='Message & Calls' icon={FiShield}>
                    <SwitchItem label='Allow messages from anyone' description='Accept messages from non-followers' defaultValue={true} />
                    <div className='py-0' />
                    <SwitchItem label='Allow incoming calls' description='Receive calls from other users' defaultValue={true} />
                    <div className='py-0' />
                    <SwitchItem label='Show read receipts' description='Show when you have read messages' defaultValue={true} />
                  </SettingSection>

                  <SettingSection title='Data & Activity' icon={FiShield}>
                    <SwitchItem label='Allow activity tracking' description='Help us improve with usage analytics' defaultValue={true} />
                    <div className='py-0' />
                    <SwitchItem label='Personalized content' description='Show content based on your interests' defaultValue={true} />
                  </SettingSection>

                  <SettingSection title='Blocking' icon={FiLock}>
                    <div className='py-2'>
                      <Button variant='flat' color='warning' size='sm' className='w-full text-xs'>
                        Manage Blocked Users
                      </Button>
                    </div>
                  </SettingSection>
                </div>
              )}
            </div>
          </div>

          {/* Security Section */}
          <div className='mt-5'>
            <h2 className='text-sm font-bold text-sage-700 dark:text-sage-300 flex items-center gap-1.5 mb-3'>
              <FiLock size={16} /> Security
            </h2>
            <div className='grid grid-cols-1 gap-3'>
              <TwoFactorCard />
              <Suspense fallback={null}>
                <GoogleConnectionCard />
              </Suspense>
            </div>
          </div>

          {/* Danger Zone */}
          <div className='mt-5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3'>
            <h3 className='text-xs font-semibold text-red-700 dark:text-red-400 mb-2'>Danger Zone</h3>
            <p className='text-xs text-red-600 dark:text-red-300 mb-2'>Irreversible actions. Proceed with caution.</p>
            <Button color='danger' variant='flat' size='sm' className='text-xs'>
              Delete Account
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
