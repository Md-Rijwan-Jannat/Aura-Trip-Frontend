"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";
import { useSocket } from "./socketProvider";
import { useUser } from "@/src/hooks/useUser";
import { useGetSingleChatQuery } from "@/src/redux/features/message/chatApi";
import { TChat, TUser } from "@/src/types";
import CallOverlay from "./callOverlay";

export type TCallMediaType = "AUDIO" | "VIDEO";

export type TCallStatus =
  | "idle"
  | "outgoing"
  | "incoming"
  | "connecting"
  | "active"
  | "ended";

export interface TCallState {
  status: TCallStatus;
  callId: string | null;
  chatId: string | null;
  mediaType: TCallMediaType;
  peerId: string | null;
  reason: string | null;
  /** True for group-chat calls (mesh roster instead of a DM pair). */
  isGroupCall: boolean;
  /** Live roster (group). The starter is present from invite. */
  participants: string[];
  /** How many members were rung (group outgoing). */
  inviteeCount: number;
}

interface TCallContextValue {
  callState: TCallState;
  startCall: (chatId: string, mediaType: TCallMediaType) => Promise<void>;
  acceptCall: () => Promise<void>;
  rejectCall: () => void;
  endCall: () => void;
  toggleMute: () => void;
  toggleCamera: () => void;
  muted: boolean;
  cameraOff: boolean;
  durationSeconds: number;
  linkState: "connecting" | "connected" | "failed";
}

const CallContext = createContext<TCallContextValue | null>(null);

export const useCall = () => {
  const ctx = useContext(CallContext);
  if (!ctx) throw new Error("useCall must be used inside CallProvider");
  return ctx;
};

const IDLE_STATE: TCallState = {
  status: "idle",
  callId: null,
  chatId: null,
  mediaType: "AUDIO",
  peerId: null,
  reason: null,
  isGroupCall: false,
  participants: [],
  inviteeCount: 0,
};

const ICE_SERVERS: RTCIceServer[] = [
  {
    urls: [
      "stun:stun.l.google.com:19302",
      "stun:stun1.l.google.com:19302",
      "stun:stun2.l.google.com:19302",
    ],
  },
];

const ENDED_RESET_MS = 3000;
const RING_TIMEOUT_MS = 60_000;
/** If the backend never acknowledges an invite (stale server / dead socket),
 * stop waiting so the caller always gets a working cancel path back. */
const INVITE_ACK_TIMEOUT_MS = 8000;

type TPeerEntry = {
  pc: RTCPeerConnection;
  pending: RTCIceCandidateInit[];
};

export const CallProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const socket = useSocket();
  const { userInfo } = useUser();
  const myId = userInfo?._id ?? null;

  const [callState, setCallState] = useState<TCallState>(IDLE_STATE);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Record<string, MediaStream>>(
    {},
  );
  const [muted, setMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [activeSpeakerId, setActiveSpeakerId] = useState<string | null>(null);
  const [linkState, setLinkState] = useState<
    "connecting" | "connected" | "failed"
  >("connecting");

  // One RTCPeerConnection per remote participant (mesh).
  const peersRef = useRef<Map<string, TPeerEntry>>(new Map());
  const peerPromisesRef = useRef<Map<string, Promise<RTCPeerConnection>>>(
    new Map(),
  );
  const localStreamRef = useRef<MediaStream | null>(null);
  const callIdRef = useRef<string | null>(null);
  const mediaTypeRef = useRef<TCallMediaType>("AUDIO");
  const statusRef = useRef<TCallStatus>("idle");
  const peerIdRef = useRef<string | null>(null);
  const myIdRef = useRef<string | null>(null);
  const ringTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const endedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inviteTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  statusRef.current = callState.status;
  myIdRef.current = myId;

  const { data: chatData } = useGetSingleChatQuery(callState.chatId ?? "", {
    skip: !callState.chatId,
  });
  const chat: TChat | undefined = chatData?.data;
  const chatUsers: TUser[] = useMemo(() => chat?.users ?? [], [chat]);
  const peer: TUser | undefined = useMemo(() => {
    if (!chatUsers.length) return undefined;
    if (callState.peerId) {
      return chatUsers.find((u) => u._id === callState.peerId);
    }
    return chatUsers.find((u) => u._id !== myId);
  }, [chatUsers, callState.peerId, myId]);

  const clearRingTimer = () => {
    if (ringTimerRef.current) {
      clearTimeout(ringTimerRef.current);
      ringTimerRef.current = null;
    }
  };

  const clearEndedTimer = () => {
    if (endedTimerRef.current) {
      clearTimeout(endedTimerRef.current);
      endedTimerRef.current = null;
    }
  };

  const clearInviteTimer = () => {
    if (inviteTimerRef.current) {
      clearTimeout(inviteTimerRef.current);
      inviteTimerRef.current = null;
    }
  };

  /** Aggregate every peer connection into one link-health state. */
  const recomputeLink = useCallback(() => {
    const entries = Array.from(peersRef.current.values());
    if (entries.length === 0) {
      setLinkState("connecting");
      return;
    }
    const states = entries.map((e) => e.pc.connectionState);
    if (states.some((s) => s === "connected")) setLinkState("connected");
    else if (states.some((s) => s === "failed" || s === "disconnected"))
      setLinkState("failed");
    else setLinkState("connecting");
  }, []);

  const closePeer = useCallback(
    (remoteId: string) => {
      const entry = peersRef.current.get(remoteId);
      if (entry) {
        entry.pc.onicecandidate = null;
        entry.pc.ontrack = null;
        entry.pc.onconnectionstatechange = null;
        try {
          entry.pc.close();
        } catch {
          // already closed
        }
        peersRef.current.delete(remoteId);
      }
      peerPromisesRef.current.delete(remoteId);
      setRemoteStreams((prev) => {
        if (!(remoteId in prev)) return prev;
        const next = { ...prev };
        delete next[remoteId];
        return next;
      });
      setActiveSpeakerId((prev) => (prev === remoteId ? null : prev));
      recomputeLink();
    },
    [recomputeLink],
  );

  const closeAllPeers = useCallback(() => {
    for (const remoteId of Array.from(peersRef.current.keys())) {
      closePeer(remoteId);
    }
    peerPromisesRef.current.clear();
    setRemoteStreams({});
    setActiveSpeakerId(null);
  }, [closePeer]);

  const teardown = useCallback(() => {
    clearRingTimer();
    clearInviteTimer();
    closeAllPeers();
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;
    setLocalStream(null);
    setMuted(false);
    setCameraOff(false);
    setDurationSeconds(0);
    setLinkState("connecting");
  }, [closeAllPeers]);

  const goEnded = useCallback(
    (reason: string, keepCallId = false) => {
      teardown();
      clearEndedTimer();
      setCallState((prev) => ({
        ...prev,
        status: "ended",
        callId: keepCallId ? prev.callId : null,
        reason,
        participants: [],
      }));
      endedTimerRef.current = setTimeout(() => {
        setCallState(IDLE_STATE);
      }, ENDED_RESET_MS);
    },
    [teardown],
  );

  const getLocalStream = useCallback(async (mediaType: TCallMediaType) => {
    if (localStreamRef.current) return localStreamRef.current;
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: mediaType === "VIDEO",
    });
    localStreamRef.current = stream;
    setLocalStream(stream);
    return stream;
  }, []);

  /** Ensure (and memoize) the peer connection for one remote participant. */
  const ensurePeerFor = useCallback(
    (remoteId: string): Promise<RTCPeerConnection> => {
      const existing = peersRef.current.get(remoteId);
      if (existing) return Promise.resolve(existing.pc);
      const inFlight = peerPromisesRef.current.get(remoteId);
      if (inFlight) return inFlight;

      const creation = (async () => {
        const stream = await getLocalStream(mediaTypeRef.current);
        const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });

        pc.onicecandidate = (event) => {
          if (event.candidate && callIdRef.current && socket) {
            socket.emit("call:signal", {
              callId: callIdRef.current,
              kind: "candidate",
              candidate: JSON.stringify(event.candidate.toJSON()),
              to: remoteId,
            });
          }
        };

        pc.ontrack = (event) => {
          const incoming = event.streams[0] ?? new MediaStream([event.track]);
          setRemoteStreams((prev) => {
            if (prev[remoteId]?.id === incoming.id) return prev;
            return { ...prev, [remoteId]: incoming };
          });
        };

        pc.onconnectionstatechange = () => recomputeLink();

        stream.getTracks().forEach((track) => pc.addTrack(track, stream));
        peersRef.current.set(remoteId, { pc, pending: [] });
        return pc;
      })();

      peerPromisesRef.current.set(remoteId, creation);
      creation
        .catch(() => {
          peerPromisesRef.current.delete(remoteId);
        })
        .finally(() => {
          peerPromisesRef.current.delete(remoteId);
        });

      return creation;
    },
    [getLocalStream, socket, recomputeLink],
  );

  const flushCandidates = useCallback(async (remoteId: string) => {
    const entry = peersRef.current.get(remoteId);
    if (!entry || !entry.pc.remoteDescription) return;
    const buffered = entry.pending;
    entry.pending = [];
    for (const raw of buffered) {
      try {
        await entry.pc.addIceCandidate(new RTCIceCandidate(raw));
      } catch {
        // candidate raced the description; safe to drop
      }
    }
  }, []);

  /** Newcomer/caller side: negotiate a link to one remote participant. */
  const createOfferTo = useCallback(
    async (remoteId: string) => {
      if (!socket || !callIdRef.current) return;
      try {
        const pc = await ensurePeerFor(remoteId);
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit("call:signal", {
          callId: callIdRef.current,
          kind: "offer",
          sdp: offer.sdp,
          to: remoteId,
        });
      } catch {
        goEnded("Could not start the call");
      }
    },
    [socket, ensurePeerFor, goEnded],
  );

  // ---------------------------------------------------------------------
  // Socket listeners
  // ---------------------------------------------------------------------
  useEffect(() => {
    if (!socket) return;

    socket.on("call:outgoing", (payload: {
      callId: string;
      chatId: string;
      mediaType: TCallMediaType;
      callee: string | null;
      isGroupCall?: boolean;
      participants?: string[];
      inviteeCount?: number;
    }) => {
      clearInviteTimer();
      callIdRef.current = payload.callId;
      mediaTypeRef.current = payload.mediaType;
      peerIdRef.current = payload.callee;
      setCallState({
        status: "outgoing",
        callId: payload.callId,
        chatId: payload.chatId,
        mediaType: payload.mediaType,
        peerId: payload.callee,
        reason: null,
        isGroupCall: Boolean(payload.isGroupCall),
        participants: (payload.participants ?? []).map(String),
        inviteeCount: payload.inviteeCount ?? 0,
      });
      clearRingTimer();
      ringTimerRef.current = setTimeout(() => {
        if (statusRef.current === "outgoing" && callIdRef.current) {
          socket.emit("call:end", { callId: callIdRef.current });
          goEnded("No answer");
        }
      }, RING_TIMEOUT_MS);
    });

    socket.on("call:incoming", (payload: {
      callId: string;
      chatId: string;
      mediaType: TCallMediaType;
      caller: string;
      isGroupCall?: boolean;
    }) => {
      if (statusRef.current !== "idle" && statusRef.current !== "ended") return;
      clearEndedTimer();
      clearInviteTimer();
      const isGroup = Boolean(payload.isGroupCall);
      callIdRef.current = payload.callId;
      mediaTypeRef.current = payload.mediaType;
      peerIdRef.current = payload.caller;
      setCallState({
        status: "incoming",
        callId: payload.callId,
        chatId: payload.chatId,
        mediaType: payload.mediaType,
        peerId: payload.caller,
        reason: null,
        isGroupCall: isGroup,
        participants: [],
        inviteeCount: 0,
      });
      clearRingTimer();
      ringTimerRef.current = setTimeout(() => {
        if (statusRef.current === "incoming" && callIdRef.current) {
          if (isGroup) {
            // Personal decline: the call keeps ringing for everyone else.
            socket.emit("call:reject", { callId: callIdRef.current });
          } else {
            socket.emit("call:end", { callId: callIdRef.current });
          }
          teardown();
          setCallState(IDLE_STATE);
        }
      }, RING_TIMEOUT_MS);
    });

    // DM: the callee accepted — this side (caller) creates the offer.
    socket.on("call:accepted", (payload: { callId: string }) => {
      if (payload.callId !== callIdRef.current) return;
      clearRingTimer();
      setCallState((prev) => ({ ...prev, status: "connecting" }));
      const remote = peerIdRef.current;
      if (remote) void createOfferTo(remote);
    });

    // Group: WE joined (accept or press-call-to-join). The roster is the set
    // of peers we must open links to — newcomer-offers mesh rule.
    socket.on("call:joined", (payload: {
      callId: string;
      chatId: string;
      mediaType: TCallMediaType;
      participants: string[];
    }) => {
      if (payload.callId !== callIdRef.current) return;
      clearRingTimer();
      clearInviteTimer();
      mediaTypeRef.current = payload.mediaType;
      const roster = (payload.participants ?? []).map(String);
      setCallState((prev) => ({
        ...prev,
        status: "connecting",
        callId: payload.callId,
        chatId: payload.chatId,
        mediaType: payload.mediaType,
        isGroupCall: true,
        participants: roster,
      }));
      const me = myIdRef.current;
      for (const remoteId of roster) {
        if (remoteId !== me) void createOfferTo(remoteId);
      }
    });

    // Group: another member entered the room (we wait for THEIR offer).
    socket.on("call:participant-joined", (payload: {
      callId: string;
      userId: string;
      participants?: string[];
    }) => {
      if (payload.callId !== callIdRef.current) return;
      setCallState((prev) => {
        const participants =
          payload.participants?.map(String) ?? [
            ...prev.participants,
            payload.userId,
          ];
        const status =
          prev.status === "outgoing"
            ? ("connecting" as TCallStatus)
            : prev.status;
        return { ...prev, status, participants };
      });
    });

    // Group: a member left — tear down just that link.
    socket.on("call:participant-left", (payload: {
      callId: string;
      userId: string;
      participants?: string[];
    }) => {
      if (payload.callId !== callIdRef.current) return;
      closePeer(payload.userId);
      setCallState((prev) => ({
        ...prev,
        participants:
          payload.participants?.map(String) ??
          prev.participants.filter((p) => p !== payload.userId),
      }));
    });

    // Group: someone still ringing declined personally — ring continues.
    socket.on("call:declined", (payload: { callId: string; userId: string }) => {
      if (payload.callId !== callIdRef.current) return;
      const name =
        chatUsers.find((u) => u._id === payload.userId)?.name ?? "Someone";
      toast.info(`${name} declined the call`);
    });

    // Group: someone else picked the call up — stop our ring.
    socket.on("call:answered", (payload: { callId: string }) => {
      if (payload.callId !== callIdRef.current) return;
      if (statusRef.current !== "incoming") return;
      clearRingTimer();
      goEnded("Call already started");
    });

    socket.on("call:rejected", (payload: { callId: string }) => {
      if (payload.callId !== callIdRef.current) return;
      goEnded("Call declined");
    });

    socket.on("call:ended", (payload: {
      callId: string;
      status?: string;
      durationSeconds?: number;
    }) => {
      if (payload.callId !== callIdRef.current) return;
      const duration = payload.durationSeconds ?? 0;
      const label =
        payload.status === "REJECTED"
          ? "Call declined"
          : payload.status === "MISSED"
            ? "Missed call"
            : payload.status === "CANCELLED"
              ? "Call cancelled"
              : duration > 0
                ? `Call ended · ${Math.floor(duration / 60)}:${String(
                    duration % 60,
                  ).padStart(2, "0")}`
                : "Call ended";
      goEnded(label);
    });

    socket.on("call:signal", (payload: {
      callId: string;
      kind: "offer" | "answer" | "candidate";
      sdp?: string;
      candidate?: string;
      from?: string;
      to?: string;
    }) => {
      if (payload.callId !== callIdRef.current) return;
      const from = payload.from;
      if (!from) return;
      // Mesh signals are addressed; ignore anything meant for someone else.
      if (payload.to && payload.to !== myIdRef.current) return;

      void (async () => {
        try {
          if (payload.kind === "candidate") {
            if (!payload.candidate) return;
            const raw = JSON.parse(payload.candidate) as RTCIceCandidateInit;
            const entry = peersRef.current.get(from);
            if (entry && entry.pc.remoteDescription) {
              await entry.pc.addIceCandidate(new RTCIceCandidate(raw));
              return;
            }
            if (entry) {
              entry.pending.push(raw);
              return;
            }
            // Candidate before any local peer exists → create it, then buffer.
            await ensurePeerFor(from);
            const created = peersRef.current.get(from);
            if (created && created.pc.remoteDescription) {
              await created.pc.addIceCandidate(new RTCIceCandidate(raw));
            } else if (created) {
              created.pending.push(raw);
            }
            return;
          }

          const pc = await ensurePeerFor(from);

          if (payload.kind === "offer" && payload.sdp) {
            await pc.setRemoteDescription({
              type: "offer",
              sdp: payload.sdp,
            });
            await flushCandidates(from);
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            socket.emit("call:signal", {
              callId: payload.callId,
              kind: "answer",
              sdp: answer.sdp,
              to: from,
            });
            setCallState((prev) =>
              prev.status === "connecting" || prev.status === "incoming"
                ? { ...prev, status: "active" }
                : prev,
            );
          } else if (payload.kind === "answer" && payload.sdp) {
            await pc.setRemoteDescription({
              type: "answer",
              sdp: payload.sdp,
            });
            await flushCandidates(from);
            setCallState((prev) =>
              prev.status === "connecting"
                ? { ...prev, status: "active" }
                : prev,
            );
          }
        } catch {
          // Malformed or out-of-order signal — the link will retry via ICE.
        }
      })();
    });

    socket.on("call:error", (payload: { message?: string }) => {
      toast.error(payload?.message || "Call failed");
      const status = statusRef.current;
      if (
        (status === "outgoing" && !callIdRef.current) ||
        status === "incoming" ||
        status === "connecting"
      ) {
        // Invite never started, ring/accept failed (e.g. call is full) → reset.
        teardown();
        setCallState(IDLE_STATE);
      }
    });

    return () => {
      socket.off("call:outgoing");
      socket.off("call:incoming");
      socket.off("call:accepted");
      socket.off("call:joined");
      socket.off("call:participant-joined");
      socket.off("call:participant-left");
      socket.off("call:declined");
      socket.off("call:answered");
      socket.off("call:rejected");
      socket.off("call:ended");
      socket.off("call:signal");
      socket.off("call:error");
    };
  }, [
    socket,
    createOfferTo,
    ensurePeerFor,
    flushCandidates,
    goEnded,
    teardown,
    closePeer,
    chatUsers,
  ]);

  // Duration ticker while the call is live.
  useEffect(() => {
    if (callState.status !== "active") return;
    const timer = setInterval(() => {
      setDurationSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [callState.status]);

  // Active-speaker detection: poll inbound audio levels across the mesh.
  useEffect(() => {
    if (callState.status !== "active" && callState.status !== "connecting") {
      setActiveSpeakerId(null);
      return;
    }
    const timer = setInterval(() => {
      const entries = Array.from(peersRef.current.entries());
      if (entries.length === 0) return;
      void Promise.all(
        entries.map(
          async ([id, { pc }]): Promise<{ id: string; level: number }> => {
            let level = 0;
            try {
              const report = await pc.getStats();
              report.forEach((stat: any) => {
                const s = stat as {
                  type?: string;
                  kind?: string;
                  audioLevel?: number;
                };
                if (
                  s.type === "inbound-rtp" &&
                  s.kind === "audio" &&
                  typeof s.audioLevel === "number"
                ) {
                  level = Math.max(level, s.audioLevel);
                }
              });
            } catch {
              // stats unavailable for this peer
            }
            return { id, level };
          },
        ),
      ).then((results) => {
        let best: { id: string; level: number } | null = null;
        for (const r of results) {
          if (r.level > 0.05 && (!best || r.level > best.level)) best = r;
        }
        if (best) {
          setActiveSpeakerId((prev) => (prev === best!.id ? prev : best!.id));
        }
      });
    }, 1200);
    return () => clearInterval(timer);
  }, [callState.status]);

  // Unmount cleanup.
  useEffect(() => {
    return () => {
      clearRingTimer();
      clearEndedTimer();
      clearInviteTimer();
      closeAllPeers();
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------
  const startCall = useCallback(
    async (chatId: string, mediaType: TCallMediaType) => {
      if (!socket) {
        toast.error("Connecting to the server…");
        return;
      }
      if (statusRef.current !== "idle" && statusRef.current !== "ended") {
        toast.error("You are already in a call");
        return;
      }
      clearEndedTimer();
      mediaTypeRef.current = mediaType;
      callIdRef.current = null;
      peerIdRef.current = null;
      setCallState({
        status: "outgoing",
        callId: null,
        chatId,
        mediaType,
        peerId: null,
        reason: null,
        isGroupCall: false,
        participants: [],
        inviteeCount: 0,
      });
      try {
        await getLocalStream(mediaType);
      } catch {
        setCallState(IDLE_STATE);
        toast.error("Microphone/camera access was denied");
        return;
      }
      socket.emit("call:invite", { chatId, mediaType });

      // Fallback: if no "call:outgoing" ack arrives, leave the ringing state
      // so the cancel button and the UI never get stuck on "Calling…".
      clearInviteTimer();
      inviteTimerRef.current = setTimeout(() => {
        if (statusRef.current === "outgoing" && !callIdRef.current) {
          goEnded("Could not reach the other person");
        }
      }, INVITE_ACK_TIMEOUT_MS);
    },
    [socket, getLocalStream, goEnded],
  );

  const acceptCall = useCallback(async () => {
    if (!socket || !callIdRef.current) return;
    const mediaType = mediaTypeRef.current;
    try {
      await getLocalStream(mediaType);
    } catch {
      toast.error("Microphone/camera access was denied");
      socket.emit("call:reject", { callId: callIdRef.current });
      teardown();
      setCallState(IDLE_STATE);
      return;
    }
    clearRingTimer();
    setCallState((prev) => ({ ...prev, status: "connecting" }));
    socket.emit("call:accept", { callId: callIdRef.current });
  }, [socket, getLocalStream, teardown]);

  const rejectCall = useCallback(() => {
    if (!socket || !callIdRef.current) return;
    clearRingTimer();
    socket.emit("call:reject", { callId: callIdRef.current });
    teardown();
    setCallState(IDLE_STATE);
  }, [socket, teardown]);

  const endCall = useCallback(() => {
    const wasRinging = statusRef.current === "outgoing";
    const callId = callIdRef.current;
    clearRingTimer();
    clearInviteTimer();
    // Works even without a socket: the local teardown must always run so the
    // overlay never gets stuck with no way to cut the call.
    if (socket && callId) socket.emit("call:end", { callId });
    goEnded(wasRinging ? "Call cancelled" : "Call ended");
  }, [socket, goEnded]);

  const toggleMute = useCallback(() => {
    setMuted((prev) => {
      const next = !prev;
      localStreamRef.current?.getAudioTracks().forEach((t) => {
        t.enabled = !next;
      });
      return next;
    });
  }, []);

  const toggleCamera = useCallback(() => {
    setCameraOff((prev) => {
      const next = !prev;
      localStreamRef.current?.getVideoTracks().forEach((t) => {
        t.enabled = !next;
      });
      return next;
    });
  }, []);

  const value: TCallContextValue = {
    callState,
    startCall,
    acceptCall,
    rejectCall,
    endCall,
    toggleMute,
    toggleCamera,
    muted,
    cameraOff,
    durationSeconds,
    linkState,
  };

  return (
    <CallContext.Provider value={value}>
      {children}
      <CallOverlay
        callState={callState}
        peer={peer}
        chatTitle={chat?.chatName}
        chatUsers={chatUsers}
        me={userInfo ?? undefined}
        localStream={localStream}
        remoteStreams={remoteStreams}
        activeSpeakerId={activeSpeakerId}
        muted={muted}
        cameraOff={cameraOff}
        durationSeconds={durationSeconds}
        linkState={linkState}
        onAccept={() => void acceptCall()}
        onReject={rejectCall}
        onEnd={endCall}
        onToggleMute={toggleMute}
        onToggleCamera={toggleCamera}
      />
    </CallContext.Provider>
  );
};
