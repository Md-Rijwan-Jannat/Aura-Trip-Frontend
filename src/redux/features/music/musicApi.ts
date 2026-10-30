import { baseApi } from "../../api/baseApi";
import { IMusicTrack, IMusicAttachment, IMusicSearchQuery, IMusicSearchResult, ContentType } from "@/src/types/music";

export const musicApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Search/browse music
    searchTracks: builder.query<IMusicSearchResult, IMusicSearchQuery>({
      query: (params) => ({
        url: "/music/search",
        method: "GET",
        params: {
          ...params,
          _t: Date.now(), // Cache buster - force unique requests
        },
      }),
      // Don't cache search results - always fetch fresh
      keepUnusedDataFor: 0,
      transformResponse: (response: any) => {
        console.log("🎵 Music API transformResponse:", response);
        // Backend returns: { success, message, meta: { total, hasMore, limit, offset }, data: tracks[] }
        return {
          tracks: response.data || [],
          total: response.meta?.total || 0,
          hasMore: response.meta?.hasMore || false,
        };
      },
    }),

    // Get trending tracks
    getTrendingTracks: builder.query<IMusicTrack[], { limit?: number; provider?: string }>({
      query: (params) => ({
        url: "/music/trending",
        method: "GET",
        params: {
          ...params,
          _t: Date.now(), // Cache buster
        },
      }),
      keepUnusedDataFor: 0, // Don't cache - always fetch fresh
      transformResponse: (response: any) => {
        console.log("🔥 Trending API response:", response);
        return response.data || [];
      },
    }),

    // Get tracks by genre
    getTracksByGenre: builder.query<IMusicTrack[], { genre: string; limit?: number; provider?: string }>({
      query: ({ genre, ...params }) => ({
        url: `/music/genre/${genre}`,
        method: "GET",
        params,
      }),
      providesTags: ["Music"],
      transformResponse: (response: any) => response.data || [],
    }),

    // Get tracks by mood
    getTracksByMood: builder.query<IMusicTrack[], { mood: string; limit?: number; provider?: string }>({
      query: ({ mood, ...params }) => ({
        url: `/music/mood/${mood}`,
        method: "GET",
        params,
      }),
      providesTags: ["Music"],
      transformResponse: (response: any) => response.data || [],
    }),

    // Get single track
    getTrackById: builder.query<IMusicTrack, string>({
      query: (id) => ({
        url: `/music/tracks/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: "Music", id }],
      transformResponse: (response: any) => response.data,
    }),

    // Attach music to content
    attachMusic: builder.mutation<
      IMusicAttachment,
      {
        trackId: string;
        contentType: ContentType;
        contentId: string;
        startTime: number;
        endTime: number;
        volume?: number;
        fadeIn?: boolean;
        fadeOut?: boolean;
      }
    >({
      query: (data) => ({
        url: "/music/attach",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Music"],
      transformResponse: (response: any) => response.data,
    }),

    // Get music for content
    getMusicForContent: builder.query<IMusicAttachment | null, { contentType: ContentType; contentId: string }>({
      query: ({ contentType, contentId }) => ({
        url: `/music/content/${contentType}/${contentId}`,
        method: "GET",
      }),
      providesTags: (_result, _error, { contentType, contentId }) => [{ type: "Music", id: `${contentType}-${contentId}` }],
      transformResponse: (response: any) => response.data,
    }),

    // Remove music from content
    removeMusicFromContent: builder.mutation<void, { contentType: ContentType; contentId: string }>({
      query: ({ contentType, contentId }) => ({
        url: `/music/content/${contentType}/${contentId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, { contentType, contentId }) => [{ type: "Music", id: `${contentType}-${contentId}` }],
    }),

    // Get user favorites
    getUserFavorites: builder.query<IMusicTrack[], void>({
      query: () => ({
        url: "/music/favorites",
        method: "GET",
      }),
      providesTags: ["Music"],
      transformResponse: (response: any) => response.data || [],
    }),

    // Add to favorites
    addToFavorites: builder.mutation<void, string>({
      query: (trackId) => ({
        url: `/music/favorites/${trackId}`,
        method: "POST",
      }),
      invalidatesTags: ["Music"],
    }),

    // Remove from favorites
    removeFromFavorites: builder.mutation<void, string>({
      query: (trackId) => ({
        url: `/music/favorites/${trackId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Music"],
    }),

    // Get recently played
    getRecentlyPlayed: builder.query<IMusicTrack[], void>({
      query: () => ({
        url: "/music/recently-played",
        method: "GET",
      }),
      providesTags: ["Music"],
      transformResponse: (response: any) => response.data || [],
    }),
  }),
});

export const {
  useSearchTracksQuery,
  useLazySearchTracksQuery,
  useGetTrendingTracksQuery,
  useGetTracksByGenreQuery,
  useGetTracksByMoodQuery,
  useGetTrackByIdQuery,
  useAttachMusicMutation,
  useGetMusicForContentQuery,
  useRemoveMusicFromContentMutation,
  useGetUserFavoritesQuery,
  useAddToFavoritesMutation,
  useRemoveFromFavoritesMutation,
  useGetRecentlyPlayedQuery,
} = musicApi;
