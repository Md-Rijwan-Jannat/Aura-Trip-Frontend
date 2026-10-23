'use client';

import React, { useRef } from 'react';
import { FaCamera, FaImages } from 'react-icons/fa';

export default function GroupImagesEditor({
  image,
  coverImage,
  uploading = false,
  onImage,
  onCover,
}: {
  image?: string;
  coverImage?: string;
  uploading?: boolean;
  onImage: (file: File) => void;
  onCover: (file: File) => void;
}) {
  const coverInput = useRef<HTMLInputElement>(null);
  const avatarInput = useRef<HTMLInputElement>(null);

  const handlePick = (
    e: React.ChangeEvent<HTMLInputElement>,
    cb: (f: File) => void
  ) => {
    const file = e.target.files?.[0];

    if (file) cb(file);
    e.target.value = '';
  };

  return (
    <div className="rounded-2xl border border-borderSubtle overflow-hidden bg-surface">
      {/* Cover */}
      <label className="relative block w-full aspect-[16/7] min-h-32 max-h-48 cursor-pointer group">
        {coverImage ? (
          <img src={coverImage} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-sage-600 via-sage-500 to-sage-300" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
        <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/45 backdrop-blur text-white text-xs font-semibold">
          <FaCamera />
          {coverImage ? 'Change cover' : 'Add cover'}
        </span>
        <input
          ref={coverInput}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handlePick(e, onCover)}
        />
      </label>

      {/* Avatar + hint */}
      <div className="px-4 sm:px-5 pb-4 -mt-9 flex items-end gap-4">
        <label className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl ring-4 ring-surface overflow-hidden bg-sage-100 dark:bg-sage-500/20 flex items-center justify-center text-sage-600 dark:text-sage-300 cursor-pointer group flex-shrink-0">
          {image ? (
            <img src={image} alt="" className="w-full h-full object-cover" />
          ) : (
            <FaImages className="text-xl opacity-60" />
          )}
          <span className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
            <FaCamera />
          </span>
          <input
            ref={avatarInput}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handlePick(e, onImage)}
          />
        </label>
        <div className="pb-1 min-w-0">
          <p className="text-sm font-semibold text-default-800 break-words">
            Profile & cover photos
          </p>
          <p className="text-xs text-default-500 break-words">
            {uploading
              ? 'Uploading image…'
              : 'Click the cover or avatar to upload. JPG or PNG.'}
          </p>
        </div>
      </div>
    </div>
  );
}
