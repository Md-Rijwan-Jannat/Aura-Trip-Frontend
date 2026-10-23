'use client';

import React, { useState } from 'react';
import { Input } from '@nextui-org/input';
import { toast } from 'sonner';
import { FaCopy, FaPlus, FaTrashCan, FaLink } from 'react-icons/fa6';
import { FaExclamationCircle } from 'react-icons/fa';
import {
  useCreateGroupInviteMutation,
  useListGroupInvitesQuery,
  useRevokeGroupInviteMutation,
} from '@/src/redux/features/group/groupApi';
import { TGroupInvite } from '@/src/types';
import {
  CommunityCard,
  CommunityButton,
  Badge,
  ProgressBar,
  ConfirmDialog,
  EmptyState,
  ListSkeleton,
  FadeIn,
} from '@/src/components/ui/communityKit';

export default function GroupInvites({ groupId }: { groupId: string }) {
  const { data, isLoading } = useListGroupInvitesQuery(groupId);
  const [createInvite, { isLoading: creating }] = useCreateGroupInviteMutation();
  const [revokeInvite] = useRevokeGroupInviteMutation();
  const [maxUses, setMaxUses] = useState('');
  const [confirmRevoke, setConfirmRevoke] = useState<TGroupInvite | null>(null);
  // Raw tokens are returned exactly once — keep them in memory for copying.
  const [freshTokens, setFreshTokens] = useState<Record<string, string>>({});

  const invites: TGroupInvite[] = (data?.data as TGroupInvite[]) || [];

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

  const handleCreate = async () => {
    const payload: Record<string, unknown> = {};

    if (maxUses.trim()) payload.maxUses = Number(maxUses);
    const res: any = await createInvite({ id: groupId, ...payload });

    if (res?.error) {
      toast.error(res?.error?.data?.message || 'Could not create invite');
    } else {
      const inviteId = res?.data?.data?.invite?._id;
      const token = res?.data?.data?.token;

      if (inviteId && token) {
        setFreshTokens((prev) => ({ ...prev, [inviteId]: token }));
      }
      toast.success('Invite link created — copy it now, it is shown only once');
    }
  };

  const handleRevoke = async () => {
    if (!confirmRevoke) return;
    const res: any = await revokeInvite({ id: groupId, inviteId: confirmRevoke._id });

    if (res?.error) {
      toast.error(res?.error?.data?.message || 'Could not revoke invite');
    } else {
      toast.success('Invite revoked');
    }
  };

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  return (
    <FadeIn className="space-y-4">
      {/* Create card */}
      <CommunityCard hover={false} className="p-4 sm:p-6 space-y-4">
        <div>
          <h2 className="font-bold text-default-900">Create an invite link</h2>
          <p className="text-sm text-default-500">
            Share the link with people you want in the group. Tokens are stored
            securely — the raw link appears only once.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 sm:items-end min-w-0">
          <Input
            label="Max uses (optional)"
            type="number"
            min={1}
            radius="lg"
            variant="flat"
            labelPlacement="outside"
            placeholder="Unlimited"
            classNames={{ inputWrapper: 'bg-default-100/60 sm:w-48' }}
            value={maxUses}
            onValueChange={setMaxUses}
          />
          <CommunityButton
            size="lg"
            startContent={<FaPlus />}
            isLoading={creating}
            onPress={handleCreate}
          >
            Create invite link
          </CommunityButton>
        </div>
      </CommunityCard>

      {/* List */}
      {isLoading ? (
        <ListSkeleton count={3} />
      ) : invites.length === 0 ? (
        <EmptyState
          icon={<FaLink />}
          title="No invites yet"
          description="Create your first invite link above to bring people into the group."
        />
      ) : (
        <div className="space-y-3">
          {invites.map((invite) => {
            const raw = freshTokens[invite._id];
            const link = raw ? `${baseUrl}/invite/${raw}` : null;

            return (
              <CommunityCard key={invite._id} hover={false} className="p-4 sm:p-5 space-y-3 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge color={invite.status}>{invite.status}</Badge>
                  {invite.requiresApproval ? (
                    <Badge color="PENDING">Requires approval</Badge>
                  ) : null}
                  {invite.label ? (
                    <span className="text-sm font-semibold text-default-700">
                      {invite.label}
                    </span>
                  ) : null}
                  <span className="ml-auto text-sm text-default-500 tabular-nums">
                    {invite.usedCount}
                    {invite.maxUses != null ? ` / ${invite.maxUses}` : ' uses'}
                  </span>
                </div>

                <ProgressBar value={invite.usedCount} max={invite.maxUses ?? null} />

                <div className="flex flex-wrap items-center gap-2 text-xs text-default-400">
                  {invite.expiresAt ? (
                    <span>
                      Expires {new Date(invite.expiresAt).toLocaleDateString()}
                    </span>
                  ) : (
                    <span>No expiry</span>
                  )}
                </div>

                {link ? (
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 min-w-0">
                    <Input
                      isReadOnly
                      size="sm"
                      radius="lg"
                      variant="flat"
                      value={link}
                      classNames={{ inputWrapper: 'bg-default-100/60' }}
                      className="w-full sm:flex-1 min-w-0"
                    />
                    <CommunityButton
                      variant="primary"
                      size="sm"
                      className="justify-center flex-shrink-0"
                      startContent={<FaCopy />}
                      onPress={() => copy(link)}
                    >
                      Copy
                    </CommunityButton>
                  </div>
                ) : (
                  <p className="flex items-start gap-1.5 text-xs text-default-400">
                    <FaExclamationCircle className="mt-0.5 flex-shrink-0" />
                    Token shown only once at creation — create a new invite to get
                    a fresh link.
                  </p>
                )}

                {invite.status === 'ACTIVE' && (
                  <div>
                    <CommunityButton
                      variant="dangerGhost"
                      size="sm"
                      startContent={<FaTrashCan />}
                      onPress={() => setConfirmRevoke(invite)}
                    >
                      Revoke
                    </CommunityButton>
                  </div>
                )}
              </CommunityCard>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        isOpen={confirmRevoke !== null}
        onOpenChange={(open) => !open && setConfirmRevoke(null)}
        danger
        title="Revoke this invite?"
        description="The link will stop working immediately. Members who already joined stay in the group."
        confirmLabel="Revoke invite"
        onConfirm={handleRevoke}
      />
    </FadeIn>
  );
}
