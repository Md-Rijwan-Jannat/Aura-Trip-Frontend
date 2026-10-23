import { baseApi } from "../../api/baseApi";

export const PostApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Create a new post
    createPost: builder.mutation({
      query: (postData) => ({
        url: "/posts",
        method: "POST",
        body: postData,
      }),
      invalidatesTags: [{ type: "posts", id: "LIST" }], // Ensure related queries are re-fetched
    }),

    // Update an existing post
    updatePost: builder.mutation({
      query: ({ id, data }) => ({
        url: `/posts/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "posts", id },
        { type: "posts", id: "LIST" },
      ], // Trigger re-fetch for posts
    }),

    // Fetch all posts with optional query parameters
    getAllPosts: builder.query({
      query: (args) => {
        const params = new URLSearchParams();

        if (args) {
          Object.entries(args).forEach(([key, value]) => {
            params.append(key, value as string);
          });
        }

        return {
          url: "/posts",
          method: "GET",
          params,
        };
      },
      providesTags: (result) => {
        if (!result || !Array.isArray(result)) {
          return [{ type: "posts" as const, id: "LIST" }];
        }

        return [
          { type: "posts" as const, id: "LIST" },
          ...result.map(({ id }: { id: string }) => ({
            type: "posts" as const,
            id,
          })),
        ];
      }, // Attach tag to enable invalidation
    }),

    // Fetch a single post by ID
    getSinglePost: builder.query({
      query: (postId) => ({
        url: `/posts/${postId}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "posts", id }], // Attach tags for invalidation
    }),

    // Fetch all posts created by the current user
    getMyPosts: builder.query({
      query: () => ({
        url: "/profile/my-posts",
        method: "GET",
      }),
      providesTags: (result) => {
        if (!result || !Array.isArray(result)) {
          return [{ type: "posts" as const, id: "LIST" }];
        }

        return [
          { type: "posts" as const, id: "LIST" },
          ...result.map(({ id }: { id: string }) => ({
            type: "posts" as const,
            id,
          })),
        ];
      },
    }),

    // Fetch premium posts created by the current user
    getMyPremiumPosts: builder.query({
      query: () => ({
        url: "/profile/my-premium-posts",
        method: "GET",
      }),
      providesTags: (result) => {
        if (!result || !Array.isArray(result)) {
          return [{ type: "posts" as const, id: "LIST" }];
        }

        return [
          { type: "posts" as const, id: "LIST" },
          ...result.map(({ id }: { id: string }) => ({
            type: "posts" as const,
            id,
          })),
        ];
      },
    }),

    // Soft delete a post by ID
    softDeletePost: builder.mutation({
      query: (postId) => ({
        url: `/posts/${postId}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "posts", id: "LIST" }], // Ensure posts list is updated
    }),

    // Report a post with a reason
    reportPost: builder.mutation({
      query: ({ postId, reason }) => ({
        url: `/posts/report/${postId}`,
        method: "PUT",
        body: { reason },
      }),
      invalidatesTags: ["users", "posts", "comments", "reacts"],
    }),

    // Like a post
    like: builder.mutation({
      query: (postId) => ({
        url: `/react/post/${postId}/like`,
        method: "POST",
      }),
      invalidatesTags: ["users", "posts", "comments", "reacts"],
    }),

    // Unlike a post
    unLike: builder.mutation({
      query: (postId) => ({
        url: `/react/post/${postId}/unlike`,
        method: "POST",
      }),
      invalidatesTags: ["users", "posts", "comments", "reacts"],
    }),

    // Dislike a post
    disLike: builder.mutation({
      query: (postId) => ({
        url: `/react/post/${postId}/dislike`,
        method: "POST",
      }),
      invalidatesTags: ["users", "posts", "comments", "reacts"],
    }),

    // Remove dislike from a post
    unDislike: builder.mutation({
      query: (postId) => ({
        url: `/react/post/${postId}/undislike`,
        method: "POST",
      }),
      invalidatesTags: ["users", "posts", "comments", "reacts"],
    }),

    // Fetch all reactions
    getAllReacts: builder.query({
      query: () => ({
        url: "/react",
        method: "GET",
      }),
      providesTags: ["users", "posts", "comments", "reacts"],
    }),

    // ------------------------------------------------------------------
    // 7-type emoji reactions (one reaction per user per post)
    // ------------------------------------------------------------------

    // Counts per reaction type + the caller's own reaction
    getReactionSummary: builder.query({
      query: ({ targetType = "post", targetId }) => ({
        url: `/react/summary/${targetType}/${targetId}`,
        method: "GET",
      }),
      providesTags: ["reacts", "posts"],
    }),

    // Set or change the caller's reaction
    setReaction: builder.mutation({
      query: ({ targetType = "post", targetId, type }) => ({
        url: `/react/${targetType}/${targetId}`,
        method: "POST",
        body: { type },
      }),
      invalidatesTags: ["reacts", "posts", "users"],
    }),

    // Remove the caller's reaction
    removeReaction: builder.mutation({
      query: ({ targetType = "post", targetId }) => ({
        url: `/react/${targetType}/${targetId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["reacts", "posts", "users"],
    }),

    // ------------------------------------------------------------------
    // Profile pin / highlight, per-user hide, group pin, comment settings
    // ------------------------------------------------------------------

    // Owner pins/unpins a post to their profile (one pin per author)
    pinPost: builder.mutation({
      query: ({ postId, pinned }) => ({
        url: `/posts/${postId}/pin`,
        method: "POST",
        body: { pinned },
      }),
      invalidatesTags: [{ type: "posts", id: "LIST" }, "posts"],
    }),

    // Owner highlights/unhighlights a post (one highlight per author)
    featurePost: builder.mutation({
      query: ({ postId, featured }) => ({
        url: `/posts/${postId}/feature`,
        method: "POST",
        body: { featured },
      }),
      invalidatesTags: [{ type: "posts", id: "LIST" }, "posts"],
    }),

    // Group staff pin/unpin inside a community group feed
    groupPinPost: builder.mutation({
      query: ({ postId, pinned }) => ({
        url: `/posts/${postId}/group-pin`,
        method: "POST",
        body: { pinned },
      }),
      invalidatesTags: [{ type: "posts", id: "LIST" }, "posts"],
    }),

    // Hide a post from the caller's own feed (never deletes the post)
    hidePost: builder.mutation({
      query: (postId) => ({
        url: `/posts/${postId}/hide`,
        method: "POST",
      }),
      invalidatesTags: [{ type: "posts", id: "LIST" }, "posts"],
    }),

    unhidePost: builder.mutation({
      query: (postId) => ({
        url: `/posts/${postId}/hide`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "posts", id: "LIST" }, "posts"],
    }),

    // Comment ordering + featured-comment settings (owner only)
    updateCommentSettings: builder.mutation({
      query: ({ postId, data }) => ({
        url: `/posts/${postId}/comment-settings`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["posts", "comments"],
    }),
  }),
});

export const {
  useCreatePostMutation,
  useUpdatePostMutation,
  useGetAllPostsQuery,
  useGetSinglePostQuery,
  useGetMyPostsQuery,
  useGetMyPremiumPostsQuery,
  useSoftDeletePostMutation,
  useReportPostMutation,
  useLikeMutation,
  useUnLikeMutation,
  useDisLikeMutation,
  useUnDislikeMutation,
  useGetReactionSummaryQuery,
  useSetReactionMutation,
  useRemoveReactionMutation,
  usePinPostMutation,
  useFeaturePostMutation,
  useGroupPinPostMutation,
  useHidePostMutation,
  useUnhidePostMutation,
  useUpdateCommentSettingsMutation,
} = PostApi;

// import { baseApi } from "../../api/baseApi";

// export const PostApi = baseApi.injectEndpoints({
//   endpoints: (builder) => ({
//     // Create a new post
//     createPost: builder.mutation({
//       query: (postData) => ({
//         url: "/posts",
//         method: "POST",
//         body: postData,
//       }),
//       invalidatesTags: [{ type: "posts", id: "LIST" }], // Ensure related queries are re-fetched
//     }),

//     // Update an existing post
//     updatePost: builder.mutation({
//       query: ({ id, data }) => ({
//         url: `/posts/${id}`,
//         method: "PATCH",
//         body: data,
//       }),
//       invalidatesTags: (result, error, { id }) => [
//         { type: "posts", id },
//         { type: "posts", id: "LIST" },
//       ],
//     }),

//     // Fetch all posts with optional query parameters
//     getAllPosts: builder.query({
//       query: (args) => {
//         const params = new URLSearchParams();
//         if (args) {
//           Object.entries(args).forEach(([key, value]) => {
//             params.append(key, value as string);
//           });
//         }
//         return {
//           url: "/posts",
//           method: "GET",
//           params,
//         };
//       },
//       providesTags: (result) => {
//         if (!result || !Array.isArray(result)) {
//           return [{ type: "posts" as const, id: "LIST" }];
//         }
//         return [
//           { type: "posts" as const, id: "LIST" },
//           ...result.map(({ id }: { id: string }) => ({
//             type: "posts" as const,
//             id,
//           })),
//         ];
//       },
//     }),

//     // Fetch a single post by ID
//     getSinglePost: builder.query({
//       query: (postId) => ({
//         url: `/posts/${postId}`,
//         method: "GET",
//       }),
//       providesTags: (result, error, id) => [{ type: "posts", id }],
//     }),

//     // Soft delete a post by ID
//     softDeletePost: builder.mutation({
//       query: (postId) => ({
//         url: `/posts/${postId}`,
//         method: "DELETE",
//       }),
//       invalidatesTags: [{ type: "posts", id: "LIST" }],
//     }),

//     // Report a post with a reason
//     reportPost: builder.mutation({
//       query: ({ postId, reason }) => ({
//         url: `/posts/report/${postId}`,
//         method: "PUT",
//         body: { reason },
//       }),
//       invalidatesTags: [{ type: "posts", id: "LIST" }],
//     }),

//     // Like a post
//     like: builder.mutation({
//       query: (postId) => ({
//         url: `/react/post/${postId}/like`,
//         method: "POST",
//       }),
//       invalidatesTags: [{ type: "posts", id: "LIST" }],
//     }),

//     // Unlike a post
//     unLike: builder.mutation({
//       query: (postId) => ({
//         url: `/react/post/${postId}/unlike`,
//         method: "POST",
//       }),
//       invalidatesTags: [{ type: "posts", id: "LIST" }],
//     }),

//     // Dislike a post
//     disLike: builder.mutation({
//       query: (postId) => ({
//         url: `/react/post/${postId}/dislike`,
//         method: "POST",
//       }),
//       invalidatesTags: [{ type: "posts", id: "LIST" }],
//     }),

//     // Remove dislike from a post
//     unDislike: builder.mutation({
//       query: (postId) => ({
//         url: `/react/post/${postId}/undislike`,
//         method: "POST",
//       }),
//       invalidatesTags: [{ type: "posts", id: "LIST" }],
//     }),
//   }),
// });

// export const {
//   useCreatePostMutation,
//   useUpdatePostMutation,
//   useGetAllPostsQuery,
//   useGetSinglePostQuery,
//   useSoftDeletePostMutation,
//   useReportPostMutation,
//   useLikeMutation,
//   useUnLikeMutation,
//   useDisLikeMutation,
//   useUnDislikeMutation,
// } = PostApi;
