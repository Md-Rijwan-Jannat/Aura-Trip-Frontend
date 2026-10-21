import { Skeleton } from '@nextui-org/skeleton';
import React from 'react';

export default function FollowerSkeleton() {
  const skeletonArray = Array.from({ length: 10 });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center w-full w-full md:w-[550px] xl:w-[640px] mx-auto mx-auto">
      {skeletonArray.map((_, index) => (
        <div
          key={index}
          className="bg-default-50 border border-default-200 rounded-md p-2 flex flex-col items-center gap-3"
        >
          {/* Skeleton Avatar */}
          <Skeleton className="size-9 rounded-full" />

          {/* Name and Friends Badge */}
          <div className="flex flex-col items-center gap-2">
            <Skeleton className="h-3 w-[80px] rounded-lg" />
            <Skeleton className="h-2 w-[60px] rounded-full bg-sage-600/10" />
          </div>

          {/* Follow Button */}
          <Skeleton className="h-7 w-[80px] rounded-full" />
        </div>
      ))}
    </div>
  );
}
