"use client";

import { Modal, ModalContent, ModalHeader, ModalBody } from "@nextui-org/modal";
import { useState } from "react";
import { Music } from "lucide-react";
import { IMusicTrack, MusicSelection, ContentType, MUSIC_DURATION_LIMITS } from "@/src/types/music";
import MusicLibrary from "./MusicLibrary";
import MusicEditor from "./MusicEditor";

interface MusicPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selection: MusicSelection) => void;
  contentType: ContentType;
  initialSelection?: MusicSelection | null;
}

/**
 * Reusable Music Picker Modal
 * Used for Posts, Stories, and Shorts
 */
const MusicPickerModal = ({ isOpen, onClose, onConfirm, contentType, initialSelection }: MusicPickerModalProps) => {
  const [selectedTrack, setSelectedTrack] = useState<IMusicTrack | null>(initialSelection?.track || null);
  const [isEditingMusic, setIsEditingMusic] = useState(false);

  const handleTrackSelect = (track: IMusicTrack) => {
    setSelectedTrack(track);
    setIsEditingMusic(true);
  };

  const handleMusicConfirm = (selection: MusicSelection) => {
    onConfirm(selection);
    onClose();
  };

  const handleBack = () => {
    setIsEditingMusic(false);
  };

  const handleModalClose = () => {
    setSelectedTrack(null);
    setIsEditingMusic(false);
    onClose();
  };

  const maxDuration = MUSIC_DURATION_LIMITS[contentType].max;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleModalClose}
      size='5xl'
      scrollBehavior='inside'
      classNames={{
        base: "max-h-[90vh]",
        body: "p-0",
      }}
    >
      <ModalContent>
        <ModalHeader className='flex items-center gap-2 border-b border-borderSubtle px-6 py-4'>
          <Music className='w-5 h-5 text-sage-600 dark:text-sage-400' />
          <span className='text-lg font-semibold'>{isEditingMusic ? "Edit Music" : "Add Music"}</span>
        </ModalHeader>

        <ModalBody>
          {isEditingMusic && selectedTrack ? (
            <MusicEditor
              track={selectedTrack}
              contentType={contentType}
              maxDuration={maxDuration}
              initialSelection={initialSelection}
              onConfirm={handleMusicConfirm}
              onBack={handleBack}
              onCancel={handleModalClose}
            />
          ) : (
            <MusicLibrary contentType={contentType} onTrackSelect={handleTrackSelect} onClose={handleModalClose} />
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default MusicPickerModal;
