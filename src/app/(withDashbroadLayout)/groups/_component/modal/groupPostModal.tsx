'use client';

import React, { useState } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
} from '@nextui-org/modal';
import { Input, Textarea } from '@nextui-org/input';
import { Button } from '@nextui-org/button';
import { toast } from 'sonner';
import { FaImages, FaMapMarkerAlt, FaTags } from 'react-icons/fa';
import { useCreateGroupPostMutation } from '@/src/redux/features/group/groupApi';
import { CommunityButton } from '@/src/components/ui/communityKit';

interface FormState {
  title: string;
  description: string;
  images: string;
  location: string;
  tags: string;
}

interface GroupPostModalProps {
  groupId: string;
  isOpen: boolean;
  onOpenChange: () => void;
  onCreated?: () => void;
}

export default function GroupPostModal({
  groupId,
  isOpen,
  onOpenChange,
  onCreated,
}: GroupPostModalProps) {
  const [createPost, { isLoading }] = useCreateGroupPostMutation();
  const [form, setForm] = useState<FormState>({
    title: '',
    description: '',
    images: '',
    location: '',
    tags: '',
  });

  const imageList = form.images
    .split(/[\n,]/)
    .map((u) => u.trim())
    .filter(Boolean);

  const submit = async () => {
    if (!form.title.trim() || !form.description.trim()) {
      toast.error('Add a title and description');

      return;
    }
    if (!imageList.length) {
      toast.error('Add at least one image URL');

      return;
    }

    const payload: Record<string, unknown> = {
      title: form.title.trim(),
      description: form.description.trim(),
      images: imageList,
    };

    if (form.location.trim()) payload.location = form.location.trim();
    if (form.tags.trim()) {
      payload.tags = form.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
    }

    const res: any = await createPost({ id: groupId, ...payload });

    if (res?.error) {
      toast.error(res?.error?.data?.message || 'Could not create the post');
    } else {
      const status = res?.data?.data?.moderationStatus;

      toast.success(
        status === 'PENDING'
          ? 'Post submitted — waiting for approval'
          : 'Post published to the group',
      );
      setForm({ title: '', description: '', images: '', location: '', tags: '' });
      onOpenChange();
      onCreated?.();
    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="lg" placement="center">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-0.5">
          Share with the group
          <span className="text-xs font-normal text-default-400">
            Posts appear in the group feed for every member
          </span>
        </ModalHeader>
        <ModalBody className="pb-6 space-y-3 sm:space-y-4 max-h-[75vh] overflow-y-auto">
          <Input
            label="Title"
            placeholder="What's this about?"
            variant="flat"
            radius="lg"
            labelPlacement="outside"
            classNames={{ inputWrapper: 'bg-default-100/60' }}
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            maxLength={300}
          />
          <Textarea
            label="Description"
            placeholder="Share the details — tips, routes, recommendations…"
            variant="flat"
            radius="lg"
            minRows={4}
            labelPlacement="outside"
            classNames={{ inputWrapper: 'bg-default-100/60' }}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            maxLength={10000}
          />
          <Textarea
            label="Images"
            placeholder={"One or more image URLs, one per line"}
            variant="flat"
            radius="lg"
            minRows={2}
            labelPlacement="outside"
            classNames={{ inputWrapper: 'bg-default-100/60' }}
            startContent={
              <span className="self-start mt-2.5 ml-1 text-default-400">
                <FaImages />
              </span>
            }
            value={form.images}
            onChange={(e) => setForm({ ...form, images: e.target.value })}
          />
          {imageList.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-1 max-w-full">
              {imageList.slice(0, 6).map((img) => (
                <img
                  key={img}
                  src={img}
                  alt=""
                  className="h-16 w-16 rounded-xl object-cover border border-borderSubtle flex-shrink-0"
                />
              ))}
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 min-w-0">
            <Input
              label="Location"
              placeholder="Optional"
              variant="flat"
              radius="lg"
              labelPlacement="outside"
              classNames={{ inputWrapper: 'bg-default-100/60' }}
              startContent={<FaMapMarkerAlt className="text-default-400" />}
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
            />
            <Input
              label="Tags"
              placeholder="beach, hiking…"
              variant="flat"
              radius="lg"
              labelPlacement="outside"
              classNames={{ inputWrapper: 'bg-default-100/60' }}
              startContent={<FaTags className="text-default-400" />}
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
            />
          </div>
          <CommunityButton
            size="lg"
            className="w-full justify-center"
            isLoading={isLoading}
            onPress={submit}
          >
            Publish post
          </CommunityButton>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
