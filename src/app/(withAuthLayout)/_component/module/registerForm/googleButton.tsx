"use client";

import { Button } from "@nextui-org/button";
import { signIn } from "next-auth/react";
import React, { useState } from "react";
import { FcGoogle } from "react-icons/fc";

interface GoogleButtonProps {
  /** Post-auth destination; validated server-side against open redirects. */
  redirect?: string | null;
  label?: string;
}

/**
 * Continue with Google — starts the NextAuth Google flow. The resulting
 * Google ID token is exchanged server-side at /api/auth/exchange; if the
 * account has 2FA enabled the user is routed to the second-factor screen
 * instead of receiving a session.
 */
export default function GoogleButton({
  redirect,
  label = "Continue with Google",
}: GoogleButtonProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignIn = () => {
    if (isSubmitting) return; // prevent duplicate submissions
    setIsSubmitting(true);
    const callbackUrl = redirect
      ? `/api/auth/exchange?redirect=${encodeURIComponent(redirect)}`
      : "/api/auth/exchange";

    signIn("google", { callbackUrl }).finally(() => setIsSubmitting(false));
  };

  return (
    <Button
      fullWidth
      aria-label={label}
      className="font-semibold"
      color="default"
      isDisabled={isSubmitting}
      isLoading={isSubmitting}
      radius="full"
      startContent={isSubmitting ? undefined : <FcGoogle size={20} />}
      type="button"
      variant="bordered"
      onClick={handleSignIn}
    >
      {isSubmitting ? "Redirecting to Google..." : label}
    </Button>
  );
}
