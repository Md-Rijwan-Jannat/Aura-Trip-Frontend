import { baseApi } from '../../api/baseApi';

export const ShortApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllShorts: builder.query({
      query: (args) => {
        const params = new URLSearchParams();

        if (args) {
          Object.entries(args).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
              params.append(key, value as string);
            }
          });
        }

        return { url: '/shorts', method: 'GET', params };
      },
      providesTags: ['shorts'],
    }),

    createShort: builder.mutation({
      query: (data) => ({ url: '/shorts', method: 'POST', body: data }),
      invalidatesTags: ['shorts'],
    }),

    getSingleShort: builder.query({
      query: (shortId) => ({ url: `/shorts/${shortId}`, method: 'GET' }),
      providesTags: ['shorts'],
    }),

    updateShort: builder.mutation({
      query: ({ shortId, data }) => ({
        url: `/shorts/${shortId}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['shorts'],
    }),

    deleteShort: builder.mutation({
      query: (shortId) => ({ url: `/shorts/${shortId}`, method: 'DELETE' }),
      invalidatesTags: ['shorts'],
    }),

    viewShort: builder.mutation({
      query: (shortId) => ({ url: `/shorts/${shortId}/view`, method: 'POST' }),
      invalidatesTags: ['shorts'],
    }),

    likeShort: builder.mutation({
      query: (shortId) => ({ url: `/shorts/${shortId}/like`, method: 'POST' }),
      invalidatesTags: ['shorts'],
    }),

    unlikeShort: builder.mutation({
      query: (shortId) => ({
        url: `/shorts/${shortId}/like`,
        method: 'DELETE',
      }),
      invalidatesTags: ['shorts'],
    }),

    reportShort: builder.mutation({
      query: ({ shortId, reason }) => ({
        url: `/shorts/${shortId}/report`,
        method: 'POST',
        body: { reason },
      }),
      invalidatesTags: ['shorts'],
    }),
  }),
});

export const {
  useGetAllShortsQuery,
  useCreateShortMutation,
  useGetSingleShortQuery,
  useUpdateShortMutation,
  useDeleteShortMutation,
  useViewShortMutation,
  useLikeShortMutation,
  useUnlikeShortMutation,
  useReportShortMutation,
} = ShortApi;
