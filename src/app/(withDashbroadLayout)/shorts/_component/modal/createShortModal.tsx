'use client';

import React, { useRef, useState } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
} from '@nextui-org/modal';
import { Input, Textarea } from '@nextui-org/input';
import { Select, SelectItem } from '@nextui-org/select';
import { useDisclosure } from '@nextui-org/modal';
import { toast } from 'sonner';
import { FaVideo, FaUpload, FaCheckCircle } from 'react-icons/fa';
import { useCreateShortMutation } from '@/src/redux/features/short/shortApi';
import { useGetAllGroupsQuery } from '@/src/redux/features/group/groupApi';
import { TGroup } from '@/src/types';
import { CommunityButton, SelectCard } from '@/src/components/ui/communityKit';

async function uploadVideoToCloudinary(file: File): Promise<string> {
  const formData = new FormData();

  formData.append('file', file);
  formData.append('upload_preset', 'aura-trip');
  const url = process.env.NEXT_PUBLIC_CLOUDINARY_URL;
  const response = await fetch(`${url}`, { method: 'POST', body: formData });

  if (!response.ok) throw new Error('Video upload failed');
  const data = await response.json();

  return data.secure_url;
}

export default function CreateShortModal({
  triggerLabel = 'New short',
}: {
  triggerLabel?: string;
}) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const fileRef = useRef<HTMLInputElement>(null);
  const [video, setVideo] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState('');
  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [audience, setAudience] = useState('PUBLIC');
  const [group, setGroup] = useState('');
  const [uploading, setUploading] = useState(false);
  const [createShort, { isLoading }] = useCreateShortMutation();

  // Only groups the current user has joined can be attached.
  const { data: groupsRes } = useGetAllGroupsQuery({ tab: 'mine', limit: 50 });
  const myGroups: TGroup[] = (groupsRes?.data as TGroup[]) || [];
  const joinedGroups = myGroups.filter(
    (g) => g.myStatus === 'APPROVED' || g.myRole === 'OWNER',
  );

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;
    // Keep the file locally — upload only on publish
    setVideoFile(file);
    setVideoPreview(URL.createObjectURL(file));
    setVideo('');
    e.target.value = '';
  };

  const handleSubmit = async () => {
    if (!videoFile && !video.trim()) {
      toast.error('Add a video (upload or URL)');

      return;
    }

    let videoUrl = video.trim();

    if (videoFile) {
      setUploading(true);
      try {
        videoUrl = await uploadVideoToCloudinary(videoFile);
      } catch {
        toast.error('Video upload failed');

        return;
      } finally {
        setUploading(false);
      }
    }

    const payload: Record<string, unknown> = {
      video: videoUrl,
      audience,
    };

    if (title.trim()) payload.title = title.trim();
    if (caption.trim()) payload.caption = caption.trim();
    if (group) payload.group = group;

    const res: any = await createShort(payload);

    if (res?.error) {
      toast.error(res?.error?.data?.message || 'Could not create short');
    } else {
      toast.success('Short published');
      setVideo('');
      setVideoFile(null);
      setVideoPreview('');
      setTitle('');
      setCaption('');
      setGroup('');
      onOpenChange();
    }
  };

  return (
    <>
      <CommunityButton
        variant="primary"
        size="sm"
        startContent={<FaVideo />}
        onPress={onOpen}
      >
        {triggerLabel}
      </CommunityButton>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="lg" placement="center">
        <ModalContent>
          <ModalHeader className="flex flex-col gap-0.5">
            Create a short
            <span className="text-xs font-normal text-default-400">
              Vertical clips work best — keep it under a minute
            </span>
          </ModalHeader>
          <ModalBody className="pb-6 space-y-3 sm:space-y-4 max-h-[75vh] overflow-y-auto">
            {/* Video picker */}
            <div>
              <span className="text-xs font-semibold text-default-600 mb-1.5 block">
                Video
              </span>
              <input
                ref={fileRef}
                type="file"
                accept="video/*"
                onChange={handleFile}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className={`w-full h-28 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-1.5 transition-colors ${
                  videoFile || video
                    ? 'border-sage-400 bg-sage-50 dark:bg-sage-500/10 text-sage-700'
                    : 'border-borderSubtle bg-default-50/50 text-default-400 hover:border-sage-400 hover:text-sage-600'
                }`}
              >
                {videoFile || video ? (
                  <>
                    <FaCheckCircle className="text-xl text-sage-500" />
                    <span className="text-xs font-semibold">
                      {videoFile ? 'Video selected — upload happens on publish' : 'Video URL set — change?'}
                    </span>
                  </>
                ) : (
                  <>
                    <FaUpload className="text-xl" />
                    <span className="text-xs font-semibold">Click to choose a video</span>
                  </>
                )}
              </button>
              {videoFile && videoPreview && (
                // eslint-disable-next-line jsx-a11y/media-has-caption
                <video
                  src={videoPreview}
                  controls
                  className="w-full max-h-44 mt-2 rounded-xl bg-black"
                />
              )}
            </div>

            <Input
              label="…or video URL (Cloudinary)"
              placeholder="https://res.cloudinary.com/…/video/upload/…"
              radius="lg"
              variant="flat"
              labelPlacement="outside"
              classNames={{ inputWrapper: 'bg-default-100/60' }}
              value={video}
              onValueChange={(v) => {
                setVideo(v);
                if (v) {
                  setVideoFile(null);
                  setVideoPreview('');
                }
              }}
            />

            <Input
              label="Title (optional)"
              radius="lg"
              variant="flat"
              labelPlacement="outside"
              maxLength={150}
              classNames={{ inputWrapper: 'bg-default-100/60' }}
              value={title}
              onValueChange={setTitle}
            />
            <Textarea
              label="Caption (optional)"
              radius="lg"
              variant="flat"
              labelPlacement="outside"
              maxLength={1000}
              minRows={2}
              classNames={{ inputWrapper: 'bg-default-100/60' }}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
            />

            <div>
              <p className="text-xs font-semibold text-default-600 mb-2">Audience</p>
              <SelectCard
                value={audience}
                onChange={setAudience}
                options={[
                  { value: 'PUBLIC', label: 'Public', hint: 'Everyone on AURA TRIP' },
                  { value: 'FOLLOWERS', label: 'Followers', hint: 'People who follow you' },
                  { value: 'PRIVATE', label: 'Private', hint: 'Only you' },
                ]}
                columns={3}
              />
            </div>

            <Select
              label="Post to a group (optional)"
              placeholder="Choose a group you belong to"
              radius="lg"
              variant="flat"
              labelPlacement="outside"
              classNames={{ trigger: 'bg-default-100/60' }}
              selectedKeys={group ? [group] : []}
              onSelectionChange={(keys) => setGroup(Array.from(keys)[0] as string)}
            >
              {joinedGroups.map((g) => (
                <SelectItem key={g._id} value={g._id}>
                  {g.name}
                </SelectItem>
              ))}
            </Select>

            <CommunityButton
              size="lg"
              className="w-full justify-center"
              isLoading={isLoading || uploading}
              onPress={handleSubmit}
            >
              Publish short
            </CommunityButton>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
