import { baseApi } from "../../api/baseApi";

export const CallApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Paginated call history for one chat (invites happen over Socket.IO)
    getCallHistory: builder.query({
      query: ({ chatId, page = 1, limit = 20 }) => ({
        url: `/calls/chat/${chatId}`,
        method: "GET",
        params: { page, limit },
      }),
      providesTags: ["chats"],
    }),
  }),
});

export const { useGetCallHistoryQuery } = CallApi;
