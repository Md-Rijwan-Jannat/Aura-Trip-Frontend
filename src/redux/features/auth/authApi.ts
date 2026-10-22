import { baseApi } from '../../api/baseApi';

const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Login mutation
    login: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['users', 'posts'],
    }),

    // Register mutation
    register: builder.mutation({
      query: (credentials) => ({
        url: '/auth/register',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['users', 'posts'],
    }),
    getMe: builder.query({
      query: () => ({
        url: '/profile',
        method: 'GET',
      }),
      providesTags: ['users', 'posts'],
    }),
    resetLink: builder.mutation({
      query: (credentials) => {
        return {
          url: '/auth/reset-link',
          method: 'POST',
          body: credentials,
        };
      },
      invalidatesTags: ['users', 'posts'],
    }),
    forgetPassword: builder.mutation({
      query: (credentials) => ({
        url: '/auth/forget-password',
        method: 'POST',
        body: credentials,
        headers: {
          Authorization: `${credentials.token}`,
        },
      }),
      invalidatesTags: ['users', 'posts'],
    }),
    changePassword: builder.mutation({
      query: (credentials) => ({
        url: '/auth/change-password',
        method: 'POST',
        body: credentials,
        headers: {
          Authorization: `${credentials.token}`,
        },
      }),
      invalidatesTags: ['users', 'posts'],
    }),

    // --- Two-factor authentication -----------------------------------------
    twoFactorStatus: builder.query({
      query: () => ({
        url: '/auth/2fa/status',
        method: 'GET',
      }),
      providesTags: ['user'],
    }),
    enrollTwoFactor: builder.mutation({
      query: (body) => ({
        url: '/auth/2fa/enroll',
        method: 'POST',
        body,
      }),
    }),
    verifyTwoFactorEnrollment: builder.mutation({
      query: (body) => ({
        url: '/auth/2fa/verify-enrollment',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['user'],
    }),
    verifyTwoFactorLogin: builder.mutation({
      query: (body) => ({
        url: '/auth/2fa/verify-login',
        method: 'POST',
        body,
      }),
    }),

    // --- Email OTP (alternative second factor) ----------------------------
    twoFactorChallengeInfo: builder.mutation({
      query: (body) => ({
        url: '/auth/2fa/challenge-info',
        method: 'POST',
        body,
      }),
    }),
    sendTwoFactorEmailOtp: builder.mutation({
      query: (body) => ({
        url: '/auth/2fa/email/send',
        method: 'POST',
        body,
      }),
    }),
    verifyTwoFactorEmailLogin: builder.mutation({
      query: (body) => ({
        url: '/auth/2fa/email/verify',
        method: 'POST',
        body,
      }),
    }),

    // --- Account-email verification (Settings) ----------------------------
    sendEmailVerificationOtp: builder.mutation({
      query: () => ({
        url: '/auth/email-verification/send',
        method: 'POST',
      }),
      invalidatesTags: ['user'],
    }),
    verifyEmailVerificationOtp: builder.mutation({
      query: (body) => ({
        url: '/auth/email-verification/verify',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['user'],
    }),
    enableEmailOtp: builder.mutation({
      query: () => ({
        url: '/auth/2fa/email-otp/enroll/send',
        method: 'POST',
      }),
    }),
    verifyEnableEmailOtp: builder.mutation({
      query: (body) => ({
        url: '/auth/2fa/email-otp/enroll/verify',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['user'],
    }),
    disableTwoFactor: builder.mutation({
      query: (body) => ({
        url: '/auth/2fa/disable',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['user'],
    }),
    regenerateRecoveryCodes: builder.mutation({
      query: (body) => ({
        url: '/auth/2fa/recovery-codes/regenerate',
        method: 'POST',
        body,
      }),
    }),

    // --- Google account connection (from Settings) --------------------------
    unlinkGoogle: builder.mutation({
      query: (body) => ({
        url: '/auth/google/unlink',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['user'],
    }),
  }),
});

// Exporting the hooks to use in components
export const {
  useLoginMutation,
  useRegisterMutation,
  useGetMeQuery,
  useResetLinkMutation,
  useForgetPasswordMutation,
  useChangePasswordMutation,
  useTwoFactorStatusQuery,
  useEnrollTwoFactorMutation,
  useVerifyTwoFactorEnrollmentMutation,
  useVerifyTwoFactorLoginMutation,
  useTwoFactorChallengeInfoMutation,
  useSendTwoFactorEmailOtpMutation,
  useVerifyTwoFactorEmailLoginMutation,
  useSendEmailVerificationOtpMutation,
  useVerifyEmailVerificationOtpMutation,
  useEnableEmailOtpMutation,
  useVerifyEnableEmailOtpMutation,
  useDisableTwoFactorMutation,
  useRegenerateRecoveryCodesMutation,
  useUnlinkGoogleMutation,
} = authApi;
