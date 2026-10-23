import { baseApi } from '../../api/baseApi';

const ChatsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Create a chat
    createChat: builder.mutation({
      query: (data) => ({
        url: `/chats`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['chats', 'messages'],
    }),
    getUserChat: builder.query({
      query: () => ({
        url: `/chats`,
        method: 'GET',
      }),
      providesTags: ['chats', 'messages'],
    }),
    getSingleChat: builder.query({
      query: (chatId) => ({
        url: `/chats/${chatId}`,
        method: 'GET',
      }),
      providesTags: ['chats', 'messages'],
    }),
    // Add an existing user to a group chat (group-only, server-enforced).
    addToGroup: builder.mutation({
      query: (data: { chatId: string; userId: string }) => ({
        url: `/chats/group-add`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['chats'],
    }),
  }),
});

export const {
  useCreateChatMutation,
  useGetUserChatQuery,
  useGetSingleChatQuery,
  useAddToGroupMutation,
} = ChatsApi;
