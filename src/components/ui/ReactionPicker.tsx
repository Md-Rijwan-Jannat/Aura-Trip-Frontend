"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export const REACTIONS = [
  { type: "like", emoji: "👍", label: "Like" },
  { type: "love", emoji: "❤️", label: "Love" },
  { type: "care", emoji: "🤗", label: "Care" },
  { type: "haha", emoji: "😂", label: "Haha" },
  { type: "wow", emoji: "😮", label: "Wow" },
  { type: "sad", emoji: "😢", label: "Sad" },
  { type: "angry", emoji: "😡", label: "Angry" },
] as const;

export type ReactionType = (typeof REACTIONS)[number]["type"];

interface ReactionPickerProps {
  currentReaction: ReactionType | null;
  onReactionSelect: (type: ReactionType) => void;
  onReactionRemove: () => void;
  trigger?: "hover" | "click";
  position?: "top" | "bottom";
  className?: string;
}

export const ReactionPicker: React.FC<ReactionPickerProps> = ({
  currentReaction,
  onReactionSelect,
  onReactionRemove,
  trigger = "hover",
  position = "top",
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredReaction, setHoveredReaction] = useState<ReactionType | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const longPressRef = useRef<NodeJS.Timeout>();
  const pickerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile("ontouchstart" in window);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (longPressRef.current) clearTimeout(longPressRef.current);
    };
  }, []);

  const handleMouseEnter = () => {
    if (trigger === "hover" && !isMobile) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setIsOpen(true);
    }
  };

  const handleMouseLeave = () => {
    if (trigger === "hover" && !isMobile) {
      timeoutRef.current = setTimeout(() => setIsOpen(false), 300);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isMobile) return;
    longPressRef.current = setTimeout(() => {
      setIsOpen(true);
    }, 500);
  };

  const handleTouchEnd = () => {
    if (longPressRef.current) {
      clearTimeout(longPressRef.current);
      longPressRef.current = undefined;
    }
  };

  const handleReactionClick = (type: ReactionType) => {
    if (currentReaction === type) {
      onReactionRemove();
    } else {
      onReactionSelect(type);
    }
    setIsOpen(false);
  };

  const handleQuickReaction = (e: React.MouseEvent) => {
    if (isMobile && !isOpen) return; // On mobile, long-press opens picker first
    e.stopPropagation();
    if (currentReaction) {
      onReactionRemove();
    } else {
      onReactionSelect("like");
    }
  };

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);

      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("touchstart", handleClickOutside);
      };
    }
  }, [isOpen]);

  const currentReactionEmoji = REACTIONS.find((r) => r.type === currentReaction)?.emoji;
  const currentReactionLabel = REACTIONS.find((r) => r.type === currentReaction)?.label;

  return (
    <div ref={pickerRef} className={`relative inline-block ${className}`} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      {/* Trigger Button */}
      <button
        ref={buttonRef}
        onClick={trigger === "click" ? () => setIsOpen(!isOpen) : handleQuickReaction}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-lg
          transition-all duration-200 ease-in-out
          ${
            currentReaction
              ? "text-sage-600 dark:text-sage-400 font-semibold"
              : "text-textSecondary hover:text-sage-600 dark:hover:text-sage-400 hover:bg-sage-50 dark:hover:bg-sage-900/20"
          }
          active:scale-95 select-none touch-manipulation
        `}
        aria-label={currentReaction ? `Remove ${currentReactionLabel}` : "Like"}
      >
        <span className='text-lg'>{currentReactionEmoji || "👍"}</span>
        <span className='text-sm font-medium'>{currentReactionLabel || "Like"}</span>
      </button>

      {/* Horizontal Reaction Picker Popup - Instant Display */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
            className={`
              absolute ${position === "top" ? "bottom-full mb-2" : "top-full mt-2"} left-0
              bg-white dark:bg-surface shadow-[0_0_0_1px_rgba(0,0,0,0.05),0_4px_16px_rgba(0,0,0,0.15)] rounded-full
              px-2 py-1.5 z-50
              flex items-center gap-0.5
              pointer-events-auto
            `}
            style={{
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
            }}
          >
            {REACTIONS.map((reaction) => (
              <button
                key={reaction.type}
                onClick={(e) => {
                  e.stopPropagation();
                  handleReactionClick(reaction.type);
                }}
                onMouseEnter={() => !isMobile && setHoveredReaction(reaction.type)}
                onMouseLeave={() => !isMobile && setHoveredReaction(null)}
                className={`
                  w-10 h-10 flex items-center justify-center
                  rounded-full transition-all duration-150
                  ${
                    currentReaction === reaction.type
                      ? "bg-sage-100 dark:bg-sage-900/40 scale-110"
                      : "hover:bg-gray-100 dark:hover:bg-gray-800"
                  }
                  ${hoveredReaction === reaction.type && !isMobile ? "emoji-hover-bounce" : ""}
                  relative cursor-pointer
                `}
                aria-label={reaction.label}
              >
                <span className='text-[28px] leading-none select-none' style={{ pointerEvents: "none" }}>
                  {reaction.emoji}
                </span>
              </button>
            ))}

            {/* Floating Tooltip on Hover - Desktop Only */}
            {hoveredReaction && !isMobile && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.1 }}
                className='absolute -top-10 left-1/2 transform -translate-x-1/2
                  bg-gray-900/95 dark:bg-gray-700/95 text-white text-xs font-medium
                  px-3 py-1.5 rounded-lg shadow-lg
                  whitespace-nowrap pointer-events-none
                  backdrop-blur-sm'
              >
                {REACTIONS.find((r) => r.type === hoveredReaction)?.label}
                <div className='absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900/95 dark:bg-gray-700/95 rotate-45' />
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
