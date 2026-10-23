'use client';

import React, { useState } from 'react';
import { Textarea } from '@nextui-org/input';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '@nextui-org/modal';
import { toast } from 'sonner';
import { FaShieldHalved, FaCheck, FaTrashCan } from 'react-icons/fa6';
import { FaTimes } from 'react-icons/fa';
import {
  useGetModerationQueueQuery,
  useModerateGroupPostMutation,
} from '@/src/redux/features/group/groupApi';
import { TPost } from '@/src/types';
import GroupPostCard from '../../../../_component/ui/groupPostCard';
import {
  CommunityButton,
  PillTabs,
  EmptyState,
  CardSkeleton,
  FadeIn,
} from '@/src/components/ui/communityKit';

const TABS = [
  { key: 'PENDING', label: 'Pending' },
  { key: 'REPORTED', label: 'Reported' },
  { key: 'REJECTED', label: 'Rejected' },
  { key: 'REMOVED', label: 'Removed' },
];

export default function GroupModeration({ groupId }: { groupId: string }) {
  const [status, setStatus] = useState('PENDING');
  const [reasonPrompt, setReasonPrompt] = useState<{
    postId: string;
    action: 'reject' | 'remove';
  } | null>(null);
  const [reason, setReason] = useState('');

  const { data, isLoading, isFetching } = useGetModerationQueueQuery({
    id: groupId,
    status,
    limit: 20,
  });
  const [moderate, { isLoading: acting }] = useModerateGroupPostMutation();

  const posts: TPost[] = (data?.data as TPost[]) || [];

  const act = async (
    postId: string,
    action: string,
    actionReason?: string,
  ) => {
    const res: any = await moderate({
      id: groupId,
      postId,
      action,
      ...(actionReason?.trim() ? { reason: actionReason.trim() } : {}),
    });

    if (res?.error) {
      toast.error(res?.error?.data?.message || 'Action failed');
    } else {
      const messages: Record<string, string> = {
        approve: 'Post approved',
        reject: 'Post rejected',
        remove: 'Post removed',
        restore: 'Post restored',
      };

      toast.success(messages[action] || 'Done');
    }
  };

  return (
    <FadeIn className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="w-full sm:w-auto overflow-x-auto scrollbar-hide">
          <PillTabs value={status} onChange={setStatus} tabs={TABS} />
        </div>
        <p className="sm:ml-auto text-xs text-default-500 inline-flex items-center gap-1.5">
          <FaShieldHalved className="text-sage-500" />
          Review posts reported or held for approval
        </p>
      </div>

      {isLoading || isFetching ? (
        <CardSkeleton count={2} />
      ) : posts.length === 0 ? (
        <EmptyState
          icon={<FaShieldHalved />}
          title="Queue is empty"
          description={
            status === 'PENDING'
              ? 'Nothing is waiting for approval right now.'
              : `No ${status.toLowerCase()} posts to review.`
          }
        />
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <GroupPostCard
              key={post._id}
              post={post as TPost}
              staffActions={
                <div className="flex flex-wrap justify-end gap-2">
                  {status !== 'PENDING' && (
                    <CommunityButton
                      variant="secondary"
                      size="sm"
                      startContent={<FaCheck />}
                      onPress={() => act(post._id, 'approve')}
                    >
                      Approve
                    </CommunityButton>
                  )}
                  {status === 'PENDING' && (
                    <>
                      <CommunityButton
                        variant="primary"
                        size="sm"
                        startContent={<FaCheck />}
                        onPress={() => act(post._id, 'approve')}
                      >
                        Approve
                      </CommunityButton>
                      <CommunityButton
                        variant="dangerGhost"
                        size="sm"
                        startContent={<FaTimes />}
                        onPress={() => {
                          setReason('');
                          setReasonPrompt({ postId: post._id, action: 'reject' });
                        }}
                      >
                        Reject
                      </CommunityButton>
                    </>
                  )}
                  {status !== 'REMOVED' && status !== 'PENDING' && (
                    <CommunityButton
                      variant="dangerGhost"
                      size="sm"
                      startContent={<FaTrashCan />}
                      onPress={() => {
                        setReason('');
                        setReasonPrompt({ postId: post._id, action: 'remove' });
                      }}
                    >
                      Remove
                    </CommunityButton>
                  )}
                  {(status === 'REMOVED' || status === 'REJECTED') && (
                    <CommunityButton
                      variant="secondary"
                      size="sm"
                      onPress={() => act(post._id, 'restore')}
                    >
                      Restore
                    </CommunityButton>
                  )}
                </div>
              }
            />
          ))}
        </div>
      )}

      {/* Reason prompt for reject/remove */}
      <Modal
        isOpen={reasonPrompt !== null}
        onOpenChange={(open) => !open && setReasonPrompt(null)}
        size="sm"
        placement="center"
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-0.5">
            {reasonPrompt?.action === 'reject' ? 'Reject post' : 'Remove post'}
            <span className="text-xs font-normal text-default-400">
              The author will see this reason in their notifications
            </span>
          </ModalHeader>
          <ModalBody>
            <Textarea
              minRows={3}
              radius="lg"
              placeholder="e.g. Off-topic or promotional content"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </ModalBody>
          <ModalFooter>
            <CommunityButton
              variant="ghost"
              onPress={() => setReasonPrompt(null)}
            >
              Cancel
            </CommunityButton>
            <CommunityButton
              variant={reasonPrompt?.action === 'remove' ? 'danger' : 'primary'}
              isLoading={acting}
              onPress={async () => {
                if (!reasonPrompt) return;
                await act(reasonPrompt.postId, reasonPrompt.action, reason);
                setReasonPrompt(null);
              }}
            >
              {reasonPrompt?.action === 'reject' ? 'Reject post' : 'Remove post'}
            </CommunityButton>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </FadeIn>
  );
}
