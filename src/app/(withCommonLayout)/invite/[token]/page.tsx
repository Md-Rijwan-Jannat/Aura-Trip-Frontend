'use client';

import React from 'react';
import Link from 'next/link';
import { Avatar } from '@nextui-org/avatar';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { FaUsers, FaEnvelopeOpenText } from 'react-icons/fa6';
import {
  usePreviewGroupInviteQuery,
  useRedeemGroupInviteMutation,
} from '@/src/redux/features/group/groupApi';
import { useAppSelector } from '@/src/redux/hook';
import {
  CommunityCard,
  CommunityButton,
  Badge,
  CoverBanner,
  CardSkeleton,
  FadeIn,
} from '@/src/components/ui/communityKit';

export default function InviteLandingPage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const auth = useAppSelector((state) => state.auth);
  const isLoggedIn = Boolean(auth?.token);

  const { data, isLoading, isError } = usePreviewGroupInviteQuery(token);
  const [redeem, { isLoading: redeeming }] = useRedeemGroupInviteMutation();

  const preview = data?.data as
    | {
        state: string;
        group: {
          _id: string;
          name: string;
          slug: string;
          description: string;
          category: string;
          visibility: string;
          image?: string | null;
          coverImage?: string | null;
          memberCount: number;
        };
      }
    | undefined;

  const handleRedeem = async () => {
    const res: any = await redeem(token);

    if (res?.error) {
      toast.error(res?.error?.data?.message || 'Could not accept the invite');
    } else if (res?.data?.data?.status === 'PENDING') {
      toast.success('Request sent — waiting for approval');
      router.push(`/groups/${res?.data?.data?.slug || preview?.group?._id}`);
    } else {
      toast.success('You joined the group!');
      router.push(`/groups/${res?.data?.data?.slug || preview?.group?._id}`);
    }
  };

  const handleLogin = () => {
    router.push(`/login?redirect=${encodeURIComponent(`/invite/${token}`)}`);
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-md px-4 py-10 sm:py-16">
        <CardSkeleton count={1} />
      </div>
    );
  }

  if (isError || !preview) {
    return (
      <div className="mx-auto max-w-md px-4 py-10 sm:py-16">
        <FadeIn>
          <CommunityCard hover={false} className="p-8 text-center">
            <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-500/10 text-red-500 flex items-center justify-center text-2xl mx-auto mb-4">
              <FaEnvelopeOpenText />
            </div>
            <h1 className="text-xl font-bold text-default-800">
              Invitation not found
            </h1>
            <p className="text-sm text-default-500 mt-2">
              This invite link is invalid, expired, or has been revoked. Ask the
              group owner for a fresh link.
            </p>
            <CommunityButton
              href="/groups"
              variant="secondary"
              size="sm"
              className="mt-5"
            >
              Browse groups
            </CommunityButton>
          </CommunityCard>
        </FadeIn>
      </div>
    );
  }

  const invalid = preview.state !== 'VALID';

  return (
    <div className="mx-auto max-w-md px-4 py-10 sm:py-16">
      <FadeIn>
        <CommunityCard hover={false} className="overflow-hidden">
          <div className="relative">
            <CoverBanner
              src={preview.group.coverImage || preview.group.image}
              alt={preview.group.name}
              height="h-32"
            />
            <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/30 to-transparent" />
          </div>
          <div className="px-6 pb-6 -mt-8 text-center">
            <Avatar
              radius="lg"
              className="w-16 h-16 mx-auto ring-4 ring-surface shadow-lg text-2xl"
              name={preview.group.name.charAt(0).toUpperCase()}
              src={preview.group.image || undefined}
            />
            <h1 className="text-xl font-bold text-default-900 mt-3">
              {preview.group.name}
            </h1>
            <div className="flex justify-center flex-wrap items-center gap-2 mt-2">
              <Badge color="PUBLIC">{preview.group.category}</Badge>
              <span className="inline-flex items-center gap-1 text-xs text-default-500">
                <FaUsers className="text-sage-500" />
                {preview.group.memberCount}{' '}
                {preview.group.memberCount === 1 ? 'member' : 'members'}
              </span>
            </div>
            <p className="text-sm text-default-500 mt-3 leading-relaxed">
              {preview.group.description}
            </p>

            <div className="mt-6">
              {invalid ? (
                <p className="text-sm font-semibold text-red-500">
                  This invitation is{' '}
                  {preview.state.toLowerCase().replace('_', ' ')}.
                </p>
              ) : isLoggedIn ? (
                <CommunityButton
                  size="lg"
                  className="w-full"
                  isLoading={redeeming}
                  onPress={handleRedeem}
                >
                  Accept invitation
                </CommunityButton>
              ) : (
                <CommunityButton size="lg" className="w-full" onPress={handleLogin}>
                  Sign in to join
                </CommunityButton>
              )}
            </div>
          </div>
        </CommunityCard>
      </FadeIn>
    </div>
  );
}
