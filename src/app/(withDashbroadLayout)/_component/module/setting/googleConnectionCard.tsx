"use client";

import React, { useState } from "react";
import { Button } from "@nextui-org/button";
import { Input } from "@nextui-org/input";
import { Chip } from "@nextui-org/chip";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@nextui-org/modal";
import { FaGoogle } from "react-icons/fa";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";
import GlassLoader from "@/src/components/shared/glassLoader";
import {
  useTwoFactorStatusQuery,
  useUnlinkGoogleMutation,
} from "@/src/redux/features/auth/authApi";
import { useUser } from "@/src/hooks/useUser";

interface TTwoFactorStatus {
  twoFactorEnabled: boolean;
  googleLinked: boolean;
  hasPassword: boolean;
  twoFactorEnabledAt: string | null;
}

export default function GoogleConnectionCard() {
  const { userInfo } = useUser();
  const { data, isLoading, refetch } = useTwoFactorStatusQuery(undefined);
  const status = data?.data as TTwoFactorStatus | undefined;
  const [unlinkGoogle, { isLoading: unlinkLoading }] =
    useUnlinkGoogleMutation();
  const unlinkDisclosure = useDisclosure();
  const [password, setPassword] = useState("");
  const [needsPassword, setNeedsPassword] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const searchParams = useSearchParams();

  // Result feedback after returning from the /api/auth/google-link redirect.
  React.useEffect(() => {
    const linkResult = searchParams.get("googleLink");

    if (linkResult === "success") {
      toast.success("Google account connected");
      refetch();
    } else if (linkResult === "failed") {
      toast.error(
        "Could not connect Google. The Google account email must match your Aura Trip email."
      );
    }
  }, [searchParams, refetch]);

  const handleConnect = () => {
    if (isConnecting) return;
    setIsConnecting(true);
    signIn("google", { callbackUrl: "/api/auth/google-link" }).finally(() =>
      setIsConnecting(false)
    );
  };

  const handleUnlink = async () => {
    try {
      const body: { password?: string } = {};

      if (password) body.password = password;
      await unlinkGoogle(body).unwrap();
      toast.success("Google account disconnected");
      unlinkDisclosure.onClose();
      setPassword("");
      refetch();
    } catch (error) {
      const message =
        (error as { data?: { message?: string } })?.data?.message || "";

      if (message.includes("Password confirmation")) {
        setNeedsPassword(true);
        toast.error("Confirm your password to continue");
        return;
      }
      toast.error(message || "Could not disconnect Google");
    }
  };

  return (
    <div className="bg-default-100 border border-default-200 p-4 rounded-lg col-span-full">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-sage-700 dark:text-sage-300 flex items-center gap-2 mb-1">
            <FaGoogle /> Google account
          </p>
          <p className="text-xs text-default-500 max-w-xl">
            Connect your Google account to sign in with one click. The Google
            account email must match your Aura Trip account email.
          </p>
        </div>
        {isLoading ? (
          <Chip color="default" size="sm" variant="flat">
            Loading...
          </Chip>
        ) : (
          <Chip
            color={status?.googleLinked ? "success" : "default"}
            size="sm"
            variant="flat"
          >
            {status?.googleLinked ? "Connected" : "Not connected"}
          </Chip>
        )}
      </div>

      <div className="mt-3 text-xs text-default-500">
        {status?.googleLinked && userInfo?.email ? (
          <p>
            Connected as <strong>{userInfo.email}</strong>
          </p>
        ) : (
          <p>No Google account connected</p>
        )}
      </div>

      <div className="flex flex-wrap gap-3 mt-4">
        {!status?.googleLinked ? (
          <Button
            className="secondary-button"
            isDisabled={isConnecting}
            isLoading={isConnecting}
            startContent={isConnecting ? undefined : <FaGoogle />}
            onClick={handleConnect}
          >
            {isConnecting ? "Redirecting to Google..." : "Connect Google"}
          </Button>
        ) : (
          <Button
            className="delete-button"
            onClick={() => {
              setPassword("");
              setNeedsPassword(false);
              unlinkDisclosure.onOpen();
            }}
          >
            Disconnect Google
          </Button>
        )}
      </div>
      {(isConnecting || unlinkLoading) && <GlassLoader />}

      <Modal
        isOpen={unlinkDisclosure.isOpen}
        size="sm"
        onOpenChange={unlinkDisclosure.onOpenChange}
      >
        <ModalContent>
          <ModalHeader>
            <h2 className="text-xl font-bold text-sage-600 dark:text-sage-400">
              Disconnect Google?
            </h2>
          </ModalHeader>
          <ModalBody>
            <p className="text-sm text-default-600">
              You will no longer be able to sign in with Google.{" "}
              {!status?.hasPassword &&
                "Google is your only sign-in method — set a password first."}
            </p>
            {(status?.hasPassword || needsPassword) && (
              <Input
                label="Confirm password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            )}
          </ModalBody>
          <ModalFooter>
            <Button
              className="cancel-button"
              onClick={() => unlinkDisclosure.onClose()}
            >
              Cancel
            </Button>
            <Button
              className="delete-button"
              isDisabled={
                ((status?.hasPassword || needsPassword) && !password) ||
                unlinkLoading
              }
              isLoading={unlinkLoading}
              onClick={handleUnlink}
            >
              Disconnect
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
