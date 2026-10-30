"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause, Music, Heart } from "lucide-react";
import { IMusicTrack } from "@/src/types/music";
import { useAddToFavoritesMutation, useRemoveFromFavoritesMutation } from "@/src/redux/features/music/musicApi";
import { toast } from "sonner";

interface TrackCardProps {
  track: IMusicTrack;
  onSelect: (track: IMusicTrack) => void;
  isFavorite?: boolean;
}

const TrackCard = ({ track, onSelect, isFavorite = false }: TrackCardProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFav, setIsFav] = useState(isFavorite);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [addToFavorites] = useAddToFavoritesMutation();
  const [removeFromFavorites] = useRemoveFromFavoritesMutation();

  useEffect(() => {
    // Create audio element
    if (!track.previewUrl) {
      console.error("No preview URL for track:", track);
      return;
    }

    audioRef.current = new Audio(track.previewUrl);
    audioRef.current.volume = 0.5;

    // Add error handler
    audioRef.current.onerror = (e) => {
      console.error("Audio load error for track:", track.title, "URL:", track.previewUrl, e);
      toast.error("Failed to load audio preview");
      setIsPlaying(false);
    };

    // Cleanup
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [track.previewUrl, track]);

  const togglePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);

          // Auto-pause when preview ends
          audioRef.current!.onended = () => {
            setIsPlaying(false);
          };
        })
        .catch((error) => {
          console.error("Audio playback error:", error);
          toast.error("Failed to play audio");
          setIsPlaying(false);
        });
    }
  };

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      if (isFav) {
        await removeFromFavorites(track._id).unwrap();
        setIsFav(false);
        toast.success("Removed from favorites");
      } else {
        await addToFavorites(track._id).unwrap();
        setIsFav(true);
        toast.success("Added to favorites");
      }
    } catch (error) {
      toast.error("Failed to update favorites");
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div
      onClick={() => onSelect(track)}
      className='
        group flex items-center gap-4 p-3 rounded-xl
        hover:bg-sage-50 dark:hover:bg-sage-900/20
        border border-transparent hover:border-sage-200 dark:hover:border-sage-800
        transition-all duration-200 cursor-pointer
      '
    >
      {/* Album Art */}
      <div className='relative flex-shrink-0'>
        <div
          className='
            w-16 h-16 rounded-lg overflow-hidden
            bg-gradient-to-br from-sage-400 to-sage-600
            flex items-center justify-center
          '
        >
          {track.artworkUrl ? (
            <img src={track.artworkUrl} alt={track.title} className='w-full h-full object-cover' />
          ) : (
            <Music className='w-6 h-6 text-white' />
          )}
        </div>

        {/* Play/Pause Overlay */}
        <button
          onClick={togglePlayPause}
          className='
            absolute inset-0 bg-black/40 rounded-lg
            flex items-center justify-center
            opacity-0 group-hover:opacity-100
            transition-opacity duration-200
          '
        >
          {isPlaying ? <Pause className='w-6 h-6 text-white fill-white' /> : <Play className='w-6 h-6 text-white fill-white' />}
        </button>
      </div>

      {/* Track Info */}
      <div className='flex-1 min-w-0'>
        <h4 className='text-sm font-semibold text-textPrimary truncate'>{track.title}</h4>
        <p className='text-xs text-textSecondary truncate'>
          {track.artist}
          {track.album && ` • ${track.album}`}
        </p>
        <div className='flex items-center gap-2 mt-1'>
          <span className='text-xs text-textTertiary'>{formatDuration(track.duration)}</span>
          {track.genre && (
            <>
              <span className='text-textTertiary'>•</span>
              <span className='text-xs text-textTertiary capitalize'>{track.genre.toLowerCase().replace("_", " ")}</span>
            </>
          )}
        </div>
      </div>

      {/* Favorite Button */}
      <button
        onClick={toggleFavorite}
        className='
          flex-shrink-0 p-2 rounded-full
          hover:bg-sage-100 dark:hover:bg-sage-800/60
          transition-colors duration-200
        '
      >
        <Heart className={`w-5 h-5 transition-colors ${isFav ? "fill-red-500 text-red-500" : "text-textSecondary hover:text-red-500"}`} />
      </button>
    </div>
  );
};

export default TrackCard;
