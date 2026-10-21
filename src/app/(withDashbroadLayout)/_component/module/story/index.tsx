'use client';

import { TAllUserStory } from '@/src/types';
import { useGetAllUserStoriesQuery } from '@/src/redux/features/story/storyApi';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/free-mode';
import { Card } from '@nextui-org/card';
import { Skeleton } from '@nextui-org/skeleton';
import { PiEmptyFill } from 'react-icons/pi';
import { CreateStoryCard } from './createStoryCard';
import { StoryCard } from './storyCard';

export default function Stories() {
  const { data, isLoading, refetch } = useGetAllUserStoriesQuery();

  if (isLoading)
    return (
      <div className="my-10 flex flex-row gap-2 overflow-x-auto pb-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <Card
            key={index}
            className="w-28 h-48 space-y-2 border border-default-100 flex-shrink-0"
            radius="lg"
          >
            <Skeleton className="h-full w-full rounded-lg">
              <div className="h-full w-full bg-default-300" />
            </Skeleton>
            <div className="absolute top-1 left-1">
              <Skeleton className="rounded-full">
                <div className="h-6 w-6 bg-default-300" />
              </Skeleton>
            </div>
          </Card>
        ))}
      </div>
    );

  const stories = data?.data as TAllUserStory[];

  if (!stories || stories.length === 0) {
    return (
      <div className="my-10 flex flex-row gap-2">
        <div>
          <CreateStoryCard />
        </div>
        <div className="flex items-center justify-center flex-col w-full text-sage-600 dark:text-sage-400 border border-default-100 rounded-md h-48 bg-sage-50/5">
          <PiEmptyFill size={30} />
          <span className="text-sm mt-1">No stories</span>
        </div>
      </div>
    );
  }

  return (
    <div className="my-10">
      <Swiper
        slidesPerView="auto"
        spaceBetween={8}
        freeMode={true}
        modules={[FreeMode]}
        className="w-full"
      >
        <SwiperSlide className="!w-auto">
          <CreateStoryCard />
        </SwiperSlide>
        {stories?.map((story) => (
          <SwiperSlide key={story?.stories?.[0]?._id} className="!w-auto">
            <StoryCard story={story} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
