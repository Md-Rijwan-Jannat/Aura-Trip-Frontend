import { baseApi } from "../../api/baseApi";

export const NotificationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query({
      query: (args) => {
        const params = new URLSearchParams();

        if (args) {
          Object.entries(args).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== "") {
              params.append(key, value as string);
            }
          });
        }

        return { url: "/notifications", method: "GET", params };
      },
      providesTags: ["notifications"],
    }),

    getUnreadNotificationCount: builder.query({
      query: () => ({ url: "/notifications/unread-count", method: "GET" }),
      providesTags: ["notifications"],
    }),

    markAllNotificationsRead: builder.mutation({
      query: () => ({ url: "/notifications/read-all", method: "PATCH" }),
      invalidatesTags: ["notifications"],
    }),

    markNotificationRead: builder.mutation({
      query: (id) => ({ url: `/notifications/${id}/read`, method: "PATCH" }),
      invalidatesTags: ["notifications"],
    }),

    deleteNotification: builder.mutation({
      query: (id) => ({ url: `/notifications/${id}`, method: "DELETE" }),
      invalidatesTags: ["notifications"],
    }),

    getNotificationPreferences: builder.query({
      query: () => ({ url: "/notifications/preferences", method: "GET" }),
      providesTags: ["notifications"],
    }),

    updateNotificationPreferences: builder.mutation({
      query: (categories: Record<string, boolean>) => ({
        url: "/notifications/preferences",
        method: "PATCH",
        body: { categories },
      }),
      invalidatesTags: ["notifications"],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useGetUnreadNotificationCountQuery,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
  useDeleteNotificationMutation,
  useGetNotificationPreferencesQuery,
  useUpdateNotificationPreferencesMutation,
} = NotificationApi;
