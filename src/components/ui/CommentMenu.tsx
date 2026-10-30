"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface CommentMenuProps {
  isOwner: boolean;
  isPostOwner: boolean;
  isModerator?: boolean;
  isEditing: boolean;
  isFeatured: boolean;
  isReply: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onHide?: () => void;
  onFeature?: () => void;
  onUnfeature?: () => void;
}

export const CommentMenu: React.FC<CommentMenuProps> = ({
  isOwner,
  isPostOwner,
  isModerator = false,
  isEditing,
  isFeatured,
  isReply,
  onEdit,
  onDelete,
  onHide,
  onFeature,
  onUnfeature,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);

      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  // Don't show menu if no actions available
  if (!isOwner && !isPostOwner && !isModerator) {
    return null;
  }

  return (
    <div ref={menuRef} className='relative'>
      {/* Three-dot trigger button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className='
          p-1 rounded-full text-textSecondary
          hover:bg-gray-100 dark:hover:bg-gray-800
          hover:text-textMain transition-colors
        '
        aria-label='Comment options'
      >
        <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
          <path d='M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z' />
        </svg>
      </button>

      {/* Dropdown menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            transition={{ duration: 0.1 }}
            className='
              absolute right-0 mt-1 z-50
              bg-white dark:bg-surface
              shadow-[0_0_0_1px_rgba(0,0,0,0.05),0_8px_24px_rgba(0,0,0,0.15)]
              dark:shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_8px_24px_rgba(0,0,0,0.5)]
              rounded-xl overflow-hidden
              min-w-[180px]
            '
          >
            <div className='py-1'>
              {/* Owner actions */}
              {isOwner && !isEditing && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsOpen(false);
                      onEdit();
                    }}
                    className='
                      w-full px-4 py-2.5 text-left text-sm
                      flex items-center gap-3
                      text-textMain hover:bg-gray-100 dark:hover:bg-gray-800
                      transition-colors
                    '
                  >
                    <svg className='w-4 h-4 text-textSecondary' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
                      />
                    </svg>
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsOpen(false);
                      onDelete();
                    }}
                    className='
                      w-full px-4 py-2.5 text-left text-sm
                      flex items-center gap-3
                      text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20
                      transition-colors
                    '
                  >
                    <svg className='w-4 h-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
                      />
                    </svg>
                    <span>Delete</span>
                  </button>
                </>
              )}

              {/* Moderator actions */}
              {(isModerator || isPostOwner) && !isOwner && onHide && (
                <>
                  {isOwner && <div className='h-px bg-borderSubtle my-1' />}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsOpen(false);
                      onHide();
                    }}
                    className='
                      w-full px-4 py-2.5 text-left text-sm
                      flex items-center gap-3
                      text-textMain hover:bg-gray-100 dark:hover:bg-gray-800
                      transition-colors
                    '
                  >
                    <svg className='w-4 h-4 text-textSecondary' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21'
                      />
                    </svg>
                    <span>Hide Comment</span>
                  </button>
                </>
              )}

              {/* Post owner feature/unfeature action (only for top-level comments) */}
              {isPostOwner && !isReply && (onFeature || onUnfeature) && (
                <>
                  {(isOwner || isModerator) && <div className='h-px bg-borderSubtle my-1' />}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsOpen(false);
                      if (isFeatured && onUnfeature) {
                        onUnfeature();
                      } else if (!isFeatured && onFeature) {
                        onFeature();
                      }
                    }}
                    className='
                      w-full px-4 py-2.5 text-left text-sm
                      flex items-center gap-3
                      text-textMain hover:bg-gray-100 dark:hover:bg-gray-800
                      transition-colors
                    '
                  >
                    <svg className='w-4 h-4 text-textSecondary' fill='currentColor' viewBox='0 0 20 20'>
                      <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
                    </svg>
                    <span>{isFeatured ? "Unhighlight" : "Highlight"}</span>
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
