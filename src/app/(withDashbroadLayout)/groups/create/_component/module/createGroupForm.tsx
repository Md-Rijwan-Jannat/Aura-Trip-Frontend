'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Input, Textarea } from '@nextui-org/input';
import { Switch } from '@nextui-org/switch';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  FaGlobeAmericas,
  FaLock,
  FaDoorOpen,
  FaUserClock,
  FaEnvelopeOpenText,
  FaUsers,
  FaUserShield,
  FaBell,
  FaComments,
  FaClipboardCheck,
  FaMapMarkerAlt,
} from 'react-icons/fa';
import { useCreateGroupMutation } from '@/src/redux/features/group/groupApi';
import { GROUP_CATEGORIES } from '@/src/types';
import { uploadToCloudinary } from '@/src/utils/uploadCloudinary';
import {
  CommunityCard,
  CommunityButton,
  ChipSelector,
  SelectCard,
  SettingRow,
  FadeIn,
} from '@/src/components/ui/communityKit';
import GroupLivePreview from '../../../_component/ui/groupLivePreview';
import GroupImagesEditor from '../../../_component/ui/groupImagesEditor';
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
  location?: string;
  rules?: string;
  postApprovalEnabled: boolean;
  chatEnabled: boolean;
  notifyOnNewPost: boolean;
}

export default function CreateGroupForm() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [createGroup, { isLoading }] = useCreateGroupMutation();
  const [image, setImage] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
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

  const handleSelectFile = (
    file: File,
    setPreview: (url: string) => void,
    setFile: (f: File | null) => void
  ) => {
    setPreview(URL.createObjectURL(file));
    setFile(file);
  };

  const onSubmit: SubmitHandler<FormInputs> = async (values) => {
    const payload: Record<string, unknown> = {
      name: values.name.trim(),
      description: values.description.trim(),
      category: values.category,
      visibility: values.visibility,
      joinPolicy: values.joinPolicy,
      postPermission: values.postPermission,
      postApprovalEnabled: values.postApprovalEnabled,
      chatEnabled: values.chatEnabled,
      notifyOnNewPost: values.notifyOnNewPost,
    };

    if (values.location?.trim()) payload.location = values.location.trim();
    if (values.rules?.trim()) {
      payload.rules = values.rules
        .split('\n')
        .map((r) => r.trim())
        .filter(Boolean);
    }

    // Upload picked files only now — on submit
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

    const res: any = await createGroup(payload);

    if (res?.error) {
      toast.error(res?.error?.data?.message || 'Could not create the group');
    } else {
      toast.success('Your group is live!');
      router.push(`/groups/${res?.data?.data?._id || res?.data?.data?.slug}`);
    }
  };

  const watchedName = watch('name');
  const watchedDesc = watch('description');
  const watchedVisibility = watch('visibility');
  const watchedCategory = watch('category');

  const previewData = useMemo(
    () => ({
      mode: 'create' as const,
      name: watchedName,
      description: watchedDesc,
      category: watchedCategory,
      visibility: watchedVisibility,
      image,
      coverImage,
    }),
    [watchedName, watchedDesc, watchedCategory, watchedVisibility, image, coverImage]
  );

  useEffect(() => {
    dispatch(setGroupPreview(previewData));
  }, [previewData, dispatch]);

  useEffect(() => {
    return () => {
      dispatch(clearGroupPreview());
    };
  }, [dispatch]);

  return (
    <div className="space-y-5 sm:space-y-6">
      <FadeIn className="min-w-0">
        <CommunityCard className="p-4 sm:p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 sm:space-y-8">
            {/* Photos — same look as the live preview */}
            <section className="space-y-3 sm:space-y-4">
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

            {/* Basics */}
            <section className="space-y-3 sm:space-y-4">
              <h2 className="text-sm font-bold text-default-800 uppercase tracking-wider">
                Basics
              </h2>
              <div className="space-y-1.5">
                <label
                  htmlFor="create-group-name"
                  className="block text-sm font-semibold text-default-700"
                >
                  Group name <span className="text-danger">*</span>
                </label>
                <Input
                  id="create-group-name"
                  placeholder="e.g. Kyoto Autumn Walks"
                  variant="flat"
                  radius="lg"
                  classNames={{ inputWrapper: 'bg-default-100/60' }}
                  {...register('name', {
                    required: true,
                    minLength: 3,
                    maxLength: 100,
                  })}
                />
              </div>
              <div className="space-y-1.5">
                <label
                  htmlFor="create-group-description"
                  className="block text-sm font-semibold text-default-700"
                >
                  Description <span className="text-danger">*</span>
                </label>
                <Textarea
                  id="create-group-description"
                  placeholder="What is this group about? Who should join?"
                  variant="flat"
                  radius="lg"
                  minRows={3}
                  classNames={{ inputWrapper: 'bg-default-100/60' }}
                  {...register('description', {
                    required: true,
                    minLength: 10,
                    maxLength: 2000,
                  })}
                />
              </div>
              <div>
                <p className="text-xs font-semibold text-default-600 mb-2">
                  Category
                </p>
                <ChipSelector
                  options={GROUP_CATEGORIES}
                  value={watchedCategory}
                  onChange={(v) => setValue('category', v)}
                  allowAll={false}
                />
              </div>
              <div className="space-y-1.5">
                <label
                  htmlFor="create-group-location"
                  className="block text-sm font-semibold text-default-700"
                >
                  Location (optional)
                </label>
                <Input
                  id="create-group-location"
                  placeholder="e.g. Kyoto, Japan"
                  variant="flat"
                  radius="lg"
                  classNames={{
                    inputWrapper: 'bg-default-100/60',
                    input: 'pl-0',
                  }}
                  startContent={
                    <FaMapMarkerAlt className="text-default-400 text-sm ml-3" />
                  }
                  {...register('location')}
                />
              </div>
            </section>

            {/* Visibility */}
            <section className="space-y-3 sm:space-y-4">
              <h2 className="text-sm font-bold text-default-800 uppercase tracking-wider">
                Who can see it
              </h2>
              <SelectCard
                value={watchedVisibility}
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
            </section>

            {/* Joining */}
            <section className="space-y-3 sm:space-y-4">
              <h2 className="text-sm font-bold text-default-800 uppercase tracking-wider">
                Joining
              </h2>
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

            {/* Posting */}
            <section className="space-y-3 sm:space-y-4">
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

            {/* Rules */}
            <section className="space-y-3 sm:space-y-4">
              <h2 className="text-sm font-bold text-default-800 uppercase tracking-wider">
                Group rules
              </h2>
              <div className="space-y-1.5">
                <label
                  htmlFor="create-group-rules"
                  className="block text-sm font-semibold text-default-700"
                >
                  Rules (optional)
                </label>
                <Textarea
                  id="create-group-rules"
                  placeholder={"One rule per line, e.g.\nBe kind and supportive\nNo spam or self-promo"}
                  variant="flat"
                  radius="lg"
                  minRows={3}
                  classNames={{ inputWrapper: 'bg-default-100/60' }}
                  {...register('rules')}
                />
              </div>
            </section>

            <CommunityButton
              type="submit"
              size="md"
              className="w-full sm:w-auto justify-center"
              isLoading={isSubmitting || isLoading}
            >
              Create group
            </CommunityButton>
          </form>
        </CommunityCard>
      </FadeIn>

      {/* Live preview — inline below the form on mobile/tablet; desktop uses the right sidebar */}
      <FadeIn delay={0.1} className="min-w-0 lg:hidden">
        <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">
          Live preview
        </p>
        <GroupLivePreview data={previewData} />
      </FadeIn>
    </div>
  );
}
