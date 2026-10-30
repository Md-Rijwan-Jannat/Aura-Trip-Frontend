"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@nextui-org/button";
import { Slider } from "@nextui-org/slider";
import { ChevronLeft, Play, Pause, Volume2, Music } from "lucide-react";
import { IMusicTrack, MusicSelection, ContentType, MUSIC_DURATION_LIMITS } from "@/src/types/music";

interface MusicEditorProps {
  track: IMusicTrack;
  contentType: ContentType;
  maxDuration: number;
  initialSelection?: MusicSelection | null;
  onConfirm: (selection: MusicSelection) => void;
  onBack: () => void;
  onCancel: () => void;
}

const MusicEditor = ({ track, contentType, maxDuration, initialSelection, onConfirm, onBack, onCancel }: MusicEditorProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [startTime, setStartTime] = useState(initialSelection?.startTime || 0);
  const [endTime, setEndTime] = useState(initialSelection?.endTime || Math.min(maxDuration, track.duration));
  const [volume, setVolume] = useState((initialSelection?.volume || 0.7) * 100);
  const [fadeIn, setFadeIn] = useState(initialSelection?.fadeIn || false);
  const [fadeOut, setFadeOut] = useState(initialSelection?.fadeOut || false);
  const [isDragging, setIsDragging] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animationRef = useRef<number>();
  const volumeDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const timeRangeDebounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    audioRef.current = new Audio(track.previewUrl);
    audioRef.current.volume = volume / 100;
    audioRef.current.currentTime = startTime;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (volumeDebounceRef.current) {
        clearTimeout(volumeDebounceRef.current);
      }
      if (timeRangeDebounceRef.current) {
        clearTimeout(timeRangeDebounceRef.current);
      }
    };
  }, [track.previewUrl, startTime, volume]);

  const updateTime = () => {
    if (audioRef.current) {
      const time = audioRef.current.currentTime;

      setCurrentTime(time);

      // Stop at end time
      if (time >= endTime) {
        audioRef.current.pause();
        audioRef.current.currentTime = startTime;
        setIsPlaying(false);
        setCurrentTime(startTime);

        return;
      }
    }

    if (isPlaying) {
      animationRef.current = requestAnimationFrame(updateTime);
    }
  };

  const togglePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    } else {
      // Reset to start if at end
      if (currentTime >= endTime || currentTime < startTime) {
        audioRef.current.currentTime = startTime;
        setCurrentTime(startTime);
      }
      audioRef.current.play();
      setIsPlaying(true);
      updateTime();
    }
  };

  const handleVolumeChange = (value: number | number[]) => {
    const newVolume = Array.isArray(value) ? value[0] : value;
    setVolume(newVolume);

    // Debounce audio volume update for smoother UX
    if (volumeDebounceRef.current) {
      clearTimeout(volumeDebounceRef.current);
    }

    volumeDebounceRef.current = setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.volume = newVolume / 100;
      }
    }, 50);
  };

  const handleTimeRangeChange = (value: number | number[]) => {
    if (Array.isArray(value)) {
      const [start, end] = value;

      setStartTime(start);
      setEndTime(end);
      setIsDragging(true);

      // Debounce audio seek for smoother dragging
      if (timeRangeDebounceRef.current) {
        clearTimeout(timeRangeDebounceRef.current);
      }

      timeRangeDebounceRef.current = setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.currentTime = start;
          setCurrentTime(start);
        }
        setIsDragging(false);
      }, 100);
    }
  };

  const handleConfirm = () => {
    const selection: MusicSelection = {
      track,
      startTime,
      endTime,
      volume: volume / 100,
      fadeIn,
      fadeOut,
    };

    onConfirm(selection);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);

    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const segmentDuration = endTime - startTime;
  const limits = MUSIC_DURATION_LIMITS[contentType];

  return (
    <div className='flex flex-col h-full'>
      {/* Header */}
      <div className='flex items-center gap-3 p-6 border-b border-borderSubtle'>
        <Button isIconOnly size='sm' variant='light' onPress={onBack}>
          <ChevronLeft className='w-5 h-5' />
        </Button>
        <div className='flex-1'>
          <h3 className='text-base font-semibold text-textPrimary'>{track.title}</h3>
          <p className='text-sm text-textSecondary'>{track.artist}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className='flex-1 overflow-y-auto p-6 space-y-6'>
        {/* Album Art & Playback */}
        <div className='flex flex-col items-center'>
          <div
            className='
              w-48 h-48 rounded-2xl overflow-hidden
              bg-gradient-to-br from-sage-400 to-sage-600
              flex items-center justify-center mb-4
            '
          >
            {track.artworkUrl ? (
              <img src={track.artworkUrl} alt={track.title} className='w-full h-full object-cover' />
            ) : (
              <Music className='w-16 h-16 text-white' />
            )}
          </div>

          {/* Play/Pause Button */}
          <Button isIconOnly size='lg' className='bg-sage-600 text-white hover:bg-sage-700' onPress={togglePlayPause}>
            {isPlaying ? <Pause className='w-6 h-6 fill-white' /> : <Play className='w-6 h-6 fill-white' />}
          </Button>
        </div>

        {/* Timeline Selector */}
        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <span className='text-sm font-medium'>Select Music Segment</span>
            <span className='text-xs text-textSecondary'>{formatTime(segmentDuration)} selected</span>
          </div>

          {/* Waveform / Timeline */}
          <div className='relative'>
            <div className='h-24 bg-sage-100 dark:bg-sage-900/20 rounded-lg relative overflow-hidden'>
              {/* Simplified waveform visualization */}
              <div className='absolute inset-0 flex items-center justify-center gap-1 px-2'>
                {Array.from({ length: 50 }).map((_, i) => {
                  const height = Math.random() * 60 + 20;
                  const position = (i / 50) * track.duration;
                  const isInRange = position >= startTime && position <= endTime;

                  return (
                    <div
                      key={i}
                      style={{ height: `${height}%` }}
                      className={`
                        flex-1 rounded-full transition-colors
                        ${isInRange ? "bg-sage-600 dark:bg-sage-500" : "bg-sage-300 dark:bg-sage-700"}
                      `}
                    />
                  );
                })}
              </div>

              {/* Current time indicator */}
              {isPlaying && (
                <div
                  className='absolute top-0 bottom-0 w-0.5 bg-white shadow-lg'
                  style={{
                    left: `${((currentTime - startTime) / (endTime - startTime)) * 100}%`,
                  }}
                />
              )}
            </div>

            {/* Range Slider */}
            <div className='mt-4'>
              <Slider
                label='Music Range'
                step={1}
                minValue={0}
                maxValue={track.duration}
                value={[startTime, endTime]}
                onChange={handleTimeRangeChange}
                className='max-w-full'
                classNames={{
                  track: "bg-sage-200 dark:bg-sage-800",
                  filler: "bg-sage-600 dark:bg-sage-500",
                }}
              />
              <div className='flex justify-between mt-2 text-xs text-textSecondary'>
                <span>{formatTime(startTime)}</span>
                <span>{formatTime(endTime)}</span>
              </div>
            </div>
          </div>

          {/* Duration Validation */}
          {(segmentDuration < limits.min || segmentDuration > limits.max) && (
            <div className='p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg'>
              <p className='text-sm text-red-600 dark:text-red-400'>
                {contentType === "story"
                  ? `Stories require music between ${limits.min}-${limits.max} seconds`
                  : contentType === "short"
                    ? `Shorts require music between ${limits.min}-${limits.max} seconds`
                    : `Music must be between ${limits.min}-${limits.max} seconds`}
              </p>
            </div>
          )}
        </div>

        {/* Volume Control */}
        <div className='space-y-3'>
          <div className='flex items-center gap-2'>
            <Volume2 className='w-4 h-4 text-textSecondary' />
            <span className='text-sm font-medium'>Volume</span>
          </div>
          <Slider
            size='sm'
            step={1}
            minValue={0}
            maxValue={100}
            value={volume}
            onChange={handleVolumeChange}
            className='max-w-full'
            classNames={{
              track: "bg-sage-200 dark:bg-sage-800",
              filler: "bg-sage-600 dark:bg-sage-500",
            }}
          />
        </div>

        {/* Fade Options */}
        {(contentType === "story" || contentType === "short") && (
          <div className='space-y-3'>
            <span className='text-sm font-medium'>Fade Effects</span>
            <div className='flex gap-4'>
              <label className='flex items-center gap-2 cursor-pointer'>
                <input
                  type='checkbox'
                  checked={fadeIn}
                  onChange={(e) => setFadeIn(e.target.checked)}
                  className='w-4 h-4 text-sage-600 rounded'
                />
                <span className='text-sm'>Fade In</span>
              </label>
              <label className='flex items-center gap-2 cursor-pointer'>
                <input
                  type='checkbox'
                  checked={fadeOut}
                  onChange={(e) => setFadeOut(e.target.checked)}
                  className='w-4 h-4 text-sage-600 rounded'
                />
                <span className='text-sm'>Fade Out</span>
              </label>
            </div>
          </div>
        )}

        {/* License Info */}
        {track.attributionRequired && (
          <div className='p-3 bg-sage-50 dark:bg-sage-900/20 border border-sage-200 dark:border-sage-800 rounded-lg'>
            <p className='text-xs text-textSecondary'>
              <span className='font-medium'>Attribution:</span> {track.attributionText}
            </p>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className='p-6 border-t border-borderSubtle flex gap-3'>
        <Button variant='bordered' onPress={onCancel} className='flex-1'>
          Cancel
        </Button>
        <Button
          className='flex-1 bg-sage-600 text-white hover:bg-sage-700'
          onPress={handleConfirm}
          isDisabled={segmentDuration < limits.min || segmentDuration > limits.max}
        >
          Confirm Music
        </Button>
      </div>
    </div>
  );
};

export default MusicEditor;
