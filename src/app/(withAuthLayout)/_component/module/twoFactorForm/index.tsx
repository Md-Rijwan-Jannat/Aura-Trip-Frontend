/* eslint-disable jsx-a11y/no-static-element-interactions */
"use client";

import React, { useEffect, useRef, useState, Suspense } from "react";
import { Input } from "@nextui-org/input";
import { Button } from "@nextui-org/button";
import { Chip } from "@nextui-org/chip";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import { toast } from "sonner";
import Cookies from "js-cookie";
import {
  FiMail,
  FiShield,
  FiClock,
  FiArrowLeft,
} from "react-icons/fi";
import { IoEyeOffOutline, IoEyeOutline } from "react-icons/io5";

import BackButton from "../../ui/backButton";
import BrandLogo from "@/src/components/shared/logo";
import GlassLoader from "@/src/components/shared/glassLoader";
import {
  useTwoFactorChallengeInfoMutation,
  useSendTwoFactorEmailOtpMutation,
  useVerifyTwoFactorEmailLoginMutation,
  useVerifyTwoFactorLoginMutation,
} from "@/src/redux/features/auth/authApi";
import { useAppDispatch } from "@/src/redux/hook";
import { setCredentials } from "@/src/redux/features/auth/authSlice";

type TActiveMethod = "authenticator" | "email";
type TInputMode = "totp" | "recovery";

interface TDecodedData {
  id: string;
  email: string;
  role: string;
}

interface TChallengeInfo {
  method: TActiveMethod;
  methods: string[];
  maskedEmail: string;
  emailOtpSent: boolean;
  expiresInSeconds: number;
}

const digitsOnly = (value: string) => value.replace(/\D/g, "").slice(0, 6);

const formatSeconds = (total: number) => {
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
};

function TwoFactorForm() {
  const [isVisible, setIsVisible] = useState(false);
  const [inputMode, setInputMode] = useState<TInputMode>("totp");
  const [code, setCode] = useState("");
  const [info, setInfo] = useState<TChallengeInfo | null>(null);
  const [infoLoading, setInfoLoading] = useState(true);
  const [codeSent, setCodeSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [sending, setSending] = useState(false);
  const [expiresIn, setExpiresIn] = useState<number | null>(null);
  const [otpFocused, setOtpFocused] = useState(false);
  const otpInputRef = useRef<HTMLInputElement>(null);
  const codeInputRef = useRef<HTMLInputElement>(null);

  const [verifyLogin, { isLoading: verifyingTotp }] =
    useVerifyTwoFactorLoginMutation();
  const [verifyEmailLogin, { isLoading: verifyingEmail }] =
    useVerifyTwoFactorEmailLoginMutation();
  const [sendEmailOtp] = useSendTwoFactorEmailOtpMutation();
  const [challengeInfo] = useTwoFactorChallengeInfoMutation();

  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const challenge = searchParams.get("challenge");
  const redirect = searchParams.get("redirect");

  const verifying = verifyingTotp || verifyingEmail;
  const method: TActiveMethod = info?.method ?? "authenticator";

  // Resolve the ACTIVE method + masked destination for this challenge.
  // The challenge token itself is the credential; nothing is persisted.
  useEffect(() => {
    if (!challenge) {
      toast.error("Verification session expired. Please log in again.");
      router.push("/login");

      return;
    }

    let active = true;

    (async () => {
      try {
        const res = await challengeInfo({
          challengeToken: challenge,
        }).unwrap();

        if (active && res?.success && res?.data) {
          setInfo(res.data);
          setExpiresIn(res.data.expiresInSeconds);
          if (res.data.method === "email") {
            setCodeSent(!!res.data.emailOtpSent);
          }
        }
      } catch {
        if (active) {
          toast.error("Verification session expired. Please log in again.");
          router.push("/login");
        }
      } finally {
        if (active) setInfoLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [challenge, challengeInfo, router]);

  // Local resend countdown (usability only — the backend enforces cooldown).
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(
      () => setCooldown((current) => Math.max(0, current - 1)),
      1000
    );

    return () => clearInterval(timer);
  }, [cooldown]);

  // Challenge lifetime countdown for the verify screen.
  useEffect(() => {
    if (expiresIn === null) return;
    const timer = setInterval(
      () => setExpiresIn((current) => (current ? current - 1 : 0)),
      1000
    );

    return () => clearInterval(timer);
  }, [expiresIn === null]);

  const completeLogin = (accessToken: string) => {
    const decoded = jwtDecode<TDecodedData>(accessToken);

    dispatch(
      setCredentials({
        user: {
          id: decoded.id,
          email: decoded.email,
          role: decoded.role,
        },
        token: accessToken,
      })
    );
    Cookies.set("accessToken", accessToken);
    toast.success("Login successful");
    router.push(
      redirect
        ? redirect
        : decoded.role === "USER"
          ? "/news-feed/posts"
          : "/admin-dashboard/analytics"
    );
  };

  const handleError = (error: unknown, fallback: string) => {
    const message =
      (error as { data?: { message?: string } })?.data?.message || fallback;

    toast.error(message);
  };

  const handleVerifyTotpOrRecovery = async () => {
    if (!challenge) {
      toast.error("Verification session expired. Please log in again.");
      router.push("/login");

      return;
    }

    try {
      const res = await verifyLogin({
        challengeToken: challenge,
        code: code.trim(),
      }).unwrap();

      if (res?.success && res?.data?.accessToken) {
        completeLogin(res.data.accessToken);
      }
    } catch (error) {
      handleError(error, "Verification failed. Please try again.");
    }
  };

  const handleSendEmailCode = async () => {
    if (!challenge || sending || cooldown > 0) return;
    setSending(true);

    try {
      const res = await sendEmailOtp({ challengeToken: challenge }).unwrap();

      if (res?.success && res?.data) {
        setCodeSent(true);
        setCooldown(res.data.cooldownSeconds ?? 60);
        setCode("");
        toast.success(`Code sent to ${res.data.maskedEmail}`);
      }
    } catch (error) {
      handleError(error, "We could not send the code. Please try again.");
    } finally {
      setSending(false);
    }
  };

  // Email method: the backend sends a code at login; auto-send once if it
  // did not (delivery degraded) so the user is not stuck.
  useEffect(() => {
    if (
      method === "email" &&
      !infoLoading &&
      info &&
      !info.emailOtpSent &&
      !codeSent &&
      !sending &&
      cooldown === 0
    ) {
      handleSendEmailCode();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [method, infoLoading, info, codeSent]);

  const handleVerifyEmail = async () => {
    if (!challenge) {
      toast.error("Verification session expired. Please log in again.");
      router.push("/login");

      return;
    }

    try {
      const res = await verifyEmailLogin({
        challengeToken: challenge,
        code: code.trim(),
      }).unwrap();

      if (res?.success && res?.data?.accessToken) {
        completeLogin(res.data.accessToken);
      }
    } catch (error) {
      handleError(error, "Verification failed. Please try again.");
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (verifying) return;

    if (method === "email") {
      handleVerifyEmail();
    } else {
      handleVerifyTotpOrRecovery();
    }
  };

  const switchInputMode = (next: TInputMode) => {
    setInputMode(next);
    setCode("");
    setIsVisible(false);
  };

  const isRecovery = method === "authenticator" && inputMode === "recovery";

  // Focus the code field once the challenge info has loaded (a11y-safe
  // alternative to the autoFocus prop).
  useEffect(() => {
    if (infoLoading) return;
    if (isRecovery) {
      codeInputRef.current?.focus();
    } else {
      otpInputRef.current?.focus();
    }
  }, [infoLoading, isRecovery]);

  const inputPlaceholder = isRecovery ? "xxxxx-xxxxx-xxxxx-xxxxx" : "123456";
  const inputLabel = isRecovery
    ? "Recovery code"
    : method === "email"
      ? "Email verification code"
      : "Verification code";
  const codeInvalid = isRecovery
    ? code.length > 0 && code.length < 23
    : code.length > 0 && code.length !== 6;
  const canSubmit =
    !!challenge &&
    !verifying &&
    (isRecovery ? code.trim().length >= 6 : code.length === 6);

  return (
    <div className="w-full min-h-[100svh] flex flex-col items-center justify-center max-w-7xl py-6 md:py-10">
      {(verifying || sending || infoLoading) && <GlassLoader />}

      <div className="w-full max-w-[440px] flex flex-col items-center justify-center">
        <BackButton />

        <div className="mt-3 bg-default-100 border border-default-200 shadow-lg rounded-2xl overflow-hidden">
          {/* Brand header — logo always centered inside the card */}
          <div className="flex justify-center px-5 pt-6 pb-1 sm:pt-7">
            <Link aria-label="Aura Trip home" href="/">
              <BrandLogo />
            </Link>
          </div>

          <div className="flex flex-col gap-5 px-5 pb-7 pt-3 sm:px-8 sm:pb-8">
            <div className="text-center flex flex-col items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-sage-700 dark:text-sage-300">
                Verify it&apos;s you
              </h1>
              <p className="text-default-500 text-sm leading-relaxed">
                {method === "email"
                  ? "Enter the 6-digit code we emailed to you."
                  : inputMode === "recovery"
                    ? "Enter one of your saved recovery codes to finish signing in."
                    : "Enter the 6-digit code from your authenticator app."}
              </p>
              {!infoLoading && (
                <Chip
                  className="mt-1"
                  color={method === "email" ? "warning" : "success"}
                  size="sm"
                  startContent={
                    method === "email" ? <FiMail /> : <FiShield />
                  }
                  variant="flat"
                >
                  {method === "email"
                    ? `Email code · ${info?.maskedEmail ?? ""}`
                    : inputMode === "recovery"
                      ? "Recovery code"
                      : "Authenticator app"}
                </Chip>
              )}
            </div>

            {/* Input-mode switcher — only within the ACTIVE method */}
            {method === "authenticator" && (
              <div
                aria-label="Verification method"
                className="grid grid-cols-2 gap-1.5 p-1 bg-default-50 border border-default-200 rounded-full"
                role="tablist"
              >
                <button
                  aria-selected={inputMode === "totp"}
                  className={`text-xs sm:text-sm font-medium py-2 rounded-full transition-colors ${
                    inputMode === "totp"
                      ? "bg-sage-600 text-white shadow-sm"
                      : "text-default-600 hover:text-default-900"
                  }`}
                  key="totp"
                  role="tab"
                  type="button"
                  onClick={() => switchInputMode("totp")}
                >
                  Authenticator
                </button>
                <button
                  aria-selected={inputMode === "recovery"}
                  className={`text-xs sm:text-sm font-medium py-2 rounded-full transition-colors ${
                    inputMode === "recovery"
                      ? "bg-sage-600 text-white shadow-sm"
                      : "text-default-600 hover:text-default-900"
                  }`}
                  key="recovery"
                  role="tab"
                  type="button"
                  onClick={() => switchInputMode("recovery")}
                >
                  Recovery code
                </button>
              </div>
            )}

            <form
              className="w-full flex flex-col gap-4"
              onSubmit={handleSubmit}
            >
              {method === "email" && (
                <div className="flex flex-col gap-3 rounded-xl border border-default-200 bg-default-50 p-3.5 sm:p-4">
                  <p className="text-sm text-default-600 leading-relaxed">
                    We sent a code to <strong>{info?.maskedEmail}</strong>. It
                    expires in 5 minutes and can be used once.
                  </p>
                  <Button
                    className="secondary-button w-full"
                    isDisabled={sending || cooldown > 0}
                    isLoading={sending}
                    size="sm"
                    type="button"
                    onClick={handleSendEmailCode}
                  >
                    {sending
                      ? "Sending…"
                      : cooldown > 0
                        ? `Resend code in ${cooldown}s`
                        : codeSent
                          ? "Resend code"
                          : "Send code to my email"}
                  </Button>
                </div>
              )}

              <div className="flex flex-col gap-2">
                {isRecovery ? (
                  <Input
                    ref={codeInputRef}
                    className="font-semibold"
                    isInvalid={codeInvalid}
                    label={inputLabel}
                    maxLength={30}
                    placeholder={inputPlaceholder}
                    type={isVisible ? "text" : "password"}
                    validationState={codeInvalid ? "invalid" : undefined}
                    value={code}
                    variant="bordered"
                    classNames={{
                      input: "font-mono",
                      label: "text-sm",
                    }}
                    endContent={
                      <button
                        aria-label="toggle recovery code visibility"
                        className="focus:outline-none"
                        type="button"
                        onClick={() => setIsVisible(!isVisible)}
                      >
                        {isVisible ? (
                          <IoEyeOffOutline className="text-2xl text-default-400 pointer-events-none" />
                        ) : (
                          <IoEyeOutline className="text-2xl text-default-400 pointer-events-none" />
                        )}
                      </button>
                    }
                    onChange={(e) => setCode(e.target.value.slice(0, 30))}
                  />
                ) : (
                  <div className="flex flex-col gap-2">
                    <label
                      className="text-sm font-medium text-default-700 dark:text-default-300"
                      htmlFor="otp-code-input"
                    >
                      {inputLabel}
                    </label>
                    <div
                      className="relative"
                      onClick={() => otpInputRef.current?.focus()}
                    >
                      {/* Invisible real input: typing, paste, and SMS/email
                          OTP autofill all land here; the boxes below are a
                          visual overlay. */}
                      <input
                        ref={otpInputRef}
                        aria-label={inputLabel}
                        autoComplete="one-time-code"
                        className="absolute inset-0 h-full w-full cursor-text bg-transparent text-transparent caret-transparent opacity-0"
                        id="otp-code-input"
                        inputMode="numeric"
                        maxLength={6}
                        type="text"
                        value={code}
                        onBlur={() => setOtpFocused(false)}
                        onFocus={() => setOtpFocused(true)}
                        onChange={(e) => setCode(digitsOnly(e.target.value))}
                      />
                      <div className="pointer-events-none grid grid-cols-6 gap-1.5 sm:gap-2">
                        {Array.from({ length: 6 }).map((_, index) => {
                          const digit = code[index] ?? "";
                          const isActive =
                            otpFocused && index === code.length && code.length < 6;

                          return (
                            <div
                              key={index}
                              className={`flex h-12 sm:h-14 items-center justify-center rounded-xl border-2 text-xl sm:text-2xl font-bold transition-colors ${
                                isActive
                                  ? "border-sage-600 bg-white dark:bg-default-100 shadow-sm"
                                  : digit
                                    ? "border-default-300 bg-white dark:bg-default-100"
                                    : "border-default-200 bg-default-50 dark:bg-default-50/40"
                              }`}
                            >
                              {digit ? (
                                <span className="text-default-900 dark:text-default-100">
                                  {digit}
                                </span>
                              ) : isActive ? (
                                <span className="block h-6 w-0.5 animate-pulse bg-sage-600" />
                              ) : null}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
                {isRecovery && codeInvalid ? (
                  <p className="text-danger-500 text-sm">
                    Enter a valid recovery code
                  </p>
                ) : expiresIn !== null && expiresIn > 0 ? (
                  <p className="text-default-400 text-xs flex items-center justify-center gap-1.5">
                    <FiClock />
                    {method === "email"
                      ? `Code request expires in ${formatSeconds(expiresIn)}`
                      : `Session expires in ${formatSeconds(expiresIn)}`}
                  </p>
                ) : null}
              </div>

              <div className="flex justify-center">
                <Button
                  className="primary-button min-w-[240px] sm:min-w-[280px]"
                  isDisabled={!canSubmit}
                  isLoading={verifying}
                  type="submit"
                >
                  {verifying ? "Verifying…" : "Verify & continue"}
                </Button>
              </div>
            </form>

            <div className="flex flex-col items-center gap-2.5 text-sm border-t border-default-200 pt-4">
              {method === "authenticator" && inputMode !== "totp" && (
                <button
                  className="text-sage-700 dark:text-sage-300 hover:underline font-medium"
                  type="button"
                  onClick={() => switchInputMode("totp")}
                >
                  Use authenticator app instead
                </button>
              )}
              {method === "authenticator" && inputMode !== "recovery" && (
                <button
                  className="text-sage-700 dark:text-sage-300 hover:underline font-medium"
                  type="button"
                  onClick={() => switchInputMode("recovery")}
                >
                  Use a recovery code instead
                </button>
              )}
              <Link
                className="text-default-500 hover:text-default-700 flex items-center gap-1.5"
                href="/login"
              >
                <FiArrowLeft /> Back to login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TwoFactorFormWithSuspense() {
  return (
    <Suspense fallback={null}>
      <TwoFactorForm />
    </Suspense>
  );
}
