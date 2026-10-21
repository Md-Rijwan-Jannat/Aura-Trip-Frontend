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
