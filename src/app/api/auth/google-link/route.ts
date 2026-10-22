import { getServerSession } from "next-auth";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { authOptions } from "@/src/lib/authOptions";

const getBackendUrl = () =>
  process.env.NEXT_PUBLIC_LIVE_API || process.env.NEXT_PUBLIC_BASE_API;

/**
 * Connect Google from Settings → Security. The user is already authenticated
 * in Aura Trip; this route takes the freshly verified Google ID token and
 * links it to the current session's account (backend requires the Google
 * email to match and recent password re-auth where applicable).
 */
export async function GET(request: Request) {
  const { origin } = new URL(request.url);

  const session = await getServerSession(authOptions);
  const idToken = session?.googleIdToken;
  const accessToken = cookies().get("accessToken")?.value;

  const fail = (code: string) =>
    NextResponse.redirect(`${origin}/settings?googleLink=${code}`);

  if (!idToken || !accessToken) {
    return fail("failed");
  }

  let backendResponse: Response;

  try {
    backendResponse = await fetch(`${getBackendUrl()}/auth/google/link`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: accessToken,
      },
      body: JSON.stringify({ idToken }),
      cache: "no-store",
    });
  } catch {
    return fail("failed");
  }

  const response = NextResponse.redirect(`${origin}/settings?googleLink=${
    backendResponse.ok ? "success" : "failed"
  }`);

  response.cookies.delete("next-auth.session.token");

  return response;
}
