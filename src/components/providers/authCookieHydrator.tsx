"use client";

import { useEffect } from "react";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { useAppDispatch, useAppSelector } from "@/src/redux/hook";
import { setCredentials } from "@/src/redux/features/auth/authSlice";
import { getToken } from "@/src/redux/features/auth/authSlice";

/**
 * After Google sign-in the backend session arrives as a cookie set by the
 * server exchange route. This hydrates the Redux auth slice (used by RTK
 * Query's Authorization header) from that cookie when Redux is empty —
 * e.g. first login in a fresh browser or after localStorage was cleared.
 */
export default function AuthCookieHydrator() {
  const dispatch = useAppDispatch();
  const token = useAppSelector(getToken);

  useEffect(() => {
    if (token) return;
    const cookieToken = Cookies.get("accessToken");

    if (!cookieToken) return;
    try {
      const decoded = jwtDecode<{ id?: string; email?: string; role?: string }>(
        cookieToken
      );

      if (decoded?.id && decoded?.email && decoded?.role) {
        dispatch(
          setCredentials({
            user: {
              id: decoded.id,
              email: decoded.email,
              role: decoded.role,
            },
            token: cookieToken,
          })
        );
      }
    } catch {
      // Invalid cookie — ignore; middleware/API will reject it.
    }
  }, [token, dispatch]);

  return null;
}
