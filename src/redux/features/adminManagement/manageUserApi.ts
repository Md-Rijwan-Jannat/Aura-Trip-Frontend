import { baseApi } from "../../api/baseApi";

const manageUserApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all users query
    getAllUserForAnalytics: builder.query({
      query: () => {
        return {
          url: `/users/normal-users-analytics`,
          method: "GET",
        };
      },
      providesTags: ["users"],
    }),

    // Get all premium users query
    getAlPremiumUserForAnalytics: builder.query({
      query: () => {
        return {
          url: `/users/premium-users-analytics`,
          method: "GET",
        };
      },
      providesTags: ["users"],
    }),

    // Get all premium users query
    getAllPremiumUsers: builder.query({
      query: (args) => {
        const params = new URLSearchParams();

        if (args) {
          Object.entries(args).forEach(([name, value]) => {
            params.append(name, value as string);
          });
        }

        return {
          url: `/users/premium-users`,
          method: "GET",
          params,
        };
      },
      providesTags: ["users"],
    }),
    // Update user status mutation
    updateUserStatus: builder.mutation({
      query: ({ userId, status }) => ({
        url: `/users/${userId}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["users"],
    }),

    // Update user role mutation
    updateUserRole: builder.mutation({
      query: ({ userId, role }) => ({
        url: `/users/${userId}/role`,
        method: "PATCH",
        body: { role },
      }),
      invalidatesTags: ["users"],
    }),
  }),
});

export const {
  useGetAllUserForAnalyticsQuery,
  useGetAlPremiumUserForAnalyticsQuery,
  useGetAllPremiumUsersQuery,
  useUpdateUserStatusMutation,
  useUpdateUserRoleMutation,
} = manageUserApi;
