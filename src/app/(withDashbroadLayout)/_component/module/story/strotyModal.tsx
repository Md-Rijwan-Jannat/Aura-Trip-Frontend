'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Modal,
  ModalContent,
  ModalBody,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from '@nextui-org/modal';
import { Avatar } from '@nextui-org/avatar';
import { Button } from '@nextui-org/button';
import {
  ThumbsUp,
  Heart,
  Laugh,
  Frown,
  Angry,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useUser } from '@/src/hooks/useUser';
import {
  useAddReactionMutation,
  useDeleteStoryMutation,
} from '@/src/redux/features/story/storyApi';
import Link from 'next/link';
import Image from 'next/image';
import { GoVerified } from 'react-icons/go';
import FollowForPost from '../userProfile/followForPost';
import { ReactionType, TAllUserStory } from '@/src/types';
import { StoryProgress } from './storyProgress';

interface StoryModalProps {
  story: TAllUserStory | null;
  isOpen: boolean;
  onOpenChange: () => void;
}

const STORY_DURATION = 5000; // 5 seconds per story

export function StoryModal({ story, onOpenChange, isOpen }: StoryModalProps) {
  const { userInfo } = useUser();
  const [addReactionFn] = useAddReactionMutation();
  const [deleteStoryFn] = useDeleteStoryMutation();
  const {
    isOpen: isDeleteModalOpen,
    onOpen: onDeleteModalOpen,
    onClose: onDeleteModalClose,
  } = useDisclosure();

  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const startProgressTimer = useCallback(() => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }
    progressInterval.current = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress >= 100) {
          if (!isTransitioning) {
            setIsTransitioning(true);
            goToNextStory();
          }

          return 100;
        }

        return prevProgress + (100 / STORY_DURATION) * 100;
      });
    }, 100);
  }, [isTransitioning]);

  const stopProgressTimer = useCallback(() => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }
  }, []);

  const goToNextStory = useCallback(() => {
    if (story && currentStoryIndex < story.stories.length - 1) {
      setCurrentStoryIndex((prev) => prev + 1);
      setProgress(0);
      setIsTransitioning(false);
      startProgressTimer();
    } else {
      onOpenChange();
    }
  }, [story, currentStoryIndex, onOpenChange, startProgressTimer]);

  const goToPreviousStory = useCallback(() => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex((prev) => prev - 1);
      setProgress(0);
      setIsTransitioning(false);
      startProgressTimer();
    }
  }, [currentStoryIndex, startProgressTimer]);

  useEffect(() => {
    if (isOpen && story) {
      setCurrentStoryIndex(0);
      setProgress(0);
      setIsTransitioning(false);
      startProgressTimer();
    } else {
      stopProgressTimer();
    }

    return () => {
      stopProgressTimer();
    };
  }, [isOpen, story, startProgressTimer, stopProgressTimer]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        goToPreviousStory();
      } else if (e.key === 'ArrowRight') {
        goToNextStory();
      } else if (e.key === 'Escape') {
        onOpenChange();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToPreviousStory, goToNextStory, onOpenChange]);

  if (!story) return null;

  const handleReaction = async (reaction: ReactionType) => {
    const currentStory = story.stories[currentStoryIndex];

    if (!currentStory || !currentStory.reactions) {
      return;
    }

    try {
      await addReactionFn({
        storyId: currentStory._id,
        reaction,
      }).unwrap();
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  };

  const handleDelete = async () => {
    try {
      const currentStoryId = story.stories[currentStoryIndex]._id;

      await deleteStoryFn(currentStoryId).unwrap();
      onDeleteModalClose();
      onOpenChange();
    } catch (error) {
      console.error('Error deleting story:', error);
    }
  };

  const formatTimeAgo = (date: string): string => {
    const now = new Date();
    const storyDate = new Date(date);
    const diffInSeconds = Math.floor(
      (now.getTime() - storyDate.getTime()) / 1000
    );

    if (diffInSeconds < 60) return 'Just now'; // less than 1 minute
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`; // less than 1 hour
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`; // less than 1 day
    if (diffInSeconds < 172800) return '1d ago'; // less than 2 days

    return `${Math.floor(diffInSeconds / 86400)}d ago`; // more than 2 days
  };

  const isOwnStory = userInfo?._id === story.user._id;
  const currentStory = story.stories[currentStoryIndex];

  return (
    <>
      <Modal
        placement="center"
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        size="xl"
        hideCloseButton
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col p-0">
                <StoryProgress
                  totalStories={story.stories.length}
                  currentStory={currentStoryIndex}
                  progress={progress}
                />
                <div className="flex justify-between items-center p-4">
                  <div className="flex items-center space-x-2">
                    <Link href={`/profile/${story?.user?._id}`}>
                      <Avatar
                        className="w-10 h-10 border-2 border-sage-600"
                        name={story.user?.name?.[0]?.toUpperCase()}
                        src={story.user?.image || undefined}
                      />
                    </Link>
                    <div>
                      <div className="flex items-center gap-2 w-full">
                        <Link
                          className="text-sm font-semibold flex items-center gap-1 whitespace-nowrap"
                          href={`/profile/${story?.user?._id}`}
                        >
                          {story.user.name}
                          {story.user.verified && (
                            <GoVerified className="text-sage-600 dark:text-sage-400" size={14} />
                          )}
                        </Link>
                        {!isOwnStory && (
                          <div className="-mt-3">
                            {' '}
                            <FollowForPost userId={story.user._id} />
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-default-500">
                        {formatTimeAgo(currentStory?.createdAt)}
                      </p>
                    </div>
                  </div>
                  {isOwnStory && (
                    <Button
                      isIconOnly
                      color="danger"
                      variant="light"
                      size="sm"
                      onClick={onDeleteModalOpen}
                    >
                      <Trash2 size={18} />
                    </Button>
                  )}
                </div>
              </ModalHeader>
              <ModalBody className="p-0 relative">
                {currentStory?.media?.endsWith('.mp4') ||
                currentStory?.media?.endsWith('.webm') ||
                currentStory?.media?.endsWith('.ogg') ? (
                  <video
                    key={currentStory._id}
                    autoPlay
                    loop
                    muted
                    playsInline
                    src={currentStory.media}
                    className="w-full h-[500px] object-cover"
                  />
                ) : (
                  <Image
                    key={currentStory._id}
                    width={700}
                    height={700}
                    src={currentStory.media}
                    alt={story.user.name}
                    className="w-full h-[500px] object-cover"
                  />
                )}
                <Button
                  isIconOnly
                  variant="light"
                  className="absolute top-1/2 left-2 -translate-y-1/2 bg-default-200 text-sage-600 dark:text-sage-400"
                  onClick={goToPreviousStory}
                  disabled={currentStoryIndex === 0}
                  aria-label="Previous story"
                >
                  <ChevronLeft size={24} />
                </Button>
                <Button
                  isIconOnly
                  variant="light"
                  className="absolute top-1/2 right-2 -translate-y-1/2 bg-default-200 text-sage-600 dark:text-sage-400"
                  onClick={goToNextStory}
                  disabled={currentStoryIndex === story.stories.length - 1}
                  aria-label="Next story"
                >
                  <ChevronRight size={24} />
                </Button>
              </ModalBody>
              <ModalFooter className="flex justify-start">
                {isOwnStory ? (
                  <p className="text-start">
                    {' '}
                    {currentStory?.reactions?.length || 0}{' '}
                    <span className="text-sage-600 dark:text-sage-400">Reactions</span>
                  </p>
                ) : (
                  <div className="flex gap-5">
                    {Object.entries({
                      like: <ThumbsUp size={20} />,
                      love: <Heart size={20} />,
                      laugh: <Laugh size={20} />,
                      sad: <Frown size={20} />,
                      angry: <Angry size={20} />,
                    }).map(([key, icon]) => {
                      const isActive = currentStory?.reactions?.some(
                        (r) => r.type === key
                      );

                      return (
                        <Button
                          key={key}
                          isIconOnly
                          color="default"
                          variant="light"
                          size="sm"
                          className={`${isActive ? 'text-sage-600 dark:text-sage-400' : ''}`} // Change the color based on whether it's active
                          onClick={() => handleReaction(key as ReactionType)}
                        >
                          {icon}
                          <span className="ml-1 text-xs">
                            {currentStory?.reactions?.filter(
                              (r) => r.type === key
                            ).length || 0}
                          </span>
                        </Button>
                      );
                    })}
                  </div>
                )}
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onOpenChange={onDeleteModalClose}
        size="sm"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Confirm Deletion</ModalHeader>
              <ModalBody>
                <p>
                  Are you sure you want to delete this story? This action cannot
                  be undone.
                </p>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" onClick={handleDelete}>
                  Delete
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
