import "next-auth";

declare module "next-auth" {
  interface Session {
    /** Google ID token captured server-side for the backend exchange. */
    googleIdToken?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    googleIdToken?: string;
  }
}
