import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

/**
 * NextAuth handles the Google authorization-code flow (state, nonce, PKCE).
 * The raw Google ID token is kept server-side only: it is captured on the
 * JWT token, copied onto the session for route handlers, and exchanged for
 * a backend-verified Aura Trip session at /api/auth/exchange. The backend
 * independently re-verifies the token (signature, issuer, audience, expiry)
 * with Google's official library — the browser never supplies auth claims.
 */
export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account?.id_token) {
        token.googleIdToken = account.id_token;
      }

      return token;
    },
    async session({ session, token }) {
      session.googleIdToken = token.googleIdToken;

      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
