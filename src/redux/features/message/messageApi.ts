import { baseApi } from '../../api/baseApi';

const MessagesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Create a typed message (TEXT / IMAGE / VOICE / LOCATION / EMOJI /
    // VIEW_ONCE_IMAGE — the body is passed through to the backend).
    createMessage: builder.mutation({
      query: (data) => ({
        url: `/messages`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['chats', 'messages'],
    }),
    getUserMessages: builder.query({
      query: (chatId) => ({
        url: `/messages/${chatId}`,
        method: 'GET',
      }),
      providesTags: ['chats', 'messages'],
    }),
    // Edit a message (sender-only: text/caption or location coordinates)
    editMessage: builder.mutation({
      query: ({ messageId, data }) => ({
        url: `/messages/${messageId}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['messages', 'chats'],
    }),
    // Soft-delete a message (sender-only)
    deleteMessage: builder.mutation({
      query: (messageId) => ({
        url: `/messages/${messageId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['messages', 'chats'],
    }),
    // Consume view-once media: succeeds once, then 410 forever
    consumeViewOnceMedia: builder.mutation({
      query: (messageId) => ({
        url: `/messages/${messageId}/view-once`,
        method: 'POST',
      }),
      invalidatesTags: ['messages'],
    }),
    // Set/switch the caller's emoji reaction on a MESSAGE. Deliberately does NOT
    // invalidate: the response + `message reacted` socket update local state,
    // avoiding a history refetch that would reset scroll/reply drafts.
    // NOTE: named uniquely to avoid RTK Query endpoint collision with postApi's removeReaction.
    reactToMessageEmoji: builder.mutation({
      query: ({ messageId, type }: { messageId: string; type: string }) => ({
        url: `/messages/${messageId}/react`,
        method: 'POST',
        body: { type },
      }),
    }),
    // Remove the caller's reaction from a MESSAGE (idempotent)
    // NOTE: named uniquely to avoid RTK Query endpoint collision with postApi's removeReaction.
    removeMessageReaction: builder.mutation({
      query: (messageId: string) => ({
        url: `/messages/${messageId}/react`,
        method: 'DELETE',
      }),
    }),
  }),
});

export const {
  useCreateMessageMutation,
  useGetUserMessagesQuery,
  useEditMessageMutation,
  useDeleteMessageMutation,
  useConsumeViewOnceMediaMutation,
  useReactToMessageEmojiMutation,
  useRemoveMessageReactionMutation,
} = MessagesApi;
