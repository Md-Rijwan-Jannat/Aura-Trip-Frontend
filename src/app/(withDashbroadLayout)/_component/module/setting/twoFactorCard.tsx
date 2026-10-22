"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@nextui-org/button";
import { Input } from "@nextui-org/input";
import { Checkbox } from "@nextui-org/checkbox";
import { Chip } from "@nextui-org/chip";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@nextui-org/modal";
import {
  FiShield,
  FiKey,
  FiRefreshCw,
  FiCopy,
  FiCheck,
  FiMail,
} from "react-icons/fi";
import { toast } from "sonner";
import GlassLoader from "@/src/components/shared/glassLoader";
import {
  useTwoFactorStatusQuery,
  useEnrollTwoFactorMutation,
  useVerifyTwoFactorEnrollmentMutation,
  useDisableTwoFactorMutation,
  useRegenerateRecoveryCodesMutation,
  useSendEmailVerificationOtpMutation,
  useVerifyEmailVerificationOtpMutation,
  useEnableEmailOtpMutation,
  useVerifyEnableEmailOtpMutation,
} from "@/src/redux/features/auth/authApi";

type TSetupStep = "confirm" | "qr" | "codes";

type TTwoFactorMethod = "none" | "authenticator" | "email";

const isPasswordRequiredError = (error: unknown) => {
  const message =
    (error as { data?: { message?: string } })?.data?.message || "";

  return message.includes("Password confirmation");
};
type TDisableContext = "disable" | "regenerate";

interface TTwoFactorStatus {
  twoFactorMethod: TTwoFactorMethod;
  twoFactorEnabled: boolean;
  authenticatorActive: boolean;
  emailOtpActive: boolean;
  googleLinked: boolean;
  hasPassword: boolean;
  twoFactorEnabledAt: string | null;
  emailVerified: boolean;
  maskedEmail: string;
}

export default function TwoFactorCard() {
  const { data, isLoading, isFetching, refetch } = useTwoFactorStatusQuery(undefined);
  const status = data?.data as TTwoFactorStatus | undefined;

  const setupDisclosure = useDisclosure();
  const actionDisclosure = useDisclosure();
  const emailOtpDisclosure = useDisclosure();

  const [enrollTwoFactor, { isLoading: enrollLoading }] =
    useEnrollTwoFactorMutation();
  const [verifyEnrollment, { isLoading: verifyEnrollLoading }] =
    useVerifyTwoFactorEnrollmentMutation();
  const [disableTwoFactor, { isLoading: disableLoading }] =
    useDisableTwoFactorMutation();
  const [regenerateCodes, { isLoading: regenerateLoading }] =
    useRegenerateRecoveryCodesMutation();
  const [sendEmailVerification, { isLoading: emailSending }] =
    useSendEmailVerificationOtpMutation();
  const [verifyEmailVerification, { isLoading: emailVerifying }] =
    useVerifyEmailVerificationOtpMutation();
  const [sendEnableEmailOtp, { isLoading: enableEmailSending }] =
    useEnableEmailOtpMutation();
  const [verifyEnableEmailOtp, { isLoading: enableEmailVerifying }] =
    useVerifyEnableEmailOtpMutation();

  // Account-email verification (required before email OTP can be the
  // second factor).
  const [emailCodeSent, setEmailCodeSent] = useState(false);
  const [emailCooldown, setEmailCooldown] = useState(0);
  const [emailCode, setEmailCode] = useState("");

  // Email-OTP enrollment (switch the single active method to email).
  const [enableCodeSent, setEnableCodeSent] = useState(false);
  const [enableCooldown, setEnableCooldown] = useState(0);
  const [enableCode, setEnableCode] = useState("");

  useEffect(() => {
    if (emailCooldown <= 0) return;
    const timer = setInterval(
      () => setEmailCooldown((current) => Math.max(0, current - 1)),
      1000
    );

    return () => clearInterval(timer);
  }, [emailCooldown]);

  useEffect(() => {
    if (enableCooldown <= 0) return;
    const timer = setInterval(
      () => setEnableCooldown((current) => Math.max(0, current - 1)),
      1000
    );

    return () => clearInterval(timer);
  }, [enableCooldown]);

  const handleSendEmailVerification = async () => {
    if (emailSending || emailCooldown > 0) return;

    try {
      const res = await sendEmailVerification(undefined).unwrap();

      if (res?.success && res?.data) {
        setEmailCodeSent(true);
        setEmailCooldown(res.data.cooldownSeconds ?? 60);
        setEmailCode("");
        toast.success(`Verification code sent to ${res.data.maskedEmail}`);
      }
    } catch (error) {
      const message =
        (error as { data?: { message?: string } })?.data?.message ||
        "We could not send the code. Please try again.";

      toast.error(message);
    }
  };

  const handleVerifyEmailVerification = async () => {
    if (!emailCode.trim() || emailVerifying) return;

    try {
      await verifyEmailVerification({ code: emailCode.trim() }).unwrap();
      toast.success("Account email verified — email OTP is now available");
      setEmailCodeSent(false);
      setEmailCode("");
      refetch();
    } catch (error) {
      const message =
        (error as { data?: { message?: string } })?.data?.message ||
        "Invalid verification code";

      toast.error(message);
    }
  };

  const openEnableEmailOtp = async () => {
    setEnableCodeSent(false);
    setEnableCode("");
    setEnableCooldown(0);
    emailOtpDisclosure.onOpen();

    try {
      const res = await sendEnableEmailOtp(undefined).unwrap();

      if (res?.success && res?.data) {
        setEnableCodeSent(true);
        setEnableCooldown(res.data.cooldownSeconds ?? 60);
        toast.success(`Verification code sent to ${res.data.maskedEmail}`);
      }
    } catch (error) {
      const message =
        (error as { data?: { message?: string } })?.data?.message ||
        "We could not send the code. Please try again.";

      toast.error(message);
    }
  };

  const handleResendEnableEmailOtp = async () => {
    if (enableEmailSending || enableCooldown > 0) return;

    try {
      const res = await sendEnableEmailOtp(undefined).unwrap();

      if (res?.success && res?.data) {
        setEnableCodeSent(true);
        setEnableCooldown(res.data.cooldownSeconds ?? 60);
        setEnableCode("");
        toast.success(`Verification code sent to ${res.data.maskedEmail}`);
      }
    } catch (error) {
      const message =
        (error as { data?: { message?: string } })?.data?.message ||
        "We could not send the code. Please try again.";

      toast.error(message);
    }
  };

  const handleVerifyEnableEmailOtp = async () => {
    if (!enableCode.trim() || enableEmailVerifying) return;

    try {
      await verifyEnableEmailOtp({ code: enableCode.trim() }).unwrap();
      toast.success(
        "Email OTP is now your second factor — authenticator codes are no longer accepted at sign-in"
      );
      emailOtpDisclosure.onClose();
      setEnableCode("");
      setEnableCodeSent(false);
      refetch();
    } catch (error) {
      const message =
        (error as { data?: { message?: string } })?.data?.message ||
        "Invalid verification code";

      toast.error(message);
    }
  };

  const [setupStep, setSetupStep] = useState<TSetupStep>("confirm");
  const [enrollPassword, setEnrollPassword] = useState("");
  const [enrollData, setEnrollData] = useState<{
    secret: string;
    qrCodeDataUrl: string;
    otpauthUrl: string;
  } | null>(null);
  const [otpCode, setOtpCode] = useState("");
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [codesAcknowledged, setCodesAcknowledged] = useState(false);
  const [actionContext, setActionContext] = useState<TDisableContext>("disable");
  const [actionNeedsPassword, setActionNeedsPassword] = useState(false);
  const [actionPassword, setActionPassword] = useState("");
  const [actionCode, setActionCode] = useState("");
  const [copied, setCopied] = useState(false);

  const actionLoading = disableLoading || regenerateLoading;
  const authenticatorActive = status?.twoFactorMethod === "authenticator";
  const emailOtpActive = status?.twoFactorMethod === "email";

  const resetSetup = () => {
    setSetupStep(status?.hasPassword ? "confirm" : "qr");
    setEnrollData(null);
    setEnrollPassword("");
    setOtpCode("");
    setRecoveryCodes([]);
    setCodesAcknowledged(false);
  };

  const requestEnroll = async (password?: string) => {
    try {
      const res = await enrollTwoFactor(
        password ? { password } : {}
      ).unwrap();

      if (res?.success && res?.data?.qrCodeDataUrl) {
        setEnrollData({
          secret: res.data.secret,
          qrCodeDataUrl: res.data.qrCodeDataUrl,
          otpauthUrl: res.data.otpauthUrl,
        });
        setSetupStep("qr");
        setupDisclosure.onOpen();
      }
    } catch (error) {
      // Backend requires a recent password for accounts that have one (e.g.
      // when the status query was stale/failed) — recover by asking now.
      if (isPasswordRequiredError(error)) {
        setEnrollPassword("");
        setSetupStep("confirm");
        setupDisclosure.onOpen();
        return;
      }
      const message =
        (error as { data?: { message?: string } })?.data?.message ||
        "Could not start 2FA setup";

      toast.error(message);
    }
  };

  // Accounts with a password must re-authenticate first (backend requires
  // recent password confirmation); Google-only accounts start immediately.
  const handleStartEnroll = () => {
    if (status?.hasPassword) {
      setEnrollPassword("");
      setSetupStep("confirm");
      setupDisclosure.onOpen();
      return;
    }
    requestEnroll();
  };

  const handleConfirmPassword = () => {
    if (!enrollPassword) return;
    requestEnroll(enrollPassword);
  };

  const handleVerifyEnrollment = async () => {
    try {
      const res = await verifyEnrollment({ code: otpCode.trim() }).unwrap();

      if (res?.success && res?.data?.recoveryCodes) {
        setRecoveryCodes(res.data.recoveryCodes);
        setSetupStep("codes");
        setOtpCode("");
      }
    } catch (error) {
      const message =
        (error as { data?: { message?: string } })?.data?.message ||
        "Invalid verification code";

      toast.error(message);
    }
  };

  const handleFinishSetup = () => {
    if (!codesAcknowledged) return;
    setupDisclosure.onClose();
    resetSetup();
    toast.success(
      authenticatorActive
        ? "Authenticator app 2FA is active"
        : "Two-factor authentication switched to the authenticator app"
    );
    refetch();
  };

  const openAction = (context: TDisableContext) => {
    setActionContext(context);
    setActionPassword("");
    setActionCode("");
    setActionNeedsPassword(false);
    actionDisclosure.onOpen();
  };

  const handleAction = async () => {
    const body: { code?: string; password?: string } = {};

    // Email-method disable needs password re-auth only; the authenticator
    // method additionally needs the current factor as proof.
    if (authenticatorActive || actionContext === "regenerate") {
      body.code = actionCode.trim();
    }
    if (actionPassword) {
      body.password = actionPassword;
    }
    try {
      if (actionContext === "disable") {
        await disableTwoFactor(body).unwrap();
        toast.success("Two-factor authentication disabled");
      } else {
        const res = await regenerateCodes(body).unwrap();

        if (res?.success && res?.data?.recoveryCodes) {
          setRecoveryCodes(res.data.recoveryCodes);
          setCodesAcknowledged(false);
          actionDisclosure.onClose();
          setSetupStep("codes");
          setupDisclosure.onOpen();
          toast.success("New recovery codes generated");

          return;
        }
      }
      actionDisclosure.onClose();
      refetch();
    } catch (error) {
      if (isPasswordRequiredError(error)) {
        setActionNeedsPassword(true);
        toast.error("Confirm your password to continue");
        return;
      }
      const message =
        (error as { data?: { message?: string } })?.data?.message ||
        "Verification failed";

      toast.error(message);
    }
  };

  const handleCopyCodes = async () => {
    try {
      await navigator.clipboard.writeText(recoveryCodes.join("\n"));
      setCopied(true);
      toast.success("Recovery codes copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy — please copy manually");
    }
  };

  const codesStep = (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-default-600">
        Save these recovery codes somewhere safe. Each code can be used once if
        you lose access to your authenticator app.{" "}
        <strong>You will not be able to see them again.</strong>
      </p>
      <div className="bg-default-50 border border-default-200 rounded-lg p-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
        {recoveryCodes.map((code) => (
          <code
            key={code}
            className="font-mono text-sm text-sage-700 dark:text-sage-300"
          >
            {code}
          </code>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <Button
          className="secondary-button"
          size="sm"
          startContent={copied ? <FiCheck /> : <FiCopy />}
          onClick={handleCopyCodes}
        >
          {copied ? "Copied" : "Copy codes"}
        </Button>
      </div>
      <Checkbox
        isSelected={codesAcknowledged}
        onChange={() => setCodesAcknowledged(!codesAcknowledged)}
      >
        I have saved my recovery codes
      </Checkbox>
    </div>
  );

  const methodLabel =
    status?.twoFactorMethod === "authenticator"
      ? "Authenticator app"
      : status?.twoFactorMethod === "email"
        ? "Email OTP"
        : "Disabled";

  return (
    <div className="bg-default-100 border border-default-200 p-4 rounded-lg col-span-full">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-sage-700 dark:text-sage-300 flex items-center gap-2 mb-1">
            <FiShield /> Two-factor authentication
          </p>
          <p className="text-xs text-default-500 max-w-xl">
            Add a second step at sign-in. You pick exactly one method — an
            authenticator app or email codes — and it stays the only method
            until you change it.
          </p>
        </div>
        {isLoading || isFetching ? (
          <Chip color="default" size="sm" variant="flat">
            Loading...
          </Chip>
        ) : (
          <Chip
            color={status?.twoFactorEnabled ? "success" : "default"}
            size="sm"
            variant="flat"
          >
            {methodLabel}
          </Chip>
        )}
      </div>

      {/* Active method */}
      {!isLoading && status && (
        <div className="mt-4 flex flex-col gap-2">
          <p className="text-xs font-semibold text-default-600">
            Active sign-in method
          </p>
          <div className="flex flex-wrap gap-2">
            {status.twoFactorMethod === "none" ? (
              <Chip color="default" size="sm" variant="flat">
                None — password only
              </Chip>
            ) : (
              <>
                <Chip color="success" size="sm" variant="flat">
                  {authenticatorActive
                    ? "Authenticator app"
                    : `Email OTP — ${status.maskedEmail}`}
                </Chip>
                {authenticatorActive && (
                  <Chip color="default" size="sm" variant="flat">
                    Recovery codes
                  </Chip>
                )}
              </>
            )}
          </div>
          {authenticatorActive && (
            <p className="text-xs text-default-500 max-w-xl">
              Each sign-in asks for a 6-digit code from your authenticator app.
              Recovery codes work as a one-time fallback.
            </p>
          )}
          {emailOtpActive && (
            <p className="text-xs text-default-500 max-w-xl">
              Each sign-in emails a fresh 6-digit code to {status.maskedEmail}.
              Authenticator and recovery codes are not accepted while email OTP
              is active.
            </p>
          )}

          {!status.emailVerified && (
            <div className="mt-1 border border-default-200 rounded-lg p-3 flex flex-col gap-3">
              <p className="text-sm text-default-600 flex items-center gap-2">
                <FiMail /> Verify your account email to enable email OTP. We
                will email a 6-digit code (expires in 5 minutes).
              </p>
              {emailCodeSent && (
                <Input
                  className="max-w-xs"
                  label="Verification code"
                  placeholder="123456"
                  type="text"
                  value={emailCode}
                  onChange={(e) =>
                    setEmailCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                />
              )}
              <div className="flex flex-wrap gap-3">
                {emailCodeSent ? (
                  <>
                    <Button
                      className="secondary-button"
                      isDisabled={emailCooldown > 0 || emailSending}
                      isLoading={emailSending}
                      size="sm"
                      onClick={handleSendEmailVerification}
                    >
                      {emailCooldown > 0
                        ? `Resend in ${emailCooldown}s`
                        : "Resend code"}
                    </Button>
                    <Button
                      className="primary-button"
                      isDisabled={emailCode.length !== 6 || emailVerifying}
                      isLoading={emailVerifying}
                      size="sm"
                      onClick={handleVerifyEmailVerification}
                    >
                      Verify email
                    </Button>
                  </>
                ) : (
                  <Button
                    className="secondary-button"
                    isDisabled={emailSending || emailCooldown > 0}
                    isLoading={emailSending}
                    size="sm"
                    startContent={<FiMail />}
                    onClick={handleSendEmailVerification}
                  >
                    Send verification code
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-3 mt-4">
        {status?.twoFactorMethod === "none" && (
          <>
            <Button
              className="primary-button"
              isDisabled={isLoading}
              startContent={<FiShield />}
              onClick={handleStartEnroll}
            >
              Enable authenticator app
            </Button>
            <Button
              className="secondary-button"
              isDisabled={isLoading || !status?.emailVerified}
              startContent={<FiMail />}
              onClick={openEnableEmailOtp}
            >
              Enable email OTP
            </Button>
          </>
        )}
        {authenticatorActive && (
          <>
            <Button
              className="secondary-button"
              startContent={<FiRefreshCw />}
              onClick={() => openAction("regenerate")}
            >
              Regenerate recovery codes
            </Button>
            {status?.emailVerified && (
              <Button
                className="secondary-button"
                startContent={<FiMail />}
                onClick={openEnableEmailOtp}
              >
                Switch to email OTP
              </Button>
            )}
            <Button
              className="delete-button"
              onClick={() => openAction("disable")}
            >
              Disable 2FA
            </Button>
          </>
        )}
        {emailOtpActive && (
          <>
            <Button
              className="secondary-button"
              startContent={<FiShield />}
              onClick={handleStartEnroll}
            >
              Switch to authenticator app
            </Button>
            <Button
              className="delete-button"
              onClick={() => openAction("disable")}
            >
              Disable 2FA
            </Button>
          </>
        )}
      </div>
      {(enrollLoading || actionLoading || enableEmailSending) && <GlassLoader />}

      {/* Authenticator enrollment: QR + OTP verification + recovery codes */}
      <Modal
        isDismissable={false}
        isOpen={setupDisclosure.isOpen}
        size={setupStep === "codes" ? "lg" : "md"}
        onOpenChange={(open) => {
          if (!open) resetSetup();
          setupDisclosure.onOpenChange();
        }}
      >
        <ModalContent>
          <ModalHeader>
            <h2 className="text-xl font-bold text-sage-600 dark:text-sage-400">
              {setupStep === "confirm"
                ? "Confirm your password"
                : setupStep === "qr"
                  ? emailOtpActive
                    ? "Switch to authenticator app"
                    : "Set up authenticator app"
                  : "Save your recovery codes"}
            </h2>
          </ModalHeader>
          <ModalBody>
            {setupStep === "confirm" && (
              <div className="flex flex-col gap-4">
                <p className="text-sm text-default-600">
                  For your security, please re-enter your password to continue.
                </p>
                <Input
                  label="Password"
                  type="password"
                  value={enrollPassword}
                  onChange={(e) => setEnrollPassword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && enrollPassword) {
                      handleConfirmPassword();
                    }
                  }}
                />
              </div>
            )}
            {setupStep === "qr" && enrollData && (
              <div className="flex flex-col gap-4">
                <p className="text-sm text-default-600">
                  Scan this QR code with your authenticator app, or enter the
                  setup key manually. Then enter the 6-digit code it shows to
                  confirm.
                  {emailOtpActive &&
                    " Email codes will stop working once this is complete."}
                </p>
                <div className="flex justify-center">
                  <img
                    alt="Two-factor authentication QR code"
                    className="rounded-lg border border-default-200 bg-white p-2"
                    src={enrollData.qrCodeDataUrl}
                  />
                </div>
                <div>
                  <p className="text-xs text-default-500 mb-1">
                    Manual setup key
                  </p>
                  <code className="block break-all bg-default-50 border border-default-200 rounded p-2 text-sm">
                    {enrollData.secret}
                  </code>
                </div>
                <Input
                  isInvalid={otpCode.length > 0 && otpCode.length !== 6}
                  label="Verification code"
                  placeholder="123456"
                  type="text"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                />
              </div>
            )}
            {setupStep === "codes" && codesStep}
          </ModalBody>
          <ModalFooter className="flex items-center justify-end gap-3">
            {setupStep === "confirm" ? (
              <>
                <Button
                  className="cancel-button"
                  onClick={() => setupDisclosure.onClose()}
                >
                  Cancel
                </Button>
                <Button
                  className="primary-button"
                  isDisabled={!enrollPassword || enrollLoading}
                  isLoading={enrollLoading}
                  onClick={handleConfirmPassword}
                >
                  Continue
                </Button>
              </>
            ) : setupStep === "qr" ? (
              <>
                <Button
                  className="cancel-button"
                  onClick={() => setupDisclosure.onClose()}
                >
                  Cancel
                </Button>
                <Button
                  className="primary-button"
                  isDisabled={otpCode.trim().length < 6 || verifyEnrollLoading}
                  isLoading={verifyEnrollLoading}
                  onClick={handleVerifyEnrollment}
                >
                  Verify & enable
                </Button>
              </>
            ) : (
              <Button
                className="primary-button"
                isDisabled={!codesAcknowledged}
                onClick={handleFinishSetup}
              >
                Done
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Email-OTP enrollment — verify a code sent to the account email */}
      <Modal
        isOpen={emailOtpDisclosure.isOpen}
        size="md"
        onOpenChange={(open) => {
          if (!open) {
            setEnableCode("");
            setEnableCodeSent(false);
          }
          emailOtpDisclosure.onOpenChange();
        }}
      >
        <ModalContent>
          <ModalHeader>
            <h2 className="text-xl font-bold text-sage-600 dark:text-sage-400 flex items-center gap-2">
              <FiMail />
              Use email codes as your second factor?
            </h2>
          </ModalHeader>
          <ModalBody>
            <p className="text-sm text-default-600">
              We emailed a 6-digit code to {status?.maskedEmail}. Confirm it to
              make email OTP your only sign-in second factor.
              {authenticatorActive &&
                " Authenticator codes and recovery codes will stop being accepted at sign-in."}
            </p>
            <Input
              className="max-w-xs"
              label="Verification code"
              placeholder="123456"
              type="text"
              value={enableCode}
              onChange={(e) =>
                setEnableCode(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
            />
          </ModalBody>
          <ModalFooter className="flex items-center justify-end gap-3">
            <Button
              className="secondary-button"
              isDisabled={enableEmailSending || enableCooldown > 0}
              isLoading={enableEmailSending}
              size="sm"
              onClick={handleResendEnableEmailOtp}
            >
              {enableCooldown > 0
                ? `Resend in ${enableCooldown}s`
                : enableCodeSent
                  ? "Resend code"
                  : "Send code"}
            </Button>
            <Button
              className="cancel-button"
              onClick={() => emailOtpDisclosure.onClose()}
            >
              Cancel
            </Button>
            <Button
              className="primary-button"
              isDisabled={enableCode.length !== 6 || enableEmailVerifying}
              isLoading={enableEmailVerifying}
              onClick={handleVerifyEnableEmailOtp}
            >
              Verify & enable
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Disable / regenerate — method-aware proof required */}
      <Modal
        isOpen={actionDisclosure.isOpen}
        size="md"
        onOpenChange={actionDisclosure.onOpenChange}
      >
        <ModalContent>
          <ModalHeader>
            <h2 className="text-xl font-bold text-sage-600 dark:text-sage-400 flex items-center gap-2">
              <FiKey />
              {actionContext === "disable"
                ? "Disable two-factor authentication?"
                : "Regenerate recovery codes?"}
            </h2>
          </ModalHeader>
          <ModalBody>
            <p className="text-sm text-default-600">
              {actionContext === "disable"
                ? emailOtpActive
                  ? "Your account will return to password-only sign-in. Confirm your password to continue."
                  : "Your account will return to password-only sign-in. Active and pending authenticator secrets and unused recovery codes will be removed."
                : "All previous recovery codes will stop working. New codes will be shown once."}
            </p>
            <div className="flex flex-col gap-4">
              {(status?.hasPassword || actionNeedsPassword || emailOtpActive) && (
                <Input
                  label="Confirm password"
                  type="password"
                  value={actionPassword}
                  onChange={(e) => setActionPassword(e.target.value)}
                />
              )}
              {authenticatorActive && (
                <Input
                  label={
                    actionContext === "disable"
                      ? "Current code or recovery code"
                      : "Current code or recovery code"
                  }
                  placeholder="123456 or xxxxx-xxxxx-xxxxx-xxxxx"
                  type="text"
                  value={actionCode}
                  onChange={(e) => setActionCode(e.target.value)}
                />
              )}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              className="cancel-button"
              onClick={() => actionDisclosure.onClose()}
            >
              Cancel
            </Button>
            <Button
              className={actionContext === "disable" ? "delete-button" : "primary-button"}
              isDisabled={
                (authenticatorActive && actionCode.trim().length < 6) ||
                ((status?.hasPassword || actionNeedsPassword || emailOtpActive) &&
                  !actionPassword) ||
                actionLoading
              }
              isLoading={actionLoading}
              onClick={handleAction}
            >
              {actionContext === "disable" ? "Disable 2FA" : "Regenerate"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
