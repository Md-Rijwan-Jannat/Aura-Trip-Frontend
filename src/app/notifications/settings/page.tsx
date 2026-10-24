"use client";

import React from "react";
import Container from "@/src/components/shared/container";
import { Card, CardBody } from "@nextui-org/card";
import { Switch } from "@nextui-org/switch";
import { toast } from "sonner";
import {
  useUpdateNotificationPreferencesMutation,
  useGetNotificationPreferencesQuery,
} from "@/src/redux/features/notification/notificationApi";
import { Loader2 } from "lucide-react";

const NOTIFICATION_CATEGORIES = [
  {
    id: "SOCIAL",
    title: "Social",
    description: "Follows, follow requests, and accepted requests",
    icon: "👥",
  },
  {
    id: "POSTS",
    title: "Posts",
    description: "Likes, reactions, comments on your posts",
    icon: "📝",
  },
  {
    id: "COMMENTS",
    title: "Comments",
    description: "Replies and reactions to your comments",
    icon: "💬",
  },
  {
    id: "MENTIONS",
    title: "Mentions & Tags",
    description: "When you're mentioned or tagged",
    icon: "📌",
  },
  {
    id: "GROUPS",
    title: "Groups",
    description: "Invitations, join requests, and group activity",
    icon: "🏢",
  },
  {
    id: "MESSAGES",
    title: "Messages & Calls",
    description: "New messages and incoming calls",
    icon: "💬",
  },
  {
    id: "SHORTS",
    title: "Shorts",
    description: "Likes, reactions, and comments on your Shorts",
    icon: "🎬",
  },
  {
    id: "SECURITY",
    title: "Security Alerts",
    description: "Important security notifications (always on)",
    icon: "🛡️",
    disabled: true,
  },
];

export default function NotificationSettingsPage() {
  const { data: preferences, isLoading } = useGetNotificationPreferencesQuery({});
  const [updatePreferences] = useUpdateNotificationPreferencesMutation();

  const [categories, setCategories] = React.useState<Record<string, boolean>>({});

  React.useEffect(() => {
    if (preferences?.data) {
      setCategories(preferences.data);
    }
  }, [preferences]);

  const handleToggle = async (category: string, enabled: boolean) => {
    const newCategories = { ...categories, [category]: enabled };

    setCategories(newCategories);

    try {
      await updatePreferences(newCategories).unwrap();
      toast.success(`Notification settings updated for ${category}`);
    } catch (error) {
      // Revert on error
      setCategories(categories);
      toast.error("Failed to update notification settings");
    }
  };

  if (isLoading) {
    return (
      <Container>
        <div className='flex items-center justify-center min-h-screen'>
          <Loader2 className='w-8 h-8 animate-spin text-primary' />
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className='py-8'>
        <div className='max-w-3xl mx-auto'>
          <div className='mb-8'>
            <h1 className='text-3xl font-bold text-gray-900 dark:text-white'>Notification Settings</h1>
            <p className='text-gray-500 dark:text-gray-400 mt-2'>Customize which notifications you receive for different activities</p>
          </div>

          {/* Security Alert Banner */}
          <Card className='mb-8 bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800'>
            <CardBody className='p-4'>
              <div className='flex items-start gap-3'>
                <div className='p-2 bg-amber-100 rounded-full dark:bg-amber-900'>
                  <span className='text-2xl'>⚠️</span>
                </div>
                <div>
                  <h3 className='font-semibold text-gray-900 dark:text-white'>Security Notifications</h3>
                  <p className='text-sm text-gray-600 dark:text-gray-400 mt-1'>
                    Security and account-related notifications cannot be disabled as they contain important information about your account.
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          <div className='space-y-4'>
            {NOTIFICATION_CATEGORIES.map((category) => (
              <Card key={category.id}>
                <CardBody className='p-4'>
                  <div className='flex items-start justify-between'>
                    <div className='flex-1'>
                      <div className='flex items-center gap-2'>
                        <span className='text-2xl'>{category.icon}</span>
                        <h3 className='font-semibold text-lg text-gray-900 dark:text-white'>{category.title}</h3>
                      </div>
                      <p className='text-sm text-gray-500 dark:text-gray-400 mt-2 ml-9'>{category.description}</p>
                    </div>
                    <div className='flex items-center gap-4'>
                      <span className='text-sm font-medium text-gray-600 dark:text-gray-300'>
                        {category.disabled ? "Always On" : "Notifications"}
                      </span>
                      <Switch
                        isSelected={!category.disabled && (categories[category.id] ?? true)}
                        onValueChange={(selected) => handleToggle(category.id, selected)}
                        isDisabled={category.disabled}
                        color='primary'
                        size='md'
                        thumbIcon={({ isSelected, className }) =>
                          isSelected ? (
                            <div className={className}>
                              <svg className='w-3 h-3' fill='currentColor' viewBox='0 0 24 24'>
                                <path d='M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z' />
                              </svg>
                            </div>
                          ) : (
                            <span className='hidden'>Toggle</span>
                          )
                        }
                      >
                        <span className='hidden'>Toggle notifications</span>
                      </Switch>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>

          {/* Summary Card */}
          <Card className='mt-8 bg-primary/5 border-primary/10'>
            <CardBody className='p-6'>
              <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-4'>Summary</h3>
              <div className='flex flex-wrap gap-2'>
                {NOTIFICATION_CATEGORIES.filter((c) => !c.disabled).map((category) => {
                  const isEnabled = categories[category.id] ?? true;

                  return (
                    <span
                      key={category.id}
                      className={`px-3 py-1 rounded-full text-sm ${
                        isEnabled
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                      }`}
                    >
                      {category.title}: {isEnabled ? "On" : "Off"}
                    </span>
                  );
                })}
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </Container>
  );
}
