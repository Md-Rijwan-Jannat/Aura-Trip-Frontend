'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Input, Textarea } from '@nextui-org/input';
import { Switch } from '@nextui-org/switch';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '@nextui-org/modal';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  FaLock,
  FaDoorOpen,
  FaUserClock,
  FaEnvelopeOpenText,
  FaUsers,
  FaUserShield,
  FaBell,
  FaComments,
  FaClipboardCheck,
  FaRightLeft,
  FaTrashCan,
} from 'react-icons/fa6';
import { FaGlobeAmericas, FaExclamationTriangle } from 'react-icons/fa';
import {
  useGetSingleGroupQuery,
  useUpdateGroupMutation,
  useDeleteGroupMutation,
  useTransferOwnershipMutation,
} from '@/src/redux/features/group/groupApi';
import { GROUP_CATEGORIES, TGroup } from '@/src/types';
import {
  CommunityCard,
  CommunityButton,
  ChipSelector,
  SelectCard,
  SettingRow,
  ConfirmDialog,
  CardSkeleton,
  FadeIn,
} from '@/src/components/ui/communityKit';
import GroupImagesEditor from '../../../../_component/ui/groupImagesEditor';
import { uploadToCloudinary } from '@/src/utils/uploadCloudinary';
import { useAppDispatch } from '@/src/redux/hook';
import {
  setGroupPreview,
  clearGroupPreview,
} from '@/src/redux/features/group/groupPreviewSlice';

interface FormInputs {
  name: string;
  description: string;
  category: string;
  visibility: string;
  joinPolicy: string;
  postPermission: string;
  postApprovalEnabled: boolean;
  chatEnabled: boolean;
  notifyOnNewPost: boolean;
}

export default function GroupSettings({ groupId }: { groupId: string }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { data, isLoading } = useGetSingleGroupQuery(groupId);
  const [updateGroup, { isLoading: saving }] = useUpdateGroupMutation();
  const [deleteGroup, { isLoading: deleting }] = useDeleteGroupMutation();
  const [transfer, { isLoading: transferring }] = useTransferOwnershipMutation();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [transferUserId, setTransferUserId] = useState('');
  const [image, setImage] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const groupData = data?.data as
    | { group: TGroup; membership: unknown }
    | undefined;
  const group = groupData?.group;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { isSubmitting },
  } = useForm<FormInputs>({
    defaultValues: {
      name: '',
      description: '',
      category: 'Travel Tips',
      visibility: 'PUBLIC',
      joinPolicy: 'OPEN',
      postPermission: 'ALL_MEMBERS',
      postApprovalEnabled: false,
      chatEnabled: true,
      notifyOnNewPost: true,
    },
  });

  useEffect(() => {
    if (group) {
      reset({
        name: group.name,
        description: group.description,
        category: group.category,
        visibility: group.visibility,
        joinPolicy: group.joinPolicy,
        postPermission: group.postPermission,
        postApprovalEnabled: group.postApprovalEnabled,
        chatEnabled: group.chatEnabled,
        notifyOnNewPost: group.notifyOnNewPost,
      });
      setImage(group.image || '');
      setCoverImage(group.coverImage || '');
      setImageFile(null);
      setCoverFile(null);
    }
  }, [group, reset]);

  const watchedName = watch('name');
  const watchedDesc = watch('description');
  const watchedCategory = watch('category');
  const watchedVisibility = watch('visibility');

  const previewData = useMemo(
    () => ({
      mode: 'edit' as const,
      name: watchedName,
      description: watchedDesc,
      category: watchedCategory,
      visibility: watchedVisibility,
      image: image || undefined,
      coverImage: coverImage || undefined,
      memberCount: group?.memberCount,
    }),
    [
      watchedName,
      watchedDesc,
      watchedCategory,
      watchedVisibility,
      image,
      coverImage,
      group?.memberCount,
    ]
  );

  useEffect(() => {
    if (!group) return;
    dispatch(setGroupPreview(previewData));
  }, [previewData, group, dispatch]);

  useEffect(() => {
    return () => {
      dispatch(clearGroupPreview());
    };
  }, [dispatch]);

  const handleSelectFile = (
    file: File,
    setPreview: (url: string) => void,
    setFile: (f: File | null) => void
  ) => {
    setPreview(URL.createObjectURL(file));
    setFile(file);
  };

  const onSubmit: SubmitHandler<FormInputs> = async (values) => {
    const payload: Record<string, unknown> = { ...values };

    // Upload picked files only now — on save
    if (imageFile || coverFile) {
      setUploading(true);
      try {
        if (imageFile) payload.image = await uploadToCloudinary(imageFile);
        if (coverFile)
          payload.coverImage = await uploadToCloudinary(coverFile);
      } catch {
        toast.error('Image upload failed');

        return;
      } finally {
        setUploading(false);
      }
    }

    const res: any = await updateGroup({ id: groupId, data: payload });

    if (res?.error) {
      toast.error(res?.error?.data?.message || 'Could not save settings');
    } else {
      toast.success('Settings saved');
    }
  };

  const handleDelete = async () => {
    const res: any = await deleteGroup(groupId);

    if (res?.error) {
      toast.error(res?.error?.data?.message || 'Could not delete the group');
    } else {
      toast.success('Group deleted');
      router.push('/groups');
    }
  };

  const handleTransfer = async () => {
    const userId = transferUserId.trim();

    if (!userId) return;
    const res: any = await transfer({ id: groupId, userId });

    if (res?.error) {
      toast.error(res?.error?.data?.message || 'Could not transfer ownership');
    } else {
      toast.success('Ownership transferred');
      setTransferOpen(false);
      setTransferUserId('');
    }
  };

  if (isLoading || !group) {
    return <CardSkeleton count={2} />;
  }

  return (
    <FadeIn className="space-y-4">
      <CommunityCard hover={false} className="p-4 sm:p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Photos — same look as the live preview */}
          <section className="space-y-4">
            <h2 className="text-sm font-bold text-default-800 uppercase tracking-wider">
              Photos
            </h2>
            <GroupImagesEditor
              image={image}
              coverImage={coverImage}
              uploading={uploading}
              onImage={(f) => handleSelectFile(f, setImage, setImageFile)}
              onCover={(f) => handleSelectFile(f, setCoverImage, setCoverFile)}
            />
          </section>

          <section className="space-y-4">
            <h2 className="text-sm font-bold text-default-800 uppercase tracking-wider">
              Basics
            </h2>
            <div className="space-y-1.5">
              <label
                htmlFor="edit-group-name"
                className="block text-sm font-semibold text-default-700"
              >
                Group name <span className="text-danger">*</span>
              </label>
              <Input
                id="edit-group-name"
                variant="flat"
                radius="lg"
                classNames={{ inputWrapper: 'bg-default-100/60' }}
                {...register('name', { required: true, minLength: 3 })}
              />
            </div>
            <div className="space-y-1.5">
              <label
                htmlFor="edit-group-description"
                className="block text-sm font-semibold text-default-700"
              >
                Description <span className="text-danger">*</span>
              </label>
              <Textarea
                id="edit-group-description"
                variant="flat"
                radius="lg"
                minRows={3}
                classNames={{ inputWrapper: 'bg-default-100/60' }}
                {...register('description', { required: true, minLength: 10 })}
              />
            </div>
            <div>
              <p className="text-xs font-semibold text-default-600 mb-2">Category</p>
              <ChipSelector
                options={GROUP_CATEGORIES}
                value={watch('category')}
                onChange={(v) => setValue('category', v)}
                allowAll={false}
              />
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-bold text-default-800 uppercase tracking-wider">
              Visibility & joining
            </h2>
            <SelectCard
              value={watch('visibility')}
              onChange={(v) => setValue('visibility', v)}
              options={[
                {
                  value: 'PUBLIC',
                  label: 'Public',
                  hint: 'Anyone can find the group and read its posts',
                  icon: <FaGlobeAmericas />,
                },
                {
                  value: 'PRIVATE',
                  label: 'Private',
                  hint: 'Hidden from discovery — members see posts only',
                  icon: <FaLock />,
                },
              ]}
            />
            <SelectCard
              value={watch('joinPolicy')}
              onChange={(v) => setValue('joinPolicy', v)}
              options={[
                {
                  value: 'OPEN',
                  label: 'Open',
                  hint: 'Anyone can join instantly',
                  icon: <FaDoorOpen />,
                },
                {
                  value: 'REQUEST',
                  label: 'Request to join',
                  hint: 'You approve each member',
                  icon: <FaUserClock />,
                },
                {
                  value: 'CLOSED',
                  label: 'Invite only',
                  hint: 'Only people with an invite link can join',
                  icon: <FaEnvelopeOpenText />,
                },
              ]}
              columns={3}
            />
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-bold text-default-800 uppercase tracking-wider">
              Posting & chat
            </h2>
            <div>
              <p className="text-xs font-semibold text-default-600 mb-2">
                Who can post
              </p>
              <SelectCard
                value={watch('postPermission')}
                onChange={(v) => setValue('postPermission', v)}
                options={[
                  {
                    value: 'ALL_MEMBERS',
                    label: 'All members',
                    hint: 'Everyone in the group can post',
                    icon: <FaUsers />,
                  },
                  {
                    value: 'ADMINS',
                    label: 'Admins only',
                    hint: 'Only staff can start discussions',
                    icon: <FaUserShield />,
                  },
                ]}
              />
            </div>
            <CommunityCard className="p-1 px-3 sm:px-4 bg-default-50/60" hover={false}>
              <SettingRow
                icon={<FaClipboardCheck />}
                label="Require post approval"
                hint="New member posts wait in a queue until you approve them"
              >
                <Switch
                  isSelected={watch('postApprovalEnabled')}
                  onValueChange={(v) => setValue('postApprovalEnabled', v)}
                  color="success"
                />
              </SettingRow>
              <SettingRow
                icon={<FaComments />}
                label="Group chat"
                hint="Members get a shared Messenger conversation"
              >
                <Switch
                  isSelected={watch('chatEnabled')}
                  onValueChange={(v) => setValue('chatEnabled', v)}
                  color="success"
                />
              </SettingRow>
              <SettingRow
                icon={<FaBell />}
                label="Notify on new posts"
                hint="Members get a notification when something is published"
              >
                <Switch
                  isSelected={watch('notifyOnNewPost')}
                  onValueChange={(v) => setValue('notifyOnNewPost', v)}
                  color="success"
                />
              </SettingRow>
            </CommunityCard>
          </section>

          <CommunityButton
            type="submit"
            size="md"
            className="w-full sm:w-auto justify-center"
            isLoading={isSubmitting || saving}
          >
            Save settings
          </CommunityButton>
        </form>
      </CommunityCard>

      {/* Danger zone */}
      <CommunityCard
        hover={false}
        className="p-4 sm:p-6 border-red-200 dark:border-red-500/30 bg-red-50/40 dark:bg-red-500/5"
      >
        <h3 className="flex items-center gap-2 font-bold text-red-600 dark:text-red-400">
          <FaExclamationTriangle /> Danger zone
        </h3>
        <p className="text-sm text-default-500 mt-1">
          These actions affect every member of the group.
        </p>
        <div className="flex flex-wrap gap-3 mt-4">
          <CommunityButton
            variant="secondary"
            startContent={<FaRightLeft />}
            isLoading={transferring}
            onPress={() => setTransferOpen(true)}
          >
            Transfer ownership
          </CommunityButton>
          <CommunityButton
            variant="danger"
            startContent={<FaTrashCan />}
            isLoading={deleting}
            onPress={() => setConfirmDelete(true)}
          >
            Delete group
          </CommunityButton>
        </div>
      </CommunityCard>

      <ConfirmDialog
        isOpen={confirmDelete}
        onOpenChange={setConfirmDelete}
        danger
        title="Delete this group permanently?"
        description="All posts, chats, invites, and memberships will be removed. This cannot be undone."
        confirmLabel="Delete group"
        onConfirm={handleDelete}
      />

      <Modal
        isOpen={transferOpen}
        onOpenChange={setTransferOpen}
        size="sm"
        placement="center"
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-0.5">
            Transfer ownership
            <span className="text-xs font-normal text-default-400">
              You will become an Admin of this group
            </span>
          </ModalHeader>
          <ModalBody>
            <Input
              label="New owner's user ID"
              placeholder="They must already be a member"
              variant="flat"
              radius="lg"
              labelPlacement="outside"
              value={transferUserId}
              onChange={(e) => setTransferUserId(e.target.value)}
            />
          </ModalBody>
          <ModalFooter>
            <CommunityButton variant="ghost" onPress={() => setTransferOpen(false)}>
              Cancel
            </CommunityButton>
            <CommunityButton
              variant="primary"
              isLoading={transferring}
              isDisabled={!transferUserId.trim()}
              onPress={handleTransfer}
            >
              Transfer
            </CommunityButton>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </FadeIn>
  );
}
