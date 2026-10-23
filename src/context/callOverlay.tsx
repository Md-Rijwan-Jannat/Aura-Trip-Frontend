"use client";

// Full-screen call overlay: active-speaker stage + participant tile strip.
// Every remote participant is rendered in EXACTLY ONE place (stage or tiles)
// so their media plays once — no doubled audio.

import React, { useMemo } from "react";
import { Avatar } from "@nextui-org/avatar";
import { Button } from "@nextui-org/button";
import { Chip } from "@nextui-org/chip";
import {
  PhoneOff,
  Phone,
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneIncoming,
} from "lucide-react";
import { TUser } from "@/src/types";
import type { TCallState } from "./callContext";

const formatDuration = (total: number) =>
  `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;

/** Renders one participant's media exactly once (video, or avatar + audio). */
const ParticipantMedia: React.FC<{
  stream: MediaStream | null;
  isVideo: boolean;
  isSelf: boolean;
  /** Self previews never show when the camera is off. */
  cameraOff?: boolean;
  className?: string;
}> = ({ stream, isVideo, isSelf, cameraOff, className }) => {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const audioRef = React.useRef<HTMLAudioElement>(null);
  const hasVideoTrack =
    isVideo && !isSelf && !cameraOff && Boolean(stream?.getVideoTracks().length);

  React.useEffect(() => {
    if (hasVideoTrack && videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [hasVideoTrack, stream]);

  React.useEffect(() => {
    if (!hasVideoTrack && audioRef.current && stream && !isSelf) {
      audioRef.current.srcObject = stream;
    }
  }, [hasVideoTrack, stream, isSelf]);

  if (hasVideoTrack) {
    return (
      // eslint-disable-next-line jsx-a11y/media-has-caption -- live WebRTC stream cannot carry caption tracks
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isSelf}
        className={className ?? "w-full h-full object-cover"}
      />
    );
  }

  return (
    <>
      {stream && !isSelf && (
        // eslint-disable-next-line jsx-a11y/media-has-caption -- live WebRTC audio stream
        <audio ref={audioRef} autoPlay className="hidden" />
      )}
      <div
        className={
          className ??
          "w-full h-full flex items-center justify-center bg-default-800"
        }
      />
    </>
  );
};

const Tile: React.FC<{
  id: string;
  name: string;
  image?: string;
  stream: MediaStream | null;
  isVideo: boolean;
  isSelf: boolean;
  cameraOff: boolean;
  active: boolean;
  compact?: boolean;
}> = ({ id, name, image, stream, isVideo, isSelf, cameraOff, active, compact }) => (
  <div
    key={id}
    className={`relative shrink-0 w-24 h-16 md:w-28 md:h-20 rounded-lg overflow-hidden border transition-all ${
      active
        ? "border-sage-400 ring-2 ring-sage-400/70"
        : "border-white/10"
    } bg-default-900`}
  >
    <ParticipantMedia
      stream={stream}
      isVideo={isVideo}
      isSelf={isSelf}
      cameraOff={cameraOff}
      className="w-full h-full object-cover"
    />
    {!(isVideo && !isSelf && !cameraOff && stream?.getVideoTracks().length) && (
      <div className="absolute inset-0 flex items-center justify-center">
        <Avatar
          name={name.charAt(0).toUpperCase()}
          src={image || undefined}
          className={compact ? "w-8 h-8" : "w-10 h-10"}
        />
      </div>
    )}
    <span className="absolute bottom-0 inset-x-0 px-1.5 py-0.5 text-[9px] text-white bg-black/50 truncate">
      {isSelf ? `${name} (you)` : name}
    </span>
  </div>
);

export interface CallOverlayProps {
  callState: TCallState;
  peer?: TUser;
  chatTitle?: string;
  chatUsers: TUser[];
  me?: TUser;
  localStream: MediaStream | null;
  remoteStreams: Record<string, MediaStream>;
  activeSpeakerId: string | null;
  muted: boolean;
  cameraOff: boolean;
  durationSeconds: number;
  linkState: "connecting" | "connected" | "failed";
  onAccept: () => void;
  onReject: () => void;
  onEnd: () => void;
  onToggleMute: () => void;
  onToggleCamera: () => void;
}

const CallOverlay: React.FC<CallOverlayProps> = ({
  callState,
  peer,
  chatTitle,
  chatUsers,
  me,
  localStream,
  remoteStreams,
  activeSpeakerId,
  muted,
  cameraOff,
  durationSeconds,
  linkState,
  onAccept,
  onReject,
  onEnd,
  onToggleMute,
  onToggleCamera,
}) => {
  const remoteVideoRef = React.useRef<HTMLVideoElement>(null);

  const isVideo = callState.mediaType === "VIDEO";
  const isGroup = callState.isGroupCall;
  const myId = me?._id ?? "";

  const userById = useMemo(() => {
    const map = new Map<string, TUser>();

    for (const u of chatUsers) map.set(u._id, u);
    if (me) map.set(me._id, me);

    return map;
  }, [chatUsers, me]);

  const nameOf = (id: string) =>
    id === myId
      ? (me?.name ?? "You")
      : (userById.get(id)?.name ?? "Member");

  const imageOf = (id: string) =>
    id === myId ? (me?.image ?? undefined) : (userById.get(id)?.image ?? undefined);

  // Full roster: group = live participants; DM = peer + self.
  const roster = useMemo(() => {
    const set = new Set<string>(callState.participants);

    if (callState.peerId) set.add(callState.peerId);
    if (myId) set.add(myId);

    return Array.from(set).filter(Boolean);
  }, [callState.participants, callState.peerId, myId]);

  // Big stage: active speaker (never self); DM falls back to the peer.
  const bigId = useMemo(() => {
    if (
      activeSpeakerId &&
      activeSpeakerId !== myId &&
      roster.includes(activeSpeakerId)
    ) {
      return activeSpeakerId;
    }
    const other = roster.find((id) => id !== myId);

    return other ?? null;
  }, [activeSpeakerId, myId, roster]);

  const bigStream = bigId ? (remoteStreams[bigId] ?? null) : null;
  const tileIds = roster.filter((id) => id !== bigId);

  const title = isGroup
    ? (chatTitle || "Group call")
    : (peer?.name ?? "Aura Trip user");
  const bigName = bigId ? nameOf(bigId) : title;
  const bigImage = bigId ? imageOf(bigId) : (peer?.image ?? undefined);

  if (callState.status === "idle") return null;

  const header = (
    <div className="absolute top-6 inset-x-0 text-center text-white z-10 px-4">
      <p className="text-sm font-semibold truncate">{title}</p>
      <p className="text-xs opacity-70 mt-1">
        {callState.status === "outgoing" &&
          (isGroup
            ? `Ringing ${callState.inviteeCount || "group"}…`
            : "Calling…")}
        {callState.status === "incoming" &&
          (isGroup
            ? `Group call · ${isVideo ? "video" : "audio"}`
            : isVideo
              ? "Incoming video call"
              : "Incoming audio call")}
        {callState.status === "connecting" && "Connecting…"}
        {callState.status === "active" &&
          (linkState === "connected"
            ? formatDuration(durationSeconds)
            : "Connecting…")}
        {callState.status === "ended" && (callState.reason ?? "Call ended")}
      </p>
      {isGroup && callState.status !== "incoming" && (
        <Chip
          size="sm"
          variant="flat"
          className="mt-2 bg-white/15 text-white"
        >
          {Math.max(callState.participants.length, isVideo ? 1 : 1)} in call ·
          max 8
        </Chip>
      )}
      {callState.status === "active" && linkState === "failed" && (
        <p className="text-[11px] text-amber-400 mt-1">
          Connection interrupted — trying to recover…
        </p>
      )}
    </div>
  );

  const controls =
    callState.status === "connecting" || callState.status === "active" ? (
      <div className="absolute bottom-8 inset-x-0 flex items-center justify-center gap-4 z-20">
        <Button
          isIconOnly
          size="lg"
          radius="full"
          className={muted ? "bg-danger-500 text-white" : "bg-white/15 text-white"}
          aria-label={muted ? "Unmute" : "Mute"}
          onPress={onToggleMute}
        >
          {muted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
        </Button>
        {isVideo && (
          <Button
            isIconOnly
            size="lg"
            radius="full"
            className={
              cameraOff ? "bg-danger-500 text-white" : "bg-white/15 text-white"
            }
            aria-label={cameraOff ? "Start camera" : "Stop camera"}
            onPress={onToggleCamera}
          >
            {cameraOff ? (
              <VideoOff className="h-5 w-5" />
            ) : (
              <Video className="h-5 w-5" />
            )}
          </Button>
        )}
        <Button
          size="lg"
          radius="full"
          className="bg-danger-600 text-white px-6"
          startContent={<PhoneOff className="h-5 w-5" />}
          aria-label="End call"
          onPress={onEnd}
        >
          End
        </Button>
      </div>
    ) : null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="relative w-full h-full max-w-4xl max-h-[92vh] my-auto flex flex-col">
        {header}

        {/* Stage: active speaker (large), or waiting/ended states */}
        {callState.status === "incoming" ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-6 pt-24">
            <Avatar
              name={(peer?.name ?? title).charAt(0).toUpperCase()}
              src={peer?.image || undefined}
              className="w-28 h-28 text-4xl"
            />
            <div className="flex items-center gap-4">
              <Button
                size="lg"
                radius="full"
                className="bg-danger-600 text-white px-6"
                startContent={<PhoneOff className="h-5 w-5" />}
                aria-label="Decline call"
                onPress={onReject}
              >
                Decline
              </Button>
              <Button
                size="lg"
                radius="full"
                className="bg-emerald-600 text-white animate-pulse px-6"
                startContent={<Phone className="h-5 w-5" />}
                aria-label="Accept call"
                onPress={onAccept}
              >
                Accept
              </Button>
            </div>
          </div>
        ) : callState.status === "outgoing" ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-6 pt-24">
            <Avatar
              name={(isGroup ? title : peer?.name ?? title).charAt(0).toUpperCase()}
              src={!isGroup ? (peer?.image || undefined) : undefined}
              className="w-28 h-28 text-4xl"
            />
            <div className="flex items-center gap-3 text-white/60 text-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
              </span>
              {isGroup && callState.inviteeCount > 0
                ? `Ringing ${callState.inviteeCount} ${callState.inviteeCount === 1 ? "person" : "people"}…`
                : "Ringing…"}
            </div>
            <Button
              size="lg"
              radius="full"
              className="bg-danger-600 text-white px-6"
              startContent={<PhoneOff className="h-5 w-5" />}
              aria-label="Cancel call"
              onPress={onEnd}
            >
              Cancel
            </Button>
          </div>
        ) : callState.status === "ended" ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <Avatar
              name={(isGroup ? title : peer?.name ?? title).charAt(0).toUpperCase()}
              src={!isGroup ? (peer?.image || undefined) : undefined}
              className="w-24 h-24 text-3xl opacity-60"
            />
            <p className="text-white/80 text-sm flex items-center gap-2">
              <PhoneIncoming className="h-4 w-4 opacity-60" />
              {callState.reason ?? "Call ended"}
            </p>
          </div>
        ) : (
          /* connecting / active → active-speaker stage */
          <div className="flex-1 min-h-0 flex items-center justify-center overflow-hidden rounded-2xl mt-16 mb-28">
            {bigId ? (
              <div
                className={`relative w-full h-full overflow-hidden rounded-2xl ${
                  activeSpeakerId === bigId
                    ? "ring-2 ring-sage-400/70"
                    : ""
                }`}
              >
                <ParticipantMedia
                  stream={bigStream}
                  isVideo={isVideo}
                  isSelf={bigId === myId}
                  cameraOff={false}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <Avatar
                    name={bigName.charAt(0).toUpperCase()}
                    src={bigImage || undefined}
                    className={`w-28 h-28 text-4xl ${
                      bigStream ? "hidden" : ""
                    }`}
                  />
                </div>
                <span className="absolute bottom-3 left-3 px-2 py-1 rounded bg-black/50 text-white text-xs">
                  {bigName}
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 text-white/70">
                <Avatar
                  name={title.charAt(0).toUpperCase()}
                  className="w-24 h-24 text-3xl"
                />
                <p className="text-xs">Waiting for others to join…</p>
              </div>
            )}
          </div>
        )}

        {/* Self preview (video only, muted) */}
        {(callState.status === "connecting" || callState.status === "active") &&
          isVideo &&
          localStream &&
          !cameraOff && (
            <div className="absolute bottom-28 right-4 w-28 h-36 md:w-32 md:h-44 overflow-hidden rounded-lg border border-white/20 bg-black z-20">
              {/* eslint-disable-next-line jsx-a11y/media-has-caption -- live WebRTC stream */}
              <SelfPreview stream={localStream} />
            </div>
          )}

        {/* Participant tile strip (every member not on stage, plus self) */}
        {(callState.status === "connecting" || callState.status === "active") &&
          roster.length > 1 && (
            <div className="absolute bottom-[8.5rem] md:bottom-[9rem] inset-x-0 z-20 overflow-x-auto scrollbar-hide px-4">
              <div className="flex items-end gap-2 w-max mx-auto pb-1">
                {callState.status === "active" &&
                  roster.map((id) => (
                    <Tile
                      key={id}
                      id={id}
                      name={nameOf(id)}
                      image={imageOf(id)}
                      stream={id === myId ? null : (remoteStreams[id] ?? null)}
                      isVideo={isVideo}
                      isSelf={id === myId}
                      cameraOff={id === myId && cameraOff}
                      active={activeSpeakerId === id}
                    />
                  ))}
                {callState.status !== "active" &&
                  tileIds.map((id) => (
                    <Tile
                      key={id}
                      id={id}
                      name={nameOf(id)}
                      image={imageOf(id)}
                      stream={remoteStreams[id] ?? null}
                      isVideo={isVideo}
                      isSelf={false}
                      cameraOff={false}
                      active={false}
                      compact
                    />
                  ))}
              </div>
            </div>
          )}

        {controls}
      </div>
    </div>
  );
};

const SelfPreview: React.FC<{ stream: MediaStream }> = ({ stream }) => {
  const ref = React.useRef<HTMLVideoElement>(null);

  React.useEffect(() => {
    if (ref.current) ref.current.srcObject = stream;
  }, [stream]);

  return (
    // eslint-disable-next-line jsx-a11y/media-has-caption -- live WebRTC stream
    <video
      ref={ref}
      autoPlay
      playsInline
      muted
      className="w-full h-full object-cover"
    />
  );
};

export default CallOverlay;
