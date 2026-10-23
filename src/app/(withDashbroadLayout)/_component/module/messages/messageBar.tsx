'use client';

import React, { useEffect, useRef, useState, ChangeEvent, KeyboardEvent } from 'react';
import { Input } from '@nextui-org/input';
import { Button } from '@nextui-org/button';
import { Popover, PopoverTrigger, PopoverContent } from '@nextui-org/popover';
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@nextui-org/dropdown';
import { SendIcon, SmileIcon } from 'lucide-react';
import { MapPin, Mic, MicOff, Image as ImageIcon, EyeOff, X, Send, Navigation } from 'lucide-react';
import dynamic from 'next/dynamic';
import type { EmojiClickData } from 'emoji-picker-react';
import { useTheme } from 'next-themes';
import { Theme as EmojiPickerTheme } from 'emoji-picker-react';
import { toast } from 'sonner';
import { TMessage, TMessageType } from '@/src/types';
import { uploadToCloudinary } from '@/src/utils/uploadCloudinary';

const EmojiPicker = dynamic(() => import('emoji-picker-react'), { ssr: false });

export interface TMessagePayload {
  content?: string;
  messageType?: TMessageType;
  mediaUrl?: string;
  mediaMeta?: { durationSeconds?: number; thumbnailUrl?: string };
  location?: { lat: number; lng: number; label?: string };
  /** Id of the message being replied to. */
  replyTo?: string;
}

interface MessageBarProps {
  onSendMessage: (
    payload: TMessagePayload,
    event?: KeyboardEvent<HTMLInputElement>
  ) => Promise<void> | void;
  typingHandler: (e: ChangeEvent<HTMLInputElement>) => void;
  replyTo?: TMessage | null;
  onCancelReply?: () => void;
}

type TAttachKind = 'IMAGE' | 'VIEW_ONCE_IMAGE' | 'LOCATION' | 'LIVE_LOCATION';

export default function MessageBar({
  onSendMessage,
  typingHandler,
  replyTo,
  onCancelReply,
}: MessageBarProps) {
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const { theme } = useTheme();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingAttachKind = useRef<TAttachKind>('IMAGE');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recordStartRef = useRef(0);
  const recordTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const locationBusyRef = useRef(false);

  useEffect(() => {
    return () => {
      if (recordTimerRef.current) clearInterval(recordTimerRef.current);
      mediaRecorderRef.current?.stream.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setInputMessage((prev) => prev + emojiData.emoji);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputMessage(e.target.value);
    typingHandler(e);
  };

  const submitPayload = async (
    payload: TMessagePayload,
    event?: KeyboardEvent<HTMLInputElement>
  ) => {
    // Attach the pending reply (when one is active) to every outbound payload.
    await onSendMessage(
      replyTo ? { ...payload, replyTo: replyTo._id } : payload,
      event
    );
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const text = inputMessage.trim();

      if (!text) return;

      // A single emoji run (1-16 chars) ships as a native emoji reaction.
      const isEmojiOnly =
        text.length <= 16 && !/[a-z0-9]/i.test(text.replace(/\s/g, ''));

      void submitPayload(
        isEmojiOnly
          ? { content: text, messageType: 'EMOJI' }
          : { content: text, messageType: 'TEXT' },
        e
      );
      setInputMessage('');
    }
  };

  const handleSendClick = () => {
    const text = inputMessage.trim();

    if (!text) return;
    const isEmojiOnly =
      text.length <= 16 && !/[a-z0-9]/i.test(text.replace(/\s/g, ''));

    void submitPayload(
      isEmojiOnly
        ? { content: text, messageType: 'EMOJI' }
        : { content: text, messageType: 'TEXT' }
    );
    setInputMessage('');
  };

  const pickAttach = (kind: TAttachKind) => {
    if (kind === 'LOCATION' || kind === 'LIVE_LOCATION') {
      shareLocation(kind);

      return;
    }
    pendingAttachKind.current = kind;
    fileInputRef.current?.click();
  };

  const handleFileSelected = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    e.target.value = ''; // allow re-picking the same file
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please choose an image file');

      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast.error('Images must be under 8 MB');

      return;
    }

    setIsUploading(true);
    try {
      const url = await uploadToCloudinary(file);

      await submitPayload({
        messageType: pendingAttachKind.current,
        mediaUrl: url,
        content: '',
      });
    } catch {
      toast.error('Upload failed, please try again');
    } finally {
      setIsUploading(false);
    }
  };

  const shareLocation = (kind: 'LOCATION' | 'LIVE_LOCATION' = 'LOCATION') => {
    if (locationBusyRef.current) return;
    if (!('geolocation' in navigator)) {
      toast.error('Location is not available in this browser');

      return;
    }
    locationBusyRef.current = true;
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        locationBusyRef.current = false;
        await submitPayload({
          messageType: kind,
          location: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            label: kind === 'LIVE_LOCATION' ? 'Sharing live location' : 'Current location',
          },
        });
      },
      () => {
        locationBusyRef.current = false;
        toast.error('Could not get your location');
      },
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 30_000 }
    );
  };

  const stopRecordingClock = () => {
    if (recordTimerRef.current) {
      clearInterval(recordTimerRef.current);
      recordTimerRef.current = null;
    }
  };

  const startRecording = async () => {
    if (!('MediaRecorder' in window)) {
      toast.error('Voice recording is not supported in this browser');

      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);

      chunksRef.current = [];
      recordStartRef.current = Date.now();
      setRecordSeconds(0);

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setRecording(true);
      recordTimerRef.current = setInterval(() => {
        setRecordSeconds(Math.floor((Date.now() - recordStartRef.current) / 1000));
      }, 500);
    } catch {
      toast.error('Microphone access was denied');
    }
  };

  const finishRecording = async (send: boolean) => {
    const recorder = mediaRecorderRef.current;
    const duration = Math.max(1, Math.round((Date.now() - recordStartRef.current) / 1000));

    stopRecordingClock();
    setRecording(false);
    mediaRecorderRef.current = null;
    if (!recorder) return;

    const blob = await new Promise<Blob | null>((resolve) => {
      recorder.onstop = () => {
        recorder.stream.getTracks().forEach((t) => t.stop());
        resolve(new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' }));
      };
      recorder.stop();
    });

    if (!send || !blob || blob.size === 0) {
      chunksRef.current = [];

      return;
    }
    if (duration > 600) {
      toast.error('Voice notes are limited to 10 minutes');
      chunksRef.current = [];

      return;
    }

    setIsUploading(true);
    try {
      const file = new File([blob], `voice-${Date.now()}.webm`, {
        type: blob.type || 'audio/webm',
      });
      const url = await uploadToCloudinary(file);

      await submitPayload({
        messageType: 'VOICE',
        mediaUrl: url,
        mediaMeta: { durationSeconds: Math.min(duration, 600) },
        content: '',
      });
    } catch {
      toast.error('Voice upload failed, please try again');
    } finally {
      setIsUploading(false);
      chunksRef.current = [];
    }
  };

  const replyLabel = (() => {
    if (!replyTo) return '';
    if (replyTo.isDeleted) return 'Message deleted';
    const text =
      replyTo.messageType === 'IMAGE'
        ? 'Photo'
        : replyTo.messageType === 'VOICE'
          ? 'Voice message'
          : replyTo.messageType === 'LOCATION'
            ? 'Location'
            : replyTo.messageType === 'LIVE_LOCATION'
              ? 'Live location'
              : replyTo.messageType === 'VIEW_ONCE_IMAGE'
                ? 'View-once photo'
                : replyTo.content;

    return text || 'Message';
  })();

  return (
    <div className="shrink-0 pt-3 border-t border-default-100">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelected}
      />

      {/* Replying-to strip */}
      {replyTo && (
        <div className="flex items-center gap-2 mb-2 rounded-lg border border-default-200 bg-default-100 px-3 py-2">
          <span className="flex-1 min-w-0 text-xs text-default-600 truncate">
            <span className="font-semibold">Replying to</span>{' '}
            {replyTo.sender?.name}: {replyLabel}
          </span>
          <Button
            isIconOnly
            size="sm"
            variant="light"
            className="h-6 min-w-6"
            aria-label="Cancel reply"
            onPress={() => onCancelReply?.()}
          >
            <X className="h-3.5 w-3.5 text-default-500" />
          </Button>
        </div>
      )}

      {recording ? (
        <div className="flex items-center gap-3 rounded-full border border-danger-300 bg-danger-50 dark:bg-danger-950 px-4 py-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-danger-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-danger-500" />
          </span>
          <span className="text-xs font-medium text-danger-600">
            Recording {Math.floor(recordSeconds / 60)}:
            {String(recordSeconds % 60).padStart(2, '0')}
          </span>
          <div className="ml-auto flex items-center gap-2">
            <Button
              size="sm"
              variant="light"
              startContent={<X className="h-4 w-4" />}
              onPress={() => finishRecording(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              color="danger"
              startContent={<Send className="h-4 w-4" />}
              onPress={() => finishRecording(true)}
            >
              Send voice
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Dropdown placement="top-start">
            <DropdownTrigger>
              <Button
                size="sm"
                isIconOnly
                radius="full"
                aria-label="Attach"
                isDisabled={isUploading}
              >
                <PaperclipIconSafe />
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Attachment options" onAction={(key) => pickAttach(key as TAttachKind)}>
              <DropdownItem key="IMAGE" startContent={<ImageIcon className="h-4 w-4" />}>
                Photo
              </DropdownItem>
              <DropdownItem key="VIEW_ONCE_IMAGE" startContent={<EyeOff className="h-4 w-4" />}>
                View-once photo
              </DropdownItem>
              <DropdownItem key="LOCATION" startContent={<MapPin className="h-4 w-4" />}>
                Share location
              </DropdownItem>
              <DropdownItem
                key="LIVE_LOCATION"
                startContent={<Navigation className="h-4 w-4" />}
              >
                Share live location · 15 min
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>

          <Button
            size="sm"
            isIconOnly
            radius="full"
            aria-label="Record voice message"
            isDisabled={isUploading}
            onPress={startRecording}
          >
            <Mic className="h-5 w-5 text-sage-600 dark:text-sage-400" />
          </Button>

          <Popover
            isOpen={isEmojiPickerOpen}
            onOpenChange={setIsEmojiPickerOpen}
            placement="right"
          >
            <PopoverTrigger>
              <Button
                size="sm"
                isIconOnly
                radius="full"
                aria-label="Select emoji"
              >
                <SmileIcon className="h-5 w-5 text-sage-600 dark:text-sage-400" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="mb-28">
              <EmojiPicker
                theme={(theme === 'dark' ? 'dark' : 'light') as EmojiPickerTheme}
                onEmojiClick={handleEmojiClick}
              />
            </PopoverContent>
          </Popover>

          <Input
            className="flex-grow text-xs"
            placeholder={isUploading ? 'Uploading…' : 'Type a message...'}
            size="sm"
            radius="full"
            value={inputMessage}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            isDisabled={isUploading}
          />
          <Button
            size="sm"
            radius="md"
            aria-label="Send message"
            onClick={handleSendClick}
            isDisabled={isUploading || !inputMessage.trim()}
          >
            <SendIcon className="h-5 w-5 text-sage-600 dark:text-sage-400" />
          </Button>
        </div>
      )}
    </div>
  );
}

function PaperclipIconSafe() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-sage-600 dark:text-sage-400"
    >
      <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" />
    </svg>
  );
}
