"use client";

import React, { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { REACTION_EMOJI, REACTION_LABEL, REACTION_TYPES, TReactionType } from "@/src/types";

interface EmojiPickerProps {
  onSelectReaction: (type: TReactionType) => Promise<void>;
  isLoading?: boolean;
  children: React.ReactNode;
}

/**
 * Facebook-style emoji picker:
 * - Desktop: Hover to show emoji options vertically
 * - Mobile: Click to show emoji options vertically
 */
export default function EmojiPicker({ onSelectReaction, isLoading = false, children }: EmojiPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile vs desktop
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Close picker when clicking outside
  useEffect(() => {
    if (!showPicker) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showPicker]);

  const handleReactionClick = async (type: TReactionType) => {
    await onSelectReaction(type);
    setShowPicker(false);
  };

  // Desktop: hover to show, Mobile: click to show
  const handleMouseEnter = () => {
    if (!isMobile) {
      setShowPicker(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile) {
      setShowPicker(false);
    }
  };

  const handleClick = () => {
    if (isMobile) {
      setShowPicker(!showPicker);
    }
  };

  return (
    <div
      ref={containerRef}
      className='relative inline-block'
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      {/* Trigger Button */}
      <div className='cursor-pointer'>{children}</div>

      {/* Emoji Picker Popover - Vertical Stack */}
      <AnimatePresence>
        {showPicker && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -10 }}
            transition={{ duration: 0.15 }}
            className={`absolute z-50 rounded-2xl bg-white dark:bg-slate-800 shadow-2xl border border-default-200 p-3 flex flex-col gap-2 ${
              isMobile ? "bottom-full mb-3 left-1/2 transform -translate-x-1/2" : "top-full mt-3 left-1/2 transform -translate-x-1/2"
            }`}
          >
            {/* Emoji buttons - vertical column */}
            {REACTION_TYPES.map((type) => (
              <motion.button
                key={type}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleReactionClick(type)}
                disabled={isLoading}
                title={REACTION_LABEL[type]}
                className='flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-default-100 dark:hover:bg-slate-700 transition-colors text-2xl font-medium'
              >
                <span>{REACTION_EMOJI[type]}</span>
                <span className='text-xs text-default-600 dark:text-slate-400'>{REACTION_LABEL[type]}</span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
