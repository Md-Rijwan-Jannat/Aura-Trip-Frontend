"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@nextui-org/input";
import { Tabs, Tab } from "@nextui-org/tabs";
import { Search, TrendingUp, Music2, Heart, Clock } from "lucide-react";
import { IMusicTrack, MusicGenre, MusicMood, GENRE_LABELS, MOOD_LABELS, ContentType } from "@/src/types/music";
import {
  useLazySearchTracksQuery,
  useGetTrendingTracksQuery,
  useGetUserFavoritesQuery,
  useGetRecentlyPlayedQuery,
} from "@/src/redux/features/music/musicApi";
import { useAppSelector } from "@/src/redux/hook";
import { isAuthenticated } from "@/src/redux/features/auth/authSlice";
import GenreGrid from "./GenreGrid";
import MoodGrid from "./MoodGrid";
import TrackCard from "./TrackCard";

interface MusicLibraryProps {
  contentType: ContentType;
  onTrackSelect: (track: IMusicTrack) => void;
  onClose: () => void;
}

const MusicLibrary = ({ contentType, onTrackSelect, onClose }: MusicLibraryProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState("trending");
  const [selectedGenre, setSelectedGenre] = useState<MusicGenre | null>(null);
  const [selectedMood, setSelectedMood] = useState<MusicMood | null>(null);
  const [isDebouncing, setIsDebouncing] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Check if user is authenticated
  const isUserAuthenticated = useAppSelector(isAuthenticated);

  // Queries
  const [searchTracks, { data: searchResults, isLoading: isSearching, isFetching: isSearchFetching }] = useLazySearchTracksQuery();
  const { data: trendingTracks, isLoading: isLoadingTrending, refetch: refetchTrending } = useGetTrendingTracksQuery({ limit: 20 });
  const { data: favoriteTracks, isLoading: isLoadingFavorites } = useGetUserFavoritesQuery(undefined, {
    skip: !isUserAuthenticated,
  });
  const { data: recentTracks, isLoading: isLoadingRecent } = useGetRecentlyPlayedQuery(undefined, {
    skip: !isUserAuthenticated,
  });

  // Force refetch trending tracks when component mounts
  useEffect(() => {
    refetchTrending();
  }, [refetchTrending]);

  // Debounce search input with visual feedback
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Show debouncing indicator immediately
    if (searchQuery.trim() && searchQuery !== debouncedQuery) {
      setIsDebouncing(true);
    }

    debounceTimerRef.current = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setIsDebouncing(false);
    }, 500); // Increased to 500ms for better performance

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchQuery, debouncedQuery]);

  // Trigger search when debounced query changes
  useEffect(() => {
    if (debouncedQuery.trim()) {
      // Clear genre/mood filters when doing text search
      setSelectedGenre(null);
      setSelectedMood(null);
      console.log("🔍 Searching for:", debouncedQuery);
      searchTracks({ query: debouncedQuery, limit: 20 }, true); // true forces refetch
      setSelectedTab("search");
    }
  }, [debouncedQuery, searchTracks]);

  // Log search results when they change
  useEffect(() => {
    if (searchResults) {
      console.log("✅ Search results received:", searchResults);
    }
  }, [searchResults]);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    // If search is cleared, go back to trending
    if (!value.trim()) {
      setSelectedTab("trending");
    }
  };

  const handleGenreSelect = (genre: MusicGenre) => {
    console.log("🎵 Genre selected:", genre);
    setSelectedGenre(genre);
    setSelectedMood(null); // Clear mood when selecting genre
    setSearchQuery(""); // Clear text search
    setDebouncedQuery(""); // Clear debounced query
    // Force refetch with preferCacheValue: false
    searchTracks({ genre, limit: 20 }, true); // true forces refetch
    setSelectedTab("search");
  };

  const handleMoodSelect = (mood: MusicMood) => {
    console.log("😊 Mood selected:", mood);
    setSelectedMood(mood);
    setSelectedGenre(null); // Clear genre when selecting mood
    setSearchQuery(""); // Clear text search
    setDebouncedQuery(""); // Clear debounced query
    // Force refetch with preferCacheValue: false
    searchTracks({ mood, limit: 20 }, true); // true forces refetch
    setSelectedTab("search");
  };

  const handleTrackClick = (track: IMusicTrack) => {
    onTrackSelect(track);
  };

  // Determine which tracks to display
  const getDisplayTracks = () => {
    console.log("📊 Getting display tracks for tab:", selectedTab);
    console.log("Search results:", searchResults?.tracks?.length || 0);
    console.log("Trending tracks:", trendingTracks?.length || 0);

    switch (selectedTab) {
      case "search":
        const tracks = searchResults?.tracks || [];
        console.log("Displaying search results:", tracks.length);
        return tracks;
      case "trending":
        console.log("Displaying trending tracks:", trendingTracks?.length || 0);
        return trendingTracks || [];
      case "favorites":
        return favoriteTracks || [];
      case "recent":
        return recentTracks || [];
      case "genres":
        return [];
      case "moods":
        return [];
      default:
        return trendingTracks || [];
    }
  };

  const displayTracks = getDisplayTracks();
  const isLoading = isSearching || isSearchFetching || isLoadingTrending || isLoadingFavorites || isLoadingRecent || isDebouncing;

  return (
    <div className='flex flex-col h-[calc(90vh-80px)]'>
      {/* Search Bar */}
      <div className='p-6 border-b border-borderSubtle'>
        <Input
          placeholder='Search songs, artists, or albums...'
          value={searchQuery}
          onValueChange={handleSearch}
          startContent={<Search className='w-4 h-4 text-textSecondary' />}
          endContent={
            isDebouncing ? <div className='animate-spin rounded-full h-4 w-4 border-2 border-sage-600 border-t-transparent' /> : null
          }
          variant='bordered'
          classNames={{
            input: "text-sm",
          }}
        />
      </div>

      {/* Tabs */}
      <div className='border-b border-borderSubtle px-6'>
        <Tabs
          selectedKey={selectedTab}
          onSelectionChange={(key) => setSelectedTab(key as string)}
          variant='underlined'
          classNames={{
            tabList: "gap-6",
            cursor: "bg-sage-600 dark:bg-sage-500",
            tab: "px-0",
          }}
        >
          <Tab
            key='trending'
            title={
              <div className='flex items-center gap-2'>
                <TrendingUp className='w-4 h-4' />
                <span>Trending</span>
              </div>
            }
          />
          <Tab
            key='genres'
            title={
              <div className='flex items-center gap-2'>
                <Music2 className='w-4 h-4' />
                <span>Genres</span>
              </div>
            }
          />
          <Tab
            key='moods'
            title={
              <div className='flex items-center gap-2'>
                <Heart className='w-4 h-4' />
                <span>Moods</span>
              </div>
            }
          />
          <Tab
            key='favorites'
            title={
              <div className='flex items-center gap-2'>
                <Heart className='w-4 h-4' />
                <span>Favorites</span>
              </div>
            }
          />
          <Tab
            key='recent'
            title={
              <div className='flex items-center gap-2'>
                <Clock className='w-4 h-4' />
                <span>Recent</span>
              </div>
            }
          />
        </Tabs>
      </div>

      {/* Content Area */}
      <div className='flex-1 overflow-y-auto p-6'>
        {/* Genre Grid */}
        {selectedTab === "genres" && <GenreGrid onGenreSelect={handleGenreSelect} selectedGenre={selectedGenre} />}

        {/* Mood Grid */}
        {selectedTab === "moods" && <MoodGrid onMoodSelect={handleMoodSelect} selectedMood={selectedMood} />}

        {/* Track List */}
        {selectedTab !== "genres" && selectedTab !== "moods" && (
          <div>
            {/* Active Filter Indicator */}
            {(selectedGenre || selectedMood) && selectedTab === "search" && (
              <div className='mb-4 flex items-center gap-2'>
                <span className='text-sm text-textSecondary'>Filtered by:</span>
                {selectedGenre && (
                  <span className='px-3 py-1 rounded-full bg-sage-100 dark:bg-sage-900/40 text-sage-700 dark:text-sage-300 text-xs font-medium'>
                    {GENRE_LABELS[selectedGenre]}
                  </span>
                )}
                {selectedMood && (
                  <span className='px-3 py-1 rounded-full bg-sage-100 dark:bg-sage-900/40 text-sage-700 dark:text-sage-300 text-xs font-medium'>
                    {MOOD_LABELS[selectedMood]}
                  </span>
                )}
                <button
                  onClick={() => {
                    setSelectedGenre(null);
                    setSelectedMood(null);
                    setSearchQuery(""); // Also clear search query
                    setDebouncedQuery(""); // Clear debounced query
                    setSelectedTab("trending");
                  }}
                  className='text-xs text-sage-600 dark:text-sage-400 hover:underline'
                >
                  Clear filter
                </button>
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className='flex flex-col items-center justify-center py-12'>
                <div className='animate-spin rounded-full h-8 w-8 border-2 border-sage-600 border-t-transparent' />
                <p className='text-sm text-textSecondary mt-3'>{isDebouncing ? "Searching..." : "Loading tracks..."}</p>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && displayTracks.length === 0 && (
              <div className='flex flex-col items-center justify-center py-12 text-center'>
                <Music2 className='w-12 h-12 text-textSecondary mb-3' />
                <p className='text-sm text-textSecondary'>
                  {selectedTab === "favorites"
                    ? isUserAuthenticated
                      ? "No favorite tracks yet"
                      : "Please log in to view your favorite tracks"
                    : selectedTab === "recent"
                      ? isUserAuthenticated
                        ? "No recently played tracks"
                        : "Please log in to view your recently played tracks"
                      : "No tracks found"}
                </p>
              </div>
            )}

            {/* Track Grid */}
            {!isLoading && displayTracks.length > 0 && (
              <div className='grid grid-cols-1 gap-3'>
                {displayTracks.map((track) => (
                  <TrackCard key={track._id} track={track} onSelect={handleTrackClick} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MusicLibrary;
