import React from "react";
import { FaSpinner } from "react-icons/fa";

export default function Spinner() {
  return (
    <div className="w-full h-[100px] flex items-start justify-center">
      <FaSpinner
        className="animate-spin text-sage-600 dark:text-sage-400 ease-in-out duration-2000"
        size={30}
      />
    </div>
  );
}
