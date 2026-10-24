"use client";

import React, { useState, useEffect, ChangeEvent } from "react";
import { useUser } from "@/src/hooks/useUser";
import { useUpdateMyProfileMutation } from "@/src/redux/features/user/userApi";
import { toast } from "sonner";
import Image from "next/image";
import { motion } from "framer-motion";
import { useForm, SubmitHandler } from "react-hook-form";
import { Button } from "@nextui-org/button";
import { Input } from "@nextui-org/input";
import { Avatar } from "@nextui-org/avatar";
import { Divider } from "@nextui-org/divider";
import { Switch } from "@nextui-org/switch";
import { FiCamera, FiCheck } from "react-icons/fi";
import { IoIosImages } from "react-icons/io";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MdArrowBack } from "react-icons/md";

interface CloudinaryResponse {
  secure_url?: string;
  error?: {
    message: string;
  };
}

interface FormInputs {
  name: string;
  email: string;
  bio: string;
  country: string;
  address: string;
  imageFile: File | null;
  coverFile: File | null;
  profileVisibility: boolean;
  onlineStatus: boolean;
  lastSeen: boolean;
  allowMessages: boolean;
  allowCalls: boolean;
  readReceipts: boolean;
}

export default function ProfileEditPage() {
  const router = useRouter();
  const { userInfo, refetch } = useUser();
  const [updateMyProfileFn, { isLoading }] = useUpdateMyProfileMutation();
  const [image, setImage] = useState<string>(userInfo?.image || "");
  const [cover, setCover] = useState<string>(userInfo?.coverImage || "");
  const [isUploading, setIsUploading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { isDirty },
  } = useForm<FormInputs>({
    defaultValues: {
      name: userInfo?.name || "",
      email: userInfo?.email || "",
      bio: userInfo?.bio || "",
      country: userInfo?.country || "",
      address: userInfo?.address || "",
      imageFile: null,
      coverFile: null,
      profileVisibility: true,
      onlineStatus: false,
      lastSeen: false,
      allowMessages: true,
      allowCalls: true,
      readReceipts: true,
    },
  });

  useEffect(() => {
    if (userInfo) {
      reset({
        name: userInfo.name || "",
        email: userInfo.email || "",
        bio: userInfo.bio || "",
        country: userInfo.country || "",
        address: userInfo.address || "",
        imageFile: null,
        coverFile: null,
        profileVisibility: true,
        onlineStatus: false,
        lastSeen: false,
        allowMessages: true,
        allowCalls: true,
        readReceipts: true,
      });
      setImage(userInfo.image || "");
      setCover(userInfo.coverImage || "");
    }
  }, [userInfo, reset]);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];

    if (file) {
      setValue("imageFile", file, { shouldDirty: true });
      setImage(URL.createObjectURL(file));
    }
  };

  const handleCoverChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];

    if (file) {
      setValue("coverFile", file, { shouldDirty: true });
      setCover(URL.createObjectURL(file));
    }
  };

  const uploadImageToCloudinary = async (file: File): Promise<string> => {
    setIsUploading(true);
    const formData = new FormData();

    formData.append("file", file);
    formData.append("upload_preset", "aura-trip");

    const cloudinaryUrl = process.env.NEXT_PUBLIC_CLOUDINARY_URL;

    if (!cloudinaryUrl) {
      setIsUploading(false);
      toast.error("Cloudinary configuration error");
      throw new Error("Cloudinary URL not configured");
    }

    try {
      const res = await fetch(`${cloudinaryUrl}`, {
        method: "POST",
        body: formData,
      });

      const data: CloudinaryResponse = await res.json();

      if (!res.ok) {
        throw new Error(data.error?.message || "Failed to upload image");
      }

      setIsUploading(false);

      if (!data.secure_url) {
        throw new Error("No URL returned from Cloudinary");
      }

      return data.secure_url;
    } catch (error) {
      setIsUploading(false);
      toast.error("Image upload failed");

      throw error;
    }
  };

  const onSubmit: SubmitHandler<FormInputs> = async (data) => {
    let uploadedImageUrl = image;
    let uploadedCoverUrl = cover;

    if (data.imageFile) {
      try {
        uploadedImageUrl = await uploadImageToCloudinary(data.imageFile);
      } catch (error) {
        return;
      }
    }

    if (data.coverFile) {
      try {
        uploadedCoverUrl = await uploadImageToCloudinary(data.coverFile);
      } catch (error) {
        return;
      }
    }

    const updateData: any = {
      name: data.name,
      bio: data.bio,
      country: data.country,
      address: data.address,
    };

    // Only include image URLs if they are valid HTTP(s) URLs
    if (uploadedImageUrl && uploadedImageUrl.startsWith("http")) {
      updateData.image = uploadedImageUrl;
    }

    if (uploadedCoverUrl && uploadedCoverUrl.startsWith("http")) {
      updateData.coverImage = uploadedCoverUrl;
    } else if (uploadedCoverUrl === "") {
      // If cover was cleared, explicitly set to null
      updateData.coverImage = null;
    }

    try {
      const res = await updateMyProfileFn({
        data: updateData,
        id: userInfo?._id,
      }).unwrap();

      if (res?.success) {
        // Refetch user data to update the navbar and other components
        await refetch();

        toast.success("Profile updated successfully!");
        router.push(`/profile/${userInfo?._id}`);
      }
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

  return (
    <motion.div
      className='w-full min-h-screen bg-background'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Top Navigation Bar */}
      <div className='sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b border-borderSubtle'>
        <div className='max-w-3xl mx-auto flex items-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3'>
          <Link href={`/profile/${userInfo?._id}`}>
            <Button isIconOnly variant='light' size='sm' className='hover:bg-sage-50 dark:hover:bg-default-100'>
              <MdArrowBack size={18} className='text-textMain' />
            </Button>
          </Link>
          <div>
            <h1 className='text-base sm:text-lg font-bold text-textMain'>Edit Profile</h1>
            <p className='text-xs text-textSecondary hidden sm:inline'>Update your information</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className='w-full max-w-3xl mx-auto px-3 sm:px-4 py-3 sm:py-4'>
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-3 sm:space-y-4'>
          {/* Cover Photo Section */}
          <motion.div
            className='relative rounded-lg overflow-hidden h-24 sm:h-32 bg-gradient-to-r from-sage-300 to-sage-500 dark:from-default-400 dark:to-default-600 group'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {cover && <Image src={cover} alt='Cover' fill className='object-cover w-full h-full' priority />}
            <div className='absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer'>
              <label
                htmlFor='cover-input'
                className='cursor-pointer bg-white hover:bg-sage-50 px-3 py-1.5 rounded-lg flex items-center gap-1 text-sage-700 font-semibold text-xs sm:text-sm transition-all shadow-lg'
              >
                <FiCamera size={14} />
                Change
              </label>
              <input id='cover-input' type='file' accept='image/*' onChange={handleCoverChange} className='hidden' />
            </div>
          </motion.div>

          {/* Profile Card */}
          <motion.div
            className='bg-default-100/60 dark:bg-white/[0.03] border border-borderSubtle rounded-lg overflow-hidden'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <div className='px-3 sm:px-4 py-3 sm:py-4'>
              {/* Profile Picture Section */}
              <div className='flex items-end gap-3 sm:gap-4 mb-4'>
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                >
                  <div className='relative'>
                    {image ? (
                      <Avatar
                        src={image}
                        className='w-16 h-16 sm:w-20 sm:h-20 text-lg border-3 border-surface dark:border-default-100 shadow-lg'
                      />
                    ) : (
                      <div className='w-16 h-16 sm:w-20 sm:h-20 rounded-full border-3 border-surface dark:border-default-100 shadow-lg bg-gradient-to-br from-sage-200 to-sage-100 dark:from-default-300 dark:to-default-200 flex items-center justify-center'>
                        <IoIosImages size={24} className='text-sage-400' />
                      </div>
                    )}
                    <label
                      htmlFor='image-input'
                      className='absolute bottom-0 right-0 bg-sage-600 hover:bg-sage-700 text-white p-1.5 rounded-full cursor-pointer transition-colors shadow-lg border-2 border-surface dark:border-default-100'
                    >
                      <FiCamera size={12} />
                    </label>
                  </div>
                  <input id='image-input' type='file' accept='image/*' onChange={handleImageChange} className='hidden' />
                </motion.div>

                <div className='flex-1'>
                  <h2 className='text-sm sm:text-base font-bold text-textMain'>Profile Information</h2>
                  <p className='text-xs text-textSecondary'>Update your details</p>
                </div>
              </div>

              <Divider className='my-3' />

              {/* Form Fields */}
              <motion.div
                className='space-y-3'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                {/* Name & Email */}
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
                  <Input
                    type='text'
                    label='Full Name'
                    variant='bordered'
                    size='sm'
                    placeholder='Your name'
                    {...register("name")}
                    classNames={{
                      label: "text-xs font-semibold",
                      input: "text-sm",
                    }}
                  />

                  <Input
                    type='email'
                    label='Email'
                    variant='bordered'
                    size='sm'
                    isReadOnly
                    {...register("email")}
                    classNames={{
                      label: "text-xs font-semibold",
                      input: "text-sm",
                    }}
                  />
                </div>

                {/* Bio */}
                <div className='space-y-1'>
                  <label htmlFor='bio' className='text-xs font-semibold text-textMain block'>
                    Bio
                  </label>
                  <textarea
                    id='bio'
                    {...register("bio")}
                    placeholder='Tell us about yourself...'
                    className='w-full px-3 py-2 text-xs sm:text-sm border border-borderSubtle rounded-lg bg-default-50 dark:bg-default-200 text-textMain focus:outline-none focus:ring-2 focus:ring-sage-600 resize-none'
                    rows={2}
                  />
                </div>

                {/* Location */}
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
                  <Input
                    type='text'
                    label='Country'
                    variant='bordered'
                    size='sm'
                    placeholder='Country'
                    {...register("country")}
                    classNames={{
                      label: "text-xs font-semibold",
                      input: "text-sm",
                    }}
                  />

                  <Input
                    type='text'
                    label='City / Address'
                    variant='bordered'
                    size='sm'
                    placeholder='City'
                    {...register("address")}
                    classNames={{
                      label: "text-xs font-semibold",
                      input: "text-sm",
                    }}
                  />
                </div>
              </motion.div>

              <Divider className='my-3' />

              {/* Privacy Settings */}
              <motion.div
                className='space-y-2'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.25 }}
              >
                <h3 className='text-xs font-bold text-textMain uppercase'>Privacy & Settings</h3>

                <div className='space-y-1.5'>
                  {[
                    { label: "Public Profile", desc: "Allow others to view" },
                    { label: "Online Status", desc: "Show when online" },
                    { label: "Last Seen", desc: "Display activity time" },
                    { label: "Allow Messages", desc: "Receive messages" },
                    { label: "Allow Calls", desc: "Let others call" },
                    { label: "Read Receipts", desc: "Show read status" },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className='flex items-center justify-between py-2 px-2 hover:bg-white dark:hover:bg-default-100/50 rounded transition-colors'
                    >
                      <div className='flex-1'>
                        <p className='text-xs font-semibold text-textMain'>{item.label}</p>
                        <p className='text-xs text-textSecondary'>{item.desc}</p>
                      </div>
                      <Switch
                        size='sm'
                        classNames={{
                          wrapper: "group-data-[selected=true]:bg-sage-600",
                        }}
                        defaultChecked={
                          item.label === "Public Profile" ||
                          item.label === "Allow Messages" ||
                          item.label === "Allow Calls" ||
                          item.label === "Read Receipts"
                        }
                      />
                    </div>
                  ))}
                </div>
              </motion.div>

              <Divider className='my-3' />

              {/* Action Buttons */}
              <motion.div
                className='flex gap-2 justify-end'
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
              >
                <Link href={`/profile/${userInfo?._id}`} className='flex-1 sm:flex-none'>
                  <Button
                    variant='bordered'
                    size='sm'
                    className='w-full border-sage-600 text-sage-600 dark:border-sage-400 dark:text-sage-400 font-medium'
                  >
                    Cancel
                  </Button>
                </Link>
                <Button
                  type='submit'
                  size='sm'
                  className='flex-1 sm:flex-none bg-sage-600 hover:bg-sage-700 text-white font-medium'
                  isLoading={isLoading || isUploading}
                  isDisabled={!isDirty}
                  startContent={!isLoading && !isUploading && <FiCheck size={14} />}
                >
                  {isLoading || isUploading ? "Saving..." : "Save"}
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </form>
      </div>
    </motion.div>
  );
}
