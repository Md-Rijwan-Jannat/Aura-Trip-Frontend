'use client';

import { TAllUserStory } from '@/src/types';
import { Avatar } from '@nextui-org/avatar';
import { Card, CardBody } from '@nextui-org/card';
import Image from 'next/image';
import { useAddViewMutation } from '@/src/redux/features/story/storyApi';
import { useDisclosure } from '@nextui-org/modal';
import { Button } from '@nextui-org/button';
import { StoryModal } from './strotyModal';

interface StoryCardProps {
  story: TAllUserStory;
}

export function StoryCard({ story }: StoryCardProps) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [addView] = useAddViewMutation();

  const handleClick = async () => {
    await addView({ storyId: story?.stories?.[0]._id });
    onOpen();
  };

  return (
    <>
      <Button
        onClick={handleClick}
        id={`story-${story?.stories?.[0]._id}`}
        className="hidden"
      >
        View
      </Button>
      <label htmlFor={`story-${story?.stories?.[0]._id}`}>
        <Card className="w-28 h-48 cursor-pointer overflow-hidden border border-default-100">
          <CardBody className="p-0 relative">
            <Image
              width={700}
              height={700}
              src={story?.stories?.[0].media}
              alt={story?.user.name}
              className="w-28 h-48 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/30" />
            <p className="absolute bottom-1 left-1 right-1 text-white text-[10px] font-semibold truncate">
              {story?.user?.name}
            </p>
          </CardBody>
          <Avatar
            name={story?.user?.name?.charAt(0).toUpperCase()}
            src={story?.user?.image || undefined}
            className="absolute top-1 left-1 border-2 border-sage-600"
            size="sm"
          />
        </Card>
      </label>

      <StoryModal story={story} isOpen={isOpen} onOpenChange={onOpenChange} />
    </>
  );
}
