'use client';

// Bubble card for LIVE_LOCATION messages: live countdown, embedded map that
// follows position patches, and an early "Stop" control for the sharer.

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@nextui-org/button';
import { MapPin, Navigation, Square } from 'lucide-react';
import { TMessage } from '@/src/types';

const LiveLocationMap = dynamic(() => import('./liveLocationMap'), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-default-200" />,
});

const formatRemaining = (ms: number) => {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;

  return `${minutes}:${String(seconds).padStart(2, '0')}`;
};

interface LiveLocationCardProps {
  message: TMessage;
  isMine: boolean;
  /** Present only for the sharer while the session is live. */
  onStop?: (messageId: string) => void;
}

const LiveLocationCard: React.FC<LiveLocationCardProps> = ({
  message,
  isMine,
  onStop,
}) => {
  const expiresAtMs = message.liveLocation
    ? new Date(message.liveLocation.expiresAt).getTime()
    : 0;
  const [now, setNow] = useState(() => Date.now());
  const remaining = expiresAtMs - now;
  const isActive = remaining > 0;
  const loc = message.location;

  // Tick once per second only while the share is live.
  useEffect(() => {
    if (!isActive) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);

    return () => clearInterval(timer);
  }, [isActive, expiresAtMs]);

  if (!loc) {
    return (
      <p className="max-w-xs px-4 py-2 text-xs rounded-lg bg-default-200">
        Live location unavailable
      </p>
    );
  }

  return (
    <div className="w-60 overflow-hidden rounded-lg border border-default-200 bg-default-100">
      <div className="relative h-32">
        <LiveLocationMap
          lat={loc.lat}
          lng={loc.lng}
          label={loc.label ?? 'Shared live location'}
        />
        <span className="absolute top-1.5 left-1.5 z-[1000] flex items-center gap-1.5 rounded-full bg-black/65 px-2 py-0.5 text-[10px] font-medium text-white">
          {isActive ? (
            <>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live · {formatRemaining(remaining)} left
            </>
          ) : (
            <>
              <MapPin className="h-3 w-3" />
              Location share ended
            </>
          )}
        </span>
      </div>
      <div className="flex items-center justify-between gap-2 px-2 py-1.5">
        <a
          href={`https://www.google.com/maps?q=${loc.lat},${loc.lng}`}
          target="_blank"
          rel="noreferrer"
          className="flex min-w-0 items-center gap-1 text-[11px] text-sage-600 dark:text-sage-400 hover:underline"
        >
          <Navigation className="h-3 w-3 shrink-0" />
          <span className="truncate">{loc.label || 'Open in Maps'}</span>
        </a>
        {isMine && isActive && onStop && (
          <Button
            size="sm"
            variant="flat"
            className="h-6 min-w-0 shrink-0 px-2 text-[11px]"
            startContent={<Square className="h-3 w-3" />}
            onPress={() => onStop(message._id)}
          >
            Stop
          </Button>
        )}
      </div>
    </div>
  );
};

export default LiveLocationCard;
