'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  REACTION_EMOJI,
  REACTION_LABEL,
  REACTION_TYPES,
  TReactionSummary,
  TReactionType,
} from '@/src/types';
import {
  useGetReactionSummaryQuery,
  useRemoveReactionMutation,
  useSetReactionMutation,
} from '@/src/redux/features/post/postApi';

interface ReactionBarProps {
  /** Reactable target; defaults to a post. */
  targetType?: 'post' | 'comment' | 'short';
  targetId: string;
  /** Denser pills for tight spaces (comment rows). */
  compact?: boolean;
}

/**
 * Seven-type emoji reaction bar. One reaction per user per target — tapping a
 * different emoji switches it, tapping the active one removes it. Counts come
 * from the server-side summary and stay optimistic while the mutation runs.
 */
export default function ReactionBar({
  targetType = 'post',
  targetId,
  compact = false,
}: ReactionBarProps) {
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
        counts[prev.myReaction] = Math.max(
          0,
          (counts[prev.myReaction] ?? 0) - 1,
        );
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
      toast.error('Could not update your reaction');
    } finally {
      setPending(false);
    }
  };

  const total = Object.values(local.counts).reduce(
    (sum, count) => sum + (count ?? 0),
    0,
  );
  const activeTypes = REACTION_TYPES.filter(
    (type) => (local.counts[type] ?? 0) > 0,
  ).sort((a, b) => (local.counts[b] ?? 0) - (local.counts[a] ?? 0));

  return (
    <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-1">
      {REACTION_TYPES.map((type) => {
        const isActive = local.myReaction === type;
        const count = local.counts[type] ?? 0;

        return (
          <motion.button
            key={type}
            whileHover={{ scale: 1.12 }}
            whileTap={{ scale: 0.92 }}
            aria-label={REACTION_LABEL[type]}
            title={REACTION_LABEL[type]}
            onClick={() => handleReact(type)}
            className={`flex shrink-0 items-center gap-1 rounded-full border transition-colors ${
              compact ? 'px-1.5 py-0.5 text-[11px]' : 'px-2 py-1 text-xs'
            } ${
              isActive
                ? 'border-primary bg-primary-100 text-primary'
                : 'border-default-200 bg-default-50 text-default-600 hover:border-primary-300 hover:bg-primary-50'
            }`}
          >
            <span className={compact ? 'text-xs leading-none' : 'text-sm leading-none'}>
              {REACTION_EMOJI[type]}
            </span>
            {count > 0 && <span className="tabular-nums">{count}</span>}
          </motion.button>
        );
      })}

      {total > 0 && (
        <div className="ml-auto hidden shrink-0 items-center gap-1 pl-2 text-xs text-default-500 md:flex">
          <span>
            {activeTypes
              .slice(0, 3)
              .map((type) => REACTION_EMOJI[type])
              .join('')}
          </span>
          <span className="tabular-nums">{total}</span>
        </div>
      )}
    </div>
  );
}
