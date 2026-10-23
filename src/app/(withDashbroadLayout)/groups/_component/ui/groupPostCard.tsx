'use client';

import React from 'react';
import Link from 'next/link';
import { Avatar } from '@nextui-org/avatar';
import { Badge } from '@/src/components/ui/communityKit';
import { TPost } from '@/src/types';

interface GroupPostCardProps {
  post: TPost & {
    moderationStatus?: string;
    group?: string | null;
    location?: string | null;
  };
  staffActions?: React.ReactNode;
}

export default function GroupPostCard({ post, staffActions }: GroupPostCardProps) {
  const author = post.user as unknown as {
    _id?: string;
    name?: string;
    image?: string;
    verified?: boolean;
  };
  const status = post.moderationStatus;
  const showStatus = status && status !== 'APPROVED';

  return (
    <article className="rounded-2xl bg-surface border border-borderSubtle shadow-[0_1px_2px_rgba(31,78,61,0.04),0_8px_24px_-12px_rgba(31,78,61,0.12)] overflow-hidden">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3 px-4 sm:px-5 pt-4 pb-3">
        <Avatar
          as={Link}
          href={`/profile/${author?._id}`}
          radius="full"
          name={author?.name?.charAt(0)?.toUpperCase()}
          src={author?.image || undefined}
          className="w-11 h-11 flex-shrink-0"
        />
        <div className="flex-1 basis-40 min-w-0">
          <Link
            href={`/profile/${author?._id}`}
            className="text-sm font-bold text-default-900 hover:underline"
          >
            {author?.name || 'Traveler'}
          </Link>
          <p className="text-xs text-default-400">
            {new Date(post.createdAt).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
            {post.location ? ` · 📍 ${post.location}` : ''}
          </p>
        </div>
        {showStatus && (
          <Badge
            color={
              status === 'PENDING' ? 'PENDING' : status === 'REJECTED' ? 'REJECTED' : 'REMOVED'
            }
          >
            {status}
          </Badge>
        )}
        {staffActions}
      </div>

      {/* Content */}
      <div className="px-4 sm:px-5 pb-4 min-w-0">
        <h3 className="font-bold text-default-900 text-[15px] leading-snug break-words">
          {post.title}
        </h3>
        <p className="text-sm text-default-600 whitespace-pre-wrap break-words mt-1.5 line-clamp-6">
          {post.description}
        </p>
      </div>

      {/* Images */}
      {Array.isArray(post.images) && post.images.length > 0 && (
        <div
          className={`grid gap-1 ${
            post.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
          }`}
        >
          {post.images.slice(0, 4).map((img) => (
            <div
              key={img}
              className={`relative overflow-hidden bg-default-100 ${
                post.images.length === 1
                  ? 'max-h-[300px] sm:max-h-[420px] w-full'
                  : 'aspect-square'
              }`}
            >
              <img
                src={img}
                alt={post.title}
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-[1.02]"
              />
            </div>
          ))}
        </div>
      )}
    </article>
  );
}
