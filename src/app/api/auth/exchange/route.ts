import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { jwtDecode } from "jwt-decode";
import { authOptions } from "@/src/lib/authOptions";

const getBackendUrl = () =>
  process.env.NEXT_PUBLIC_LIVE_API || process.env.NEXT_PUBLIC_BASE_API;

/**
 * Only same-origin absolute paths are allowed as post-login redirects —
 * blocks open-redirect abuse via https://evil.com or //evil.com.
 */
const safeRedirectPath = (value: string | null): string | null => {
  if (!value) return null;
  if (!value.startsWith("/") || value.startsWith("//")) return null;

  return value;
};

/**
 * Server-side exchange: takes the Google ID token captured by NextAuth
 * (never exposed to client JS), verifies it on the backend, and completes
 * Aura Trip authentication. If 2FA is enabled, NO session is issued — the
 * user is sent to the second-factor screen with a short-lived challenge.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const requestedRedirect = safeRedirectPath(searchParams.get("redirect"));

  const session = await getServerSession(authOptions);
  const idToken = session?.googleIdToken;

  const fail = (code: string) =>
    NextResponse.redirect(`${origin}/login?error=${code}`);

  if (!idToken) {
    return fail("google-auth-failed");
  }

  let backendResponse: Response;

  try {
    backendResponse = await fetch(`${getBackendUrl()}/auth/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
      cache: "no-store",
    });
  } catch {
    return fail("backend-unavailable");
  }

  const payload = await backendResponse.json().catch(() => null);

  // Drop the NextAuth session cookie — the id_token has been consumed.
  const respond = (next: NextResponse) => {
    next.cookies.delete("next-auth.session.token");

    return next;
  };

  if (!backendResponse.ok || !payload?.success) {
    const message: string = payload?.message || "";

    if (message.includes("already exists")) {
      return respond(
        NextResponse.redirect(`${origin}/login?error=account-exists`)
      );
    }
    if (payload?.statusCode === 403) {
      return respond(
        NextResponse.redirect(`${origin}/login?error=account-blocked`)
      );
    }

    return respond(fail("google-auth-failed"));
  }

  const data = payload.data;

  // 2FA enabled: hand off to the second-factor screen — no session cookie.
  if (data?.twoFactorRequired) {
    const params = new URLSearchParams({ challenge: data.challengeToken });

    if (requestedRedirect) params.set("redirect", requestedRedirect);

    return respond(
      NextResponse.redirect(`${origin}/two-factor?${params.toString()}`)
    );
  }

  if (!data?.accessToken) {
    return respond(fail("google-auth-failed"));
  }

  let role = "USER";

  try {
    role = jwtDecode<{ role?: string }>(data.accessToken).role || "USER";
  } catch {
    // fall through with default role
  }

  const destination =
    requestedRedirect ||
    (role === "ADMIN" ? "/admin-dashboard/analytics" : "/news-feed/posts");

  const response = NextResponse.redirect(`${origin}${destination}`);

  // Same token-storage approach as the email/password login flow (readable
  // cookie + Redux), consumed by AuthCookieHydrator and the API client.
  response.cookies.set("accessToken", data.accessToken, {
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    httpOnly: false,
  });

  return respond(response);
}
