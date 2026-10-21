import React from 'react';

interface StoryProgressProps {
  totalStories: number;
  currentStory: number;
  progress: number;
}

export function StoryProgress({
  totalStories,
  currentStory,
  progress,
}: StoryProgressProps) {
  return (
    <div className="flex w-full gap-1">
      {Array.from({ length: totalStories }).map((_, index) => (
        <div
          key={index}
          className="h-1 bg-default-200 flex-grow rounded-full overflow-hidden"
        >
          <div
            className="h-full bg-sage-600 transition-all duration-100 ease-linear"
            style={{
              width:
                index === currentStory
                  ? `${progress}%`
                  : index < currentStory
                    ? '100%'
                    : '0%',
            }}
          />
        </div>
      ))}
    </div>
  );
}
