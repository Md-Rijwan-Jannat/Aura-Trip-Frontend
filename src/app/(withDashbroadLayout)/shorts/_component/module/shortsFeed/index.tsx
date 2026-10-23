'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Avatar } from '@nextui-org/avatar';
import Link from 'next/link';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaHeart,
  FaRegHeart,
  FaPlay,
  FaPause,
  FaComment,
  FaPlus,
} from 'react-icons/fa';
import { HiEye } from 'react-icons/hi';
import {
  useGetAllShortsQuery,
  useLikeShortMutation,
  useUnlikeShortMutation,
  useViewShortMutation,
} from '@/src/redux/features/short/shortApi';
import { TShort } from '@/src/types';
import { CommunityButton, EmptyState, CardSkeleton } from '@/src/components/ui/communityKit';
import CreateShortModal from '../../modal/createShortModal';

function RailButton({
  active,
  count,
  label,
  onClick,
  children,
}: {
  active?: boolean;
  count?: number;
  label: string;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="group flex flex-col items-center gap-1"
    >
      <span
        className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center text-base sm:text-lg backdrop-blur border transition-all duration-200 group-hover:scale-110 ${
          active
            ? 'bg-rose-500 border-rose-400 text-white shadow-lg shadow-rose-500/30'
            : 'bg-white/15 border-white/25 text-white group-hover:bg-white/25'
        }`}
      >
        {children}
      </span>
      {typeof count === 'number' && (
        <span className="text-[11px] font-bold text-white/90 tabular-nums">
          {count}
        </span>
      )}
    </button>
  );
}

function ShortItem({
  short,
  onLike,
  onView,
  active,
  onActivate,
}: {
  short: TShort;
  onLike: (s: TShort) => void;
  onView: (id: string) => void;
  active: boolean;
  onActivate: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [paused, setPaused] = useState(false);
  const viewedRef = useRef(false);

  useEffect(() => {
    const el = ref.current;

    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
            onActivate();
            if (!viewedRef.current) {
              viewedRef.current = true;
              onView(short._id);
            }
          }
        });
      },
      { threshold: [0.6] },
    );

    observer.observe(el);

    return () => observer.disconnect();
  }, [short._id, onActivate, onView]);

  useEffect(() => {
    const video = videoRef.current;

    if (!video) return;
    if (active && !paused) {
      video.play().catch(() => setPaused(true));
    } else {
      video.pause();
    }
  }, [active, paused]);

  const author =
    typeof short.user === 'string' ? { _id: short.user, name: 'Traveler' } : short.user;

  const liked = short.likedByMe || false;
  const likeCount = short.likes?.length || 0;
  const viewCount = short.views?.length || 0;

  return (
    <div
      ref={ref}
      className="snap-start h-[calc(100vh-9rem)] sm:h-[calc(100vh-8rem)] flex items-center justify-center min-w-0"
    >
      <div className="relative h-full max-h-[720px] w-full max-w-[440px] rounded-2xl sm:rounded-3xl overflow-hidden bg-black shadow-2xl ring-1 ring-black/40">
        <video
          ref={videoRef}
          src={short.video}
          poster={short.coverImage || undefined}
          loop
          muted
          playsInline
          className="h-full w-full object-cover"
          onClick={() => setPaused((p) => !p)}
        />

        {/* Center play/pause */}
        <AnimatePresence>
          {paused && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.2 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <span className="w-16 h-16 rounded-full bg-black/40 backdrop-blur flex items-center justify-center">
                <FaPlay className="text-white text-2xl ml-1" />
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Top badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="px-2.5 py-1 rounded-full bg-black/40 backdrop-blur text-white text-[11px] font-semibold">
            {short.audience}
          </span>
          {short.group ? (
            <span className="px-2.5 py-1 rounded-full bg-sage-500/90 text-white text-[11px] font-semibold">
              Group
            </span>
          ) : null}
        </div>

        {/* Right action rail */}
        <div className="absolute right-2 sm:right-3 bottom-24 sm:bottom-28 flex flex-col items-center gap-3 sm:gap-4">
          <RailButton
            label="Like"
            active={liked}
            count={likeCount}
            onClick={() => onLike(short)}
          >
            {liked ? <FaHeart /> : <FaRegHeart />}
          </RailButton>
          <RailButton label="Views" count={viewCount}>
            <HiEye />
          </RailButton>
          <RailButton label="Comments">
            <FaComment />
          </RailButton>
        </div>

        {/* Bottom overlay */}
        <div className="absolute bottom-0 inset-x-0 p-3 sm:p-4 pr-16 bg-gradient-to-t from-black/85 via-black/40 to-transparent text-white space-y-2 min-w-0">
          <Link
            href={`/profile/${author._id}`}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur border border-white/20 hover:bg-white/25 transition-colors"
          >
            <Avatar
              size="sm"
              name={author.name?.charAt(0)?.toUpperCase()}
              src={(author as { image?: string }).image || undefined}
              className="w-7 h-7"
            />
            <span className="text-sm font-semibold">{author.name}</span>
          </Link>
          {short.title ? (
            <p className="text-sm font-bold leading-snug">{short.title}</p>
          ) : null}
          {short.caption ? (
            <p className="text-xs text-white/80 line-clamp-2">{short.caption}</p>
          ) : null}
        </div>

        {/* Bottom-right play toggle (mobile-friendly) */}
        <button
          type="button"
          aria-label={paused ? 'Play' : 'Pause'}
          onClick={() => setPaused((p) => !p)}
          className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-black/40 backdrop-blur border border-white/20 text-white flex items-center justify-center hover:bg-black/60 transition-colors"
        >
          {paused ? <FaPlay /> : <FaPause />}
        </button>
      </div>
    </div>
  );
}

export default function ShortsFeed() {
  const [page, setPage] = useState(1);
  const [activeId, setActiveId] = useState<string | null>(null);
  const { data, isLoading, isFetching } = useGetAllShortsQuery({ page, limit: 10 });
  const [likeShort] = useLikeShortMutation();
  const [unlikeShort] = useUnlikeShortMutation();
  const [viewShort] = useViewShortMutation();

  const shorts: TShort[] = (data?.data as TShort[]) || [];
  const meta = data?.meta;

  const handleLike = async (short: TShort) => {
    const fn = short.likedByMe ? unlikeShort : likeShort;
    const res: any = await fn(short._id);

    if (res?.error) {
      toast.error(res?.error?.data?.message || 'Could not update like');
    }
  };

  const handleView = (id: string) => {
    viewShort(id);
  };

  return (
    <div className="w-full mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="min-w-0">
          <h1 className="text-lg sm:text-xl font-bold text-default-900 tracking-tight">
            Shorts
          </h1>
          <p className="text-xs text-default-500">
            Quick travel clips — tap to play, scroll for more
          </p>
        </div>
        <CreateShortModal />
      </div>

      {isLoading ? (
        <CardSkeleton count={2} />
      ) : shorts.length === 0 ? (
        <EmptyState
          icon={<FaPlus />}
          title="No shorts yet"
          description="Be the first to post a quick travel clip — under a minute, big impact."
          action={<CreateShortModal triggerLabel="Create the first short" />}
        />
      ) : (
        <div className="snap-y snap-mandatory overflow-y-auto max-h-[calc(100vh-8rem)] space-y-6 pb-8">
          {shorts.map((short) => (
            <ShortItem
              key={short._id}
              short={short}
              onLike={handleLike}
              onView={handleView}
              active={activeId === short._id}
              onActivate={() => setActiveId(short._id)}
            />
          ))}
          {meta && meta.totalPage > page && (
            <div className="flex justify-center pb-6 px-2">
              <CommunityButton
                variant="secondary"
                isLoading={isFetching}
                onPress={() => setPage((p) => p + 1)}
              >
                Load more shorts
              </CommunityButton>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
