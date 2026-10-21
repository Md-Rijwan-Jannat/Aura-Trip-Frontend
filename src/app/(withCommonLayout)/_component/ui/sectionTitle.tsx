import React from 'react';
import { IoIosArrowForward } from 'react-icons/io';

export default function SectionTitle({ text }: { text: string }) {
  return (
    <div>
      <h2 className="text-sm md:text-lg lg:text-2xl font-semibold text-default-800 flex items-center justify-normal gap-2 mt-12">
        {text}
        <IoIosArrowForward className="text-sage-600 dark:text-sage-400" size={20} />
      </h2>
    </div>
  );
}
