"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { AiOutlineLike } from "react-icons/ai";
import { FaThumbsUp } from "react-icons/fa";
import { REACTION_EMOJI, REACTION_LABEL, REACTION_TYPES, TReactionSummary, TReactionType } from "@/src/types";
import { useGetReactionSummaryQuery, useRemoveReactionMutation, useSetReactionMutation } from "@/src/redux/features/post/postApi";
import EmojiPicker from "./EmojiPicker";

interface ReactionBarProps {
  /** Reactable target; defaults to a post. */
  targetType?: "post" | "comment" | "short";
  targetId: string;
  /** Denser pills for tight spaces (comment rows). */
  compact?: boolean;
}

/**
 * Facebook-style reaction system:
 * - Desktop: Hover on Like button → show emoji picker vertically
 * - Mobile: Click Like button → show emoji picker in popover
 * - Show reaction counts with emoji summaries
 */
export default function ReactionBar({ targetType = "post", targetId, compact = false }: ReactionBarProps) {
  const { data } = useGetReactionSummaryQuery({ targetType, targetId });
  const [setReactionFn] = useSetReactionMutation();
  const [removeReactionFn] = useRemoveReactionMutation();

  const summary = data?.data as TReactionSummary | undefined;

  const [local, setLocal] = useState<{
    counts: Partial<Record<TReactionType, number>>;
    myReaction: TReactionType | null;
  }>({ counts: {}, myReaction: null });
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (summary) {
      setLocal({ counts: summary.counts ?? {}, myReaction: summary.myReaction });
    }
  }, [summary?.total, summary?.myReaction, summary?.counts]);

  const handleReact = async (type: TReactionType) => {
    if (pending) return;
    const previous = local;
    const isActive = local.myReaction === type;

    // Optimistic switch: remove from the old type, apply to the new one.
    setLocal((prev) => {
      const counts = { ...prev.counts };

      if (prev.myReaction) {
        counts[prev.myReaction] = Math.max(0, (counts[prev.myReaction] ?? 0) - 1);
        if (counts[prev.myReaction] === 0) delete counts[prev.myReaction];
      }
      if (!isActive) {
        counts[type] = (counts[type] ?? 0) + 1;
      }

      return { counts, myReaction: isActive ? null : type };
    });

    setPending(true);
    try {
      if (isActive) {
        await removeReactionFn({ targetType, targetId }).unwrap();
      } else {
        await setReactionFn({ targetType, targetId, type }).unwrap();
      }
    } catch (error) {
      setLocal(previous);
      toast.error("Could not update your reaction");
    } finally {
      setPending(false);
    }
  };

  const total = Object.values(local.counts).reduce((sum, count) => sum + (count ?? 0), 0);
  const activeTypes = REACTION_TYPES.filter((type) => (local.counts[type] ?? 0) > 0).sort(
    (a, b) => (local.counts[b] ?? 0) - (local.counts[a] ?? 0),
  );

  const hasMyReaction = local.myReaction !== null;

  // For post targets (not compact), show Facebook-style reactions
  if (!compact) {
    return (
      <div className='flex flex-col gap-0 py-1'>
        {/* Like button with emoji picker + Reaction summary on one line */}
        <div className='flex items-center justify-between py-2'>
          {/* Like button */}
          <EmojiPicker onSelectReaction={handleReact} isLoading={pending}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors text-sm ${
                hasMyReaction ? "text-blue-600 hover:bg-blue-100" : "text-default-600 hover:text-blue-600 hover:bg-blue-50"
              }`}
            >
              {hasMyReaction ? <FaThumbsUp size={16} /> : <AiOutlineLike size={16} />}
              <span>{hasMyReaction ? `${REACTION_LABEL[local.myReaction!]}` : "Like"}</span>
            </motion.button>
          </EmojiPicker>

          {/* Reaction summary - emojis with total count */}
          {total > 0 && (
            <div className='flex items-center gap-2 px-3 py-2'>
              <div className='flex -space-x-2'>
                {activeTypes.slice(0, 3).map((type) => (
                  <span
                    key={type}
                    className='text-lg bg-white dark:bg-slate-900 rounded-full w-6 h-6 flex items-center justify-center border border-default-200'
                    title={`${local.counts[type]} ${REACTION_LABEL[type]}`}
                  >
                    {REACTION_EMOJI[type]}
                  </span>
                ))}
              </div>
              <span className='text-xs text-default-600 tabular-nums font-medium'>{total}</span>
            </div>
          )}
        </div>

        {/* Reaction details bar - show all reactions with counts */}
        {total > 0 && (
          <div className='flex items-center gap-1 flex-wrap px-1 py-2 border-t border-default-100'>
            {REACTION_TYPES.map((type) => {
              const count = local.counts[type] ?? 0;

              if (count === 0) return null;

              return (
                <motion.button
                  key={type}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => handleReact(type)}
                  className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs border transition-colors ${
                    local.myReaction === type
                      ? "border-blue-400 bg-blue-50 text-blue-700"
                      : "border-default-200 bg-default-50 text-default-600 hover:bg-default-100"
                  }`}
                >
                  <span className='text-sm'>{REACTION_EMOJI[type]}</span>
                  <span className='tabular-nums font-medium'>{count}</span>
                </motion.button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // For compact mode (comments), show simplified reactions
  return (
    <div className='flex items-center gap-1 flex-wrap'>
      <EmojiPicker onSelectReaction={handleReact} isLoading={pending}>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs border transition-colors ${
            hasMyReaction
              ? "border-blue-400 bg-blue-50 text-blue-700"
              : "border-default-200 bg-default-50 text-default-600 hover:border-blue-300 hover:bg-blue-50"
          }`}
        >
          {hasMyReaction ? <FaThumbsUp size={14} /> : <AiOutlineLike size={14} />}
          <span>Like</span>
        </motion.button>
      </EmojiPicker>

      {/* Reaction count pills - compact */}
      {REACTION_TYPES.map((type) => {
        const count = local.counts[type] ?? 0;

        if (count === 0) return null;

        return (
          <motion.button
            key={type}
            whileHover={{ scale: 1.05 }}
            onClick={() => handleReact(type)}
            className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] border transition-colors ${
              local.myReaction === type
                ? "border-blue-400 bg-blue-50 text-blue-700"
                : "border-default-200 bg-default-50 text-default-600 hover:bg-default-100"
            }`}
          >
            <span className='text-xs leading-none'>{REACTION_EMOJI[type]}</span>
            <span className='tabular-nums font-medium'>{count}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
