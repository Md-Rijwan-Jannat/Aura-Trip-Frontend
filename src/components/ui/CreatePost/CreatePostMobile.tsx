"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { Button } from "@nextui-org/button";
import { Input } from "@nextui-org/input";
import { Select, SelectItem } from "@nextui-org/select";
import { Switch } from "@nextui-org/switch";
import { Divider } from "@nextui-org/divider";
import { Avatar } from "@nextui-org/avatar";
import { toast } from "sonner";
import { X, ChevronLeft, Eye, Image as ImageIcon, Sparkles, Music } from "lucide-react";
import Link from "next/link";
import { GoVerified } from "react-icons/go";
import { TUser, MEDIA_LAYOUT_OPTIONS } from "@/src/types";
import { useCreatePostMutation } from "@/src/redux/features/post/postApi";
import { uploadToCloudinary } from "@/src/utils/uploadCloudinary";
import { PostFormData } from "./CreatePostModal";
import MediaUploadZone from "./MediaUploadZone";
import TextEditor from "./TextEditor";
import PostPreview from "./PostPreview";
import { MusicPickerModal } from "@/src/components/ui/MusicPicker";
import { MusicSelection } from "@/src/types/music";
import { useAttachMusicMutation } from "@/src/redux/features/music/musicApi";
interface CreatePostMobileProps {
  userInfo: TUser | undefined;
  onClose: () => void;
  imagePreviews: string[];
  setImagePreviews: React.Dispatch<React.SetStateAction<string[]>>;
  imageFiles: File[];
  setImageFiles: React.Dispatch<React.SetStateAction<File[]>>;
}

const categoriesList = [
  "Adventure",
  "Exploration",
  "Business Travel",
  "Other",
  "Culture",
  "Wildlife",
  "Beaches",
  "Mountaineering",
  "Sports",
  "Road Trip",
  "City Tours",
  "Photography",
];

const CreatePostMobile = ({ userInfo, onClose, imagePreviews, setImagePreviews, imageFiles, setImageFiles }: CreatePostMobileProps) => {
  const [createPostFn, { isLoading }] = useCreatePostMutation();
  const [attachMusicFn] = useAttachMusicMutation();
  const [description, setDescription] = useState<string>("");
  const [isFormValid, setIsFormValid] = useState<boolean>(false);
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [showMediaUpload, setShowMediaUpload] = useState<boolean>(false);
  const [showMusicPicker, setShowMusicPicker] = useState<boolean>(false);
  const [selectedMusic, setSelectedMusic] = useState<MusicSelection | null>(null);

  const { handleSubmit, control, reset, watch, setValue } = useForm<PostFormData>({
    defaultValues: {
      title: "",
      description: "",
      status: "FREE",
      category: "Other",
      mediaLayout: "AUTO",
      tags: [],
      location: "",
      feeling: "",
      aiGenerated: false,
      shareToGroups: [],
      shareToStory: false,
      scheduledAt: null,
    },
  });

  const title = watch("title");
  const mediaLayout = watch("mediaLayout");
  const status = watch("status");

  useEffect(() => {
    // At least one of: title, description, or images must be present
    const hasContent = title?.trim() || description?.trim() || imagePreviews.length > 0;

    setIsFormValid(!!hasContent);
  }, [title, description, imagePreviews]);

  const handleFileChange = (files: File[]) => {
    const newFiles = [...imageFiles, ...files];
    const newPreviews = newFiles.map((file) => URL.createObjectURL(file));

    setImageFiles(newFiles);
    setImagePreviews(newPreviews);
    setShowMediaUpload(false);
  };

  const removeImage = (index: number) => {
    setImagePreviews((prev: string[]) => prev.filter((_: string, i: number) => i !== index));
    setImageFiles((prev: File[]) => prev.filter((_: File, i: number) => i !== index));
  };

  const uploadImages = async (): Promise<string[]> => {
    if (imageFiles.length === 0) return [];

    try {
      const uploadPromises = imageFiles.map((file) => uploadToCloudinary(file));

      return await Promise.all(uploadPromises);
    } catch (error) {
      toast.error("Failed to upload images");
      throw error;
    }
  };

  const onSubmit = async (data: PostFormData) => {
    try {
      // Validate that at least some content exists
      if (!data.title?.trim() && !description?.trim() && imageFiles.length === 0) {
        toast.error("Please add a title, description, or images");

        return;
      }

      // Ensure title is provided (required by backend)
      let postTitle = data.title?.trim();

      if (!postTitle) {
        // Generate a title from description or use a default
        if (description?.trim()) {
          const words = description.trim().split(/\s+/);

          postTitle = words.slice(0, 10).join(" ");
          if (words.length > 10) postTitle += "...";
        } else {
          postTitle = "Photo Post";
        }
      }

      const uploadedImages = await uploadImages();

      const postData = {
        title: postTitle,
        description: description?.trim() || "",
        images: uploadedImages,
        category: data.category || "Other",
        status: data.status || "FREE",
        mediaLayout: imagePreviews.length > 1 ? data.mediaLayout : "AUTO",
        tags: data.tags || [],
        location: data.location || "",
        aiGenerated: data.aiGenerated || false,
      };

      const res = await createPostFn(postData).unwrap();

      if (res?.success) {
        // Attach music if selected
        if (selectedMusic && res.data?._id) {
          try {
            await attachMusicFn({
              trackId: selectedMusic.track._id,
              contentType: "post",
              contentId: res.data._id,
              startTime: selectedMusic.startTime,
              endTime: selectedMusic.endTime,
              volume: selectedMusic.volume,
              fadeIn: selectedMusic.fadeIn,
              fadeOut: selectedMusic.fadeOut,
            }).unwrap();
          } catch (musicError) {
            console.error("Failed to attach music:", musicError);
          }
        }

        toast.success(res.message || "Post created successfully");
        reset();
        setDescription("");
        setImagePreviews([]);
        setImageFiles([]);
        setSelectedMusic(null);
        onClose();
      }
    } catch (error: any) {
      const errorMessage = error?.data?.message || error?.message || "Failed to create post";

      toast.error(errorMessage);
    }
  };

  if (showPreview) {
    return (
      <div className='h-full flex flex-col'>
        {/* Preview Header */}
        <div className='p-4 border-b border-borderSubtle flex items-center justify-between bg-surface'>
          <Button isIconOnly size='sm' variant='light' onPress={() => setShowPreview(false)} aria-label='Back'>
            <ChevronLeft className='w-5 h-5' />
          </Button>
          <h2 className='text-base font-semibold'>Preview</h2>
          <div className='w-9' />
        </div>

        {/* Preview Content */}
        <div className='flex-1 overflow-y-auto bg-appBackground'>
          <PostPreview
            userInfo={userInfo}
            title={title}
            description={description}
            images={imagePreviews}
            mediaLayout={mediaLayout}
            status={status}
          />
        </div>

        {/* Preview Footer */}
        <div className='p-4 border-t border-borderSubtle bg-surface safe-bottom'>
          <button
            type='button'
            onClick={() => setShowPreview(false)}
            className='
              w-full px-6 py-3 rounded-full font-semibold text-sm
              bg-sage-600 text-white 
              hover:bg-sage-700 hover:scale-x-105
              dark:hover:bg-sage-500 dark:hover:text-sage-900
              transition-all duration-300 ease-in-out
            '
          >
            Continue Editing
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='h-full flex flex-col'>
      {/* Header */}
      <div className='p-4 border-b border-borderSubtle flex items-center justify-between bg-surface'>
        <Button isIconOnly size='sm' variant='light' onPress={onClose} aria-label='Close'>
          <X className='w-5 h-5' />
        </Button>
        <h2 className='text-base font-semibold'>Create Post</h2>
        <Button isIconOnly size='sm' variant='light' onPress={() => setShowPreview(true)} aria-label='Preview' isDisabled={!isFormValid}>
          <Eye className='w-5 h-5' />
        </Button>
      </div>

      {/* User Info */}
      <div className='p-4 flex items-center gap-3 bg-surface border-b border-borderSubtle'>
        <Link href={`/profile/${userInfo?._id}`}>
          <Avatar
            className='cursor-pointer'
            alt={userInfo?.name}
            name={userInfo?.name?.charAt(0).toUpperCase()}
            size='md'
            src={userInfo?.image || undefined}
          />
        </Link>
        <div>
          <Link href={`/profile/${userInfo?._id}`}>
            <p className='text-sm font-semibold flex items-center gap-1'>
              {userInfo?.name}
              {userInfo?.verified && <GoVerified className='text-primaryColor' size={14} />}
            </p>
          </Link>
          <p className='text-xs text-textSecondary'>Sharing publicly</p>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className='flex-1 overflow-y-auto p-4 space-y-4 bg-surface'>
        {/* Title */}
        <Controller
          control={control}
          name='title'
          render={({ field }) => (
            <Input
              {...field}
              placeholder='Add a title for your post...'
              variant='bordered'
              classNames={{
                input: "text-base",
              }}
              aria-label='Post title'
            />
          )}
        />

        {/* Text Editor */}
        <TextEditor value={description} onChange={setDescription} />

        {/* Media Upload Zone */}
        {showMediaUpload && (
          <MediaUploadZone
            onFilesSelected={handleFileChange}
            onCancel={() => setShowMediaUpload(false)}
            existingPreviews={imagePreviews}
            onRemoveImage={removeImage}
          />
        )}

        {/* Media Layout Options */}
        {imagePreviews.length > 1 && (
          <div className='space-y-3'>
            <p className='text-xs font-semibold text-textPrimary'>Grid Layout</p>
            <div className='flex flex-wrap gap-2'>
              {MEDIA_LAYOUT_OPTIONS.map((option) => (
                <button
                  key={option.key}
                  type='button'
                  onClick={() => setValue("mediaLayout", option.key)}
                  className={`
                    px-4 py-2 rounded-xl text-xs font-medium
                    transition-all duration-200
                    ${
                      mediaLayout === option.key
                        ? "bg-sage-600 dark:bg-sage-700 text-white shadow-md shadow-sage-500/20"
                        : "bg-default-100 dark:bg-default-50/5 text-textSecondary hover:bg-sage-50 dark:hover:bg-sage-900/20 hover:text-sage-600 dark:hover:text-sage-400 border border-borderSubtle hover:border-sage-300 dark:hover:border-sage-700"
                    }
                  `}
                >
                  <span className='mr-1.5'>{option.hint}</span>
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <Divider />

        {/* Creation Options */}
        <div className='space-y-2'>
          <button
            type='button'
            onClick={() => setShowMediaUpload(!showMediaUpload)}
            className='
              w-full flex items-center gap-3 p-3 rounded-xl 
              transition-all duration-200
              hover:bg-sage-50 dark:hover:bg-sage-900/20
              border border-transparent hover:border-sage-200 dark:hover:border-sage-800
              group
            '
          >
            <div
              className='
              w-10 h-10 rounded-full 
              bg-sage-100 dark:bg-sage-900/40
              group-hover:bg-sage-200 dark:group-hover:bg-sage-800/60
              flex items-center justify-center 
              transition-colors duration-200
            '
            >
              <ImageIcon className='w-5 h-5 text-sage-600 dark:text-sage-400' />
            </div>
            <div className='flex-1 text-left'>
              <p className='text-sm font-medium text-textPrimary'>Add photos/videos</p>
              <p className='text-xs text-textSecondary'>Share images or videos</p>
            </div>
            {imagePreviews.length > 0 && (
              <span
                className='
                px-2.5 py-0.5 rounded-full 
                bg-sage-100 dark:bg-sage-900/60
                text-sage-700 dark:text-sage-300
                text-xs font-medium
              '
              >
                {imagePreviews.length}
              </span>
            )}
          </button>

          {/* Add Music Button */}
          <button
            type='button'
            onClick={() => setShowMusicPicker(true)}
            className='
              w-full flex items-center gap-3 p-3 rounded-xl 
              transition-all duration-200
              hover:bg-sage-50 dark:hover:bg-sage-900/20
              border border-transparent hover:border-sage-200 dark:hover:border-sage-800
              group
            '
          >
            <div
              className='
              w-10 h-10 rounded-full 
              bg-sage-100 dark:bg-sage-900/40
              group-hover:bg-sage-200 dark:group-hover:bg-sage-800/60
              flex items-center justify-center 
              transition-colors duration-200
            '
            >
              <Music className='w-5 h-5 text-sage-600 dark:text-sage-400' />
            </div>
            <div className='flex-1 text-left'>
              <p className='text-sm font-medium text-textPrimary'>Add music</p>
              <p className='text-xs text-textSecondary'>{selectedMusic ? selectedMusic.track.title : "Choose background music"}</p>
            </div>
            {selectedMusic && (
              <button
                type='button'
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedMusic(null);
                }}
                className='
                  px-2.5 py-0.5 rounded-full 
                  bg-red-100 dark:bg-red-900/60
                  text-red-700 dark:text-red-300
                  text-xs font-medium
                '
              >
                Remove
              </button>
            )}
          </button>
        </div>

        <Divider />

        {/* Post Settings */}
        <div className='space-y-3'>
          <p className='text-sm font-semibold'>Post Settings</p>

          {/* Audience */}
          <Controller
            control={control}
            name='status'
            render={({ field }) => (
              <Select
                {...field}
                label='Audience'
                variant='bordered'
                selectedKeys={[field.value]}
                onSelectionChange={(keys) => {
                  const value = Array.from(keys)[0] as string;

                  field.onChange(value);
                }}
              >
                <SelectItem key='FREE'>Public</SelectItem>
                <SelectItem key='PREMIUM'>Premium</SelectItem>
              </Select>
            )}
          />

          {/* Category */}
          <Controller
            control={control}
            name='category'
            render={({ field }) => (
              <Select
                {...field}
                label='Category'
                variant='bordered'
                selectedKeys={[field.value]}
                onSelectionChange={(keys) => {
                  const value = Array.from(keys)[0] as string;

                  field.onChange(value);
                }}
              >
                {categoriesList.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </Select>
            )}
          />

          {/* AI Generated Label */}
          <Controller
            control={control}
            name='aiGenerated'
            render={({ field }) => (
              <div className='flex items-center justify-between p-3 rounded-lg border border-borderSubtle'>
                <div className='flex items-center gap-2'>
                  <Sparkles className='w-4 h-4 text-textSecondary' />
                  <div>
                    <p className='text-sm'>Add AI label</p>
                    <p className='text-xs text-textSecondary'>Label content made with AI</p>
                  </div>
                </div>
                <Switch isSelected={field.value} onValueChange={field.onChange} size='sm' />
              </div>
            )}
          />
        </div>
      </div>

      {/* Footer Actions */}
      <div className='p-4 border-t border-borderSubtle bg-surface safe-bottom'>
        <button
          type='submit'
          disabled={!isFormValid || isLoading}
          className={`
            w-full px-6 py-3 rounded-full font-semibold text-sm
            transition-all duration-300 ease-in-out
            ${
              !isFormValid || isLoading
                ? "bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed"
                : "bg-sage-600 text-white hover:bg-sage-700 hover:scale-x-105 dark:hover:bg-sage-500 dark:hover:text-sage-900"
            }
          `}
        >
          {isLoading ? (
            <span className='flex items-center justify-center gap-2'>
              <svg className='animate-spin h-5 w-5' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
                <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
                <path
                  className='opacity-75'
                  fill='currentColor'
                  d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                />
              </svg>
              Posting...
            </span>
          ) : (
            <span className='flex items-center justify-center gap-2'>
              <Sparkles className='w-4 h-4' />
              Create Post
            </span>
          )}
        </button>
      </div>

      {/* Music Picker Modal */}
      <MusicPickerModal
        isOpen={showMusicPicker}
        onClose={() => setShowMusicPicker(false)}
        onConfirm={(selection) => {
          setSelectedMusic(selection);
          setShowMusicPicker(false);
        }}
        contentType='post'
        initialSelection={selectedMusic}
      />
    </form>
  );
};

export default CreatePostMobile;
