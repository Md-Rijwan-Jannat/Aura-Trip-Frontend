import { baseApi } from '../../api/baseApi';

export const GroupApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /* ---------------------------- Discovery ---------------------------- */
    getAllGroups: builder.query({
      query: (args) => {
        const params = new URLSearchParams();

        if (args) {
          Object.entries(args).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
              params.append(key, value as string);
            }
          });
        }

        return { url: '/groups', method: 'GET', params };
      },
      providesTags: ['groups'],
    }),

    getSingleGroup: builder.query({
      query: (id) => ({ url: `/groups/${id}`, method: 'GET' }),
      providesTags: ['groups'],
    }),

    createGroup: builder.mutation({
      query: (data) => ({ url: '/groups', method: 'POST', body: data }),
      invalidatesTags: ['groups'],
    }),

    updateGroup: builder.mutation({
      query: ({ id, data }) => ({
        url: `/groups/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['groups'],
    }),

    deleteGroup: builder.mutation({
      query: (id) => ({ url: `/groups/${id}`, method: 'DELETE' }),
      invalidatesTags: ['groups'],
    }),

    /* ---------------------------- Membership --------------------------- */
    joinGroup: builder.mutation({
      query: (id) => ({ url: `/groups/${id}/join`, method: 'POST' }),
      invalidatesTags: ['groups'],
    }),

    leaveGroup: builder.mutation({
      query: (id) => ({ url: `/groups/${id}/leave`, method: 'POST' }),
      invalidatesTags: ['groups'],
    }),

    listGroupMembers: builder.query({
      query: ({ id, ...args }) => {
        const params = new URLSearchParams();

        Object.entries(args || {}).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, value as string);
          }
        });

        return { url: `/groups/${id}/members`, method: 'GET', params };
      },
      providesTags: ['groups'],
    }),

    reviewJoinRequest: builder.mutation({
      query: ({ id, userId, decision }) => ({
        url: `/groups/${id}/members/review`,
        method: 'POST',
        body: { userId, decision },
      }),
      invalidatesTags: ['groups'],
    }),

    changeMemberRole: builder.mutation({
      query: ({ id, userId, role }) => ({
        url: `/groups/${id}/members/role`,
        method: 'PATCH',
        body: { userId, role },
      }),
      invalidatesTags: ['groups'],
    }),

    removeMember: builder.mutation({
      query: ({ id, userId, ban }) => ({
        url: `/groups/${id}/members/remove`,
        method: 'POST',
        body: { userId, ban: ban === true },
      }),
      invalidatesTags: ['groups'],
    }),

    unbanMember: builder.mutation({
      query: ({ id, userId }) => ({
        url: `/groups/${id}/members/unban`,
        method: 'POST',
        body: { userId },
      }),
      invalidatesTags: ['groups'],
    }),

    transferOwnership: builder.mutation({
      query: ({ id, userId }) => ({
        url: `/groups/${id}/transfer-ownership`,
        method: 'POST',
        body: { userId, confirm: true },
      }),
      invalidatesTags: ['groups'],
    }),

    /* ------------------------------- Chat ------------------------------ */
    getGroupConversation: builder.query({
      query: (id) => ({ url: `/groups/${id}/chat`, method: 'GET' }),
      providesTags: ['chats'],
    }),

    /* ------------------------------ Invites ---------------------------- */
    createGroupInvite: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/groups/${id}/invites`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['groups'],
    }),

    listGroupInvites: builder.query({
      query: (id) => ({ url: `/groups/${id}/invites`, method: 'GET' }),
      providesTags: ['groups'],
    }),

    revokeGroupInvite: builder.mutation({
      query: ({ id, inviteId }) => ({
        url: `/groups/${id}/invites/${inviteId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['groups'],
    }),

    // Public (no auth) — used by the branded invite landing page.
    previewGroupInvite: builder.query({
      query: (token) => ({ url: `/groups/invites/${token}/preview`, method: 'GET' }),
    }),

    redeemGroupInvite: builder.mutation({
      query: (token) => ({
        url: `/groups/invites/${token}/redeem`,
        method: 'POST',
      }),
      invalidatesTags: ['groups'],
    }),

    /* ------------------------------- Feed ------------------------------ */
    getGroupFeed: builder.query({
      query: ({ id, ...args }) => {
        const params = new URLSearchParams();

        Object.entries(args || {}).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, value as string);
          }
        });

        return { url: `/groups/${id}/posts`, method: 'GET', params };
      },
      providesTags: ['groups', 'posts'],
    }),

    createGroupPost: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/groups/${id}/posts`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['groups', 'posts'],
    }),

    /* ---------------------------- Moderation --------------------------- */
    getModerationQueue: builder.query({
      query: ({ id, ...args }) => {
        const params = new URLSearchParams();

        Object.entries(args || {}).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, value as string);
          }
        });

        return { url: `/groups/${id}/moderation/posts`, method: 'GET', params };
      },
      providesTags: ['groups', 'posts'],
    }),

    moderateGroupPost: builder.mutation({
      query: ({ id, postId, action, reason }) => ({
        url: `/groups/${id}/moderation/posts/${postId}/${action}`,
        method: 'POST',
        body: reason ? { reason } : {},
      }),
      invalidatesTags: ['groups', 'posts'],
    }),

    /* --------------------------- Shorts / log -------------------------- */
    getGroupShorts: builder.query({
      query: ({ id, ...args }) => {
        const params = new URLSearchParams();

        Object.entries(args || {}).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, value as string);
          }
        });

        return { url: `/groups/${id}/shorts`, method: 'GET', params };
      },
      providesTags: ['shorts'],
    }),

    getGroupAuditLog: builder.query({
      query: ({ id, ...args }) => {
        const params = new URLSearchParams();

        Object.entries(args || {}).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, value as string);
          }
        });

        return { url: `/groups/${id}/audit`, method: 'GET', params };
      },
      providesTags: ['groups'],
    }),
  }),
});

export const {
  useGetAllGroupsQuery,
  useGetSingleGroupQuery,
  useCreateGroupMutation,
  useUpdateGroupMutation,
  useDeleteGroupMutation,
  useJoinGroupMutation,
  useLeaveGroupMutation,
  useListGroupMembersQuery,
  useReviewJoinRequestMutation,
  useChangeMemberRoleMutation,
  useRemoveMemberMutation,
  useUnbanMemberMutation,
  useTransferOwnershipMutation,
  useGetGroupConversationQuery,
  useLazyGetGroupConversationQuery,
  useCreateGroupInviteMutation,
  useListGroupInvitesQuery,
  useRevokeGroupInviteMutation,
  usePreviewGroupInviteQuery,
  useRedeemGroupInviteMutation,
  useGetGroupFeedQuery,
  useCreateGroupPostMutation,
  useGetModerationQueueQuery,
  useModerateGroupPostMutation,
  useGetGroupShortsQuery,
  useGetGroupAuditLogQuery,
} = GroupApi;
