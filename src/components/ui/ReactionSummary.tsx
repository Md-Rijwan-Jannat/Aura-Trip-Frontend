"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { REACTIONS, ReactionType } from "./ReactionPicker";

interface ReactionSummary {
  counts: Record<string, number>;
  total: number;
  myReaction: ReactionType | null;
}

interface ReactionSummaryProps {
  summary: ReactionSummary;
  onReactionTypeClick?: (type: ReactionType) => void;
  className?: string;
}

export const ReactionSummaryDisplay: React.FC<ReactionSummaryProps> = ({ summary, onReactionTypeClick, className = "" }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!summary || summary.total === 0) {
    return null;
  }

  // Get top 3 reactions by count
  const topReactions = Object.entries(summary.counts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([type]) => REACTIONS.find((r) => r.type === type))
    .filter(Boolean);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Reaction icons stack */}
      <div
        className='flex items-center -space-x-1 cursor-pointer'
        onClick={() => setIsExpanded(!isExpanded)}
        role='button'
        aria-label='View reaction breakdown'
      >
        {topReactions.map((reaction, index) => (
          <motion.div
            key={reaction!.type}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className='
              w-6 h-6 rounded-full bg-white dark:bg-surface
              border-2 border-white dark:border-surface
              flex items-center justify-center text-sm
              shadow-sm
            '
            style={{ zIndex: topReactions.length - index }}
          >
            {reaction!.emoji}
          </motion.div>
        ))}
      </div>

      {/* Total count */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className='
          text-sm text-textSecondary hover:text-sage-600 dark:hover:text-sage-400
          hover:underline transition-colors
        '
      >
        {summary.total.toLocaleString()}
      </button>

      {/* Expanded breakdown modal */}
      <AnimatePresence>
        {isExpanded && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsExpanded(false)}
              className='fixed inset-0 bg-black/30 dark:bg-black/60 z-40'
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className='
                fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
                bg-white dark:bg-surface rounded-2xl shadow-2xl
                border border-borderSubtle z-50
                w-full max-w-sm mx-4 p-6
              '
            >
              <div className='flex items-center justify-between mb-4'>
                <h3 className='text-lg font-semibold text-textMain'>Reactions</h3>
                <button
                  onClick={() => setIsExpanded(false)}
                  className='
                    text-textSecondary hover:text-textMain
                    transition-colors p-1 rounded-full
                    hover:bg-gray-100 dark:hover:bg-gray-800
                  '
                  aria-label='Close'
                >
                  <svg className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                  </svg>
                </button>
              </div>

              {/* Reaction list */}
              <div className='space-y-2'>
                {REACTIONS.map((reaction) => {
                  const count = summary.counts[reaction.type] || 0;

                  if (count === 0) return null;

                  const percentage = (count / summary.total) * 100;
                  const isMyReaction = summary.myReaction === reaction.type;

                  return (
                    <motion.button
                      key={reaction.type}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      onClick={() => {
                        onReactionTypeClick?.(reaction.type);
                        setIsExpanded(false);
                      }}
                      className={`
                        w-full flex items-center gap-3 p-3 rounded-xl
                        transition-colors
                        ${
                          isMyReaction ? "bg-sage-100 dark:bg-sage-900/30 ring-1 ring-sage-500" : "hover:bg-gray-100 dark:hover:bg-gray-800"
                        }
                      `}
                    >
                      <span className='text-2xl'>{reaction.emoji}</span>
                      <div className='flex-1 text-left'>
                        <div className='flex items-center justify-between mb-1'>
                          <span className='text-sm font-medium text-textMain'>
                            {reaction.label}
                            {isMyReaction && <span className='ml-2 text-xs text-sage-600 dark:text-sage-400'>(You)</span>}
                          </span>
                          <span className='text-sm font-semibold text-textMain'>{count}</span>
                        </div>
                        <div className='w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5'>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                            className='bg-sage-600 h-1.5 rounded-full'
                          />
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              <div className='mt-4 pt-4 border-t border-borderSubtle'>
                <div className='flex items-center justify-between text-sm'>
                  <span className='text-textSecondary'>Total reactions</span>
                  <span className='font-semibold text-textMain'>{summary.total.toLocaleString()}</span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
