"use client";

import { useRef, useState } from "react";
import { Button } from "@nextui-org/button";
import { X, Upload, Image as ImageIcon } from "lucide-react";
import Image from "next/image";

interface MediaUploadZoneProps {
  onFilesSelected: (files: File[]) => void;
  onCancel: () => void;
  existingPreviews: string[];
  onRemoveImage: (index: number) => void;
}

const MediaUploadZone = ({ onFilesSelected, onCancel, existingPreviews, onRemoveImage }: MediaUploadZoneProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (files.length > 0) {
      onFilesSelected(files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files).filter((file) => file.type.startsWith("image/") || file.type.startsWith("video/"));

    if (files.length > 0) {
      onFilesSelected(files);
    }
  };

  return (
    <div className='space-y-3'>
      {/* Existing Images */}
      {existingPreviews.length > 0 && (
        <div className='grid grid-cols-3 gap-2'>
          {existingPreviews.map((preview, index) => (
            <div key={index} className='relative aspect-square'>
              <Image src={preview} alt={`Preview ${index + 1}`} fill className='object-cover rounded-lg' />
              <button
                type='button'
                onClick={() => onRemoveImage(index)}
                className='absolute top-1 right-1 w-6 h-6 bg-black/70 hover:bg-black rounded-full flex items-center justify-center transition-colors'
              >
                <X className='w-4 h-4 text-white' />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
          isDragging ? "border-primaryColor bg-sage-50" : "border-borderSubtle hover:border-primaryColor"
        }`}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className='flex flex-col items-center gap-3'>
          <div className='w-16 h-16 rounded-full bg-sage-100 flex items-center justify-center'>
            {isDragging ? (
              <Upload className='w-8 h-8 text-primaryColor animate-bounce' />
            ) : (
              <ImageIcon className='w-8 h-8 text-primaryColor' />
            )}
          </div>
          <div>
            <p className='text-base font-medium text-textMain'>{isDragging ? "Drop your files here" : "Add photos or videos"}</p>
            <p className='text-sm text-textSecondary mt-1'>or drag and drop</p>
          </div>
        </div>
      </div>

      <input ref={fileInputRef} type='file' accept='image/*,video/*' multiple className='hidden' onChange={handleFileSelect} />

      {/* Cancel Button */}
      <Button type='button' variant='light' className='w-full' onPress={onCancel}>
        Cancel
      </Button>
    </div>
  );
};

export default MediaUploadZone;
