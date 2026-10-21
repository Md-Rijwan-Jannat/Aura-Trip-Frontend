'use client';

import { useState, useRef } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from '@nextui-org/modal';
import { Button } from '@nextui-org/button';
import { PlusIcon, Loader2, X } from 'lucide-react';
import Image from 'next/image';
import { uploadToCloudinary } from '@/src/utils/uploadCloudinary';
import { useCreateStoryMutation } from '@/src/redux/features/story/storyApi';

export function CreateStoryModal() {
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
  const [createStoryFn, { isLoading }] = useCreateStoryMutation();
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCreateStory = async () => {
    if (selectedFile) {
      try {
        setUploadProgress(0);
        setUploading(true);
        const cloudinaryUrl = await uploadToCloudinary(selectedFile);

        setUploadProgress(100);

        await createStoryFn({ media: cloudinaryUrl });
        onClose();
        handleRemoveFile();
        setUploading(false);
      } catch (error) {
        console.error('Error creating story:', error);
        setUploadProgress(0);
      }
    }
  };

  return (
    <>
      <Button
        onPress={onOpen}
        isIconOnly
        size="sm"
        radius="full"
        startContent={<PlusIcon className="size-5 text-white" />}
        className="-mt-4 size-8 rounded-full flex items-center justify-center bg-sage-600 border-2 border-secondary-50"
      />
      <Modal
        placement="center"
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        size="2xl"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Create Story</ModalHeader>
              <ModalBody>
                {previewUrl ? (
                  <div className="relative">
                    {selectedFile?.type.startsWith('image/') ? (
                      <Image
                        src={previewUrl}
                        alt="Preview"
                        width={600}
                        height={600}
                        className="w-full h-[50vh] object-cover rounded-lg"
                      />
                    ) : (
                      <video
                        src={previewUrl}
                        className="w-full h-[50vh] object-cover rounded-lg"
                        controls
                      >
                        <track
                          kind="captions"
                          srcLang="en"
                          src=""
                          label="English captions"
                          default
                        />
                      </video>
                    )}
                    <Button
                      isIconOnly
                      color="danger"
                      variant="flat"
                      className="absolute top-2 right-2"
                      onClick={handleRemoveFile}
                    >
                      <X size={20} />
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[40vh] border-2 border-dashed border-default-300 rounded-lg">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,video/*"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="storyUpload"
                    />
                    <label htmlFor="storyUpload">
                      <div className="flex flex-col items-center justify-center cursor-pointer">
                        <PlusIcon size={48} className="text-sage-600 dark:text-sage-400 mb-4" />
                        <p className="text-default-600 mb-4">
                          Upload an image or video
                        </p>
                      </div>
                    </label>
                  </div>
                )}
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="mt-4">
                    <div className="w-full bg-default-200 rounded-full h-2.5">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full"
                        style={{ width: `${uploadProgress}%` }}
                       />
                    </div>
                    <p className="text-sm text-default-600 mt-2">
                      Uploading: {uploadProgress}%
                    </p>
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button
                  className="primary-button"
                  onClick={handleCreateStory}
                  isLoading={
                    isLoading ||
                    uploading ||
                    (uploadProgress > 0 && uploadProgress < 100)
                  }
                  isDisabled={
                    !selectedFile ||
                    uploading ||
                    isLoading ||
                    (uploadProgress > 0 && uploadProgress < 100)
                  }
                >
                  Share Your Story
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
