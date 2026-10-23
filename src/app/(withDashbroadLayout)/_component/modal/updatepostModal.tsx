'use client';

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '@nextui-org/modal';
import { Avatar } from '@nextui-org/avatar';
import { Input } from '@nextui-org/input';
import { useForm, Controller } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { Select, SelectItem } from '@nextui-org/select';
import { toast } from 'sonner';

import { useUpdatePostMutation } from '@/src/redux/features/post/postApi';
import { TUser, TPost, MEDIA_LAYOUT_OPTIONS } from '@/src/types';
import GlassLoader from '@/src/components/shared/glassLoader';
import dynamic from 'next/dynamic';

// Dynamically import the ReactQuill component to prevent SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

import 'react-quill/dist/quill.snow.css';
import { Button } from '@nextui-org/button';

interface TUpdatePostModalProps {
  userInfo: TUser | undefined;
  postData: TPost;
  isOpen: boolean;
  onOpenChange: () => void;
}

const UpdatePostModal = ({
  userInfo,
  postData,
  isOpen,
  onOpenChange,
}: TUpdatePostModalProps) => {
  const [updatePostFn, { isLoading }] = useUpdatePostMutation();
  const [isError, setIsError] = useState<string>('');
  const [editorContent, setEditorContent] = useState(
    postData?.description || ''
  );

  const { handleSubmit, control, reset, watch, setValue } = useForm<TPost>({
    defaultValues: {
      title: '',
      description: '',
      status: 'FREE',
      reportCount: 0,
    },
  });

  useEffect(() => {
    if (postData) {
      // Reset the form with new postData values when postData changes
      reset({
        title: postData?.title,
        description: postData?.description,
        status: postData?.status || 'FREE',
        reportCount: postData?.reportCount || 0,
        mediaLayout: postData?.mediaLayout || 'AUTO',
      });
      setEditorContent(postData?.description || '');
    }
  }, [postData, reset]);

  const title = watch('title');

  const onSubmit = async (data: TPost) => {
    const updatedPostData = { ...data, description: editorContent };

    try {
      const res = await updatePostFn({
        id: postData._id,
        data: updatedPostData,
      });

      if (res?.data?.success) {
        reset();
        onOpenChange();
        toast.success('Post updated successfully');
        setIsError('');
      } else {
        throw new Error('Post update failed');
      }
    } catch (error: any) {
      setIsError(error.message || 'Failed to update post');
      toast.error('Failed to update post');
    }
  };

  return (
    <>
      {isLoading && <GlassLoader />}
      <Modal
        size="lg"
        placement="center"
        isOpen={isOpen}
        onOpenChange={onOpenChange}
      >
        <ModalContent className="m-2">
          <ModalHeader>
            <div className="flex items-center gap-2">
              <Avatar
                alt="User Avatar"
                className="text-xl"
                name={userInfo?.name?.charAt(0)?.toUpperCase()}
                size="md"
                src={userInfo?.image || undefined}
              />
              <div>
                <p className="whitespace-nowrap text-xs">{userInfo?.name}</p>
                <span className="text-xs text-default-400 whitespace-nowrap">
                  Public
                </span>
              </div>
            </div>
          </ModalHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <ModalBody>
              {isError && (
                <p className="text-center text-red-500 text-xs">{isError}</p>
              )}
              <Controller
                control={control}
                name="title"
                render={({ field }) => (
                  <Input
                    {...field}
                    fullWidth
                    placeholder="Title"
                    variant="underlined"
                  />
                )}
              />

              <div className="">
                <ReactQuill
                  className="bg-default-50 text-default-700 placeholder:text-default-700"
                  value={editorContent}
                  onChange={setEditorContent}
                  theme="snow"
                />
              </div>

              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select
                    {...field}
                    className="w-full"
                    label="Select post type"
                    variant="underlined"
                  >
                    <SelectItem key="FREE">Free</SelectItem>
                    <SelectItem key="PREMIUM">Premium</SelectItem>
                  </Select>
                )}
              />

              {/* Multi-image layout picker (edit-time; 2+ images only) */}
              {(postData?.images?.length ?? 0) > 1 && (
                <div className="space-y-1">
                  <p className="text-xs text-default-500">Grid layout</p>
                  <div className="flex flex-wrap gap-2">
                    {MEDIA_LAYOUT_OPTIONS.map((option) => (
                      <button
                        key={option.key}
                        type="button"
                        onClick={() => setValue('mediaLayout', option.key)}
                        className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                          watch('mediaLayout') === option.key
                            ? 'border-primary bg-primary-100 text-primary'
                            : 'border-default-300 text-default-600 hover:border-primary-300'
                        }`}
                      >
                        <span className="mr-1">{option.hint}</span>
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </ModalBody>
            <ModalFooter>
              <Button className="primary-button" type="submit">
                Save
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </>
  );
};

export default UpdatePostModal;
