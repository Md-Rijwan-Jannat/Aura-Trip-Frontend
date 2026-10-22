'use server';

import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

/**
 * Returns the authenticated user from the accessToken cookie, or undefined.
 *
 * The cookie's JWT is verified server-side (signature + expiry) with
 * `JWT_ACCESS_SECRET`, which must hold the same value as the backend's
 * `jwt_access_secret`. Fails closed: if the secret is missing or the token is
 * invalid/expired, no user is returned (the middleware then redirects to
 * login). An unverified jwtDecode must never be trusted for routing.
 */
export const currentUser = async () => {
  const token = cookies().get('accessToken')?.value;

  if (!token) {
    return undefined;
  }

  const secret = process.env.JWT_ACCESS_SECRET;

  if (!secret) {
    // Fail closed. Configure JWT_ACCESS_SECRET in the frontend .env.
    // eslint-disable-next-line no-console -- surfaces a server misconfiguration
    console.warn(
      'JWT_ACCESS_SECRET is not configured - rejecting access token'
    );

    return undefined;
  }

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));

    return payload;
  } catch {
    return undefined;
  }
};
