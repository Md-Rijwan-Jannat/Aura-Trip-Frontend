import React from "react";
import BrandLogo from "@/src/components/shared/logo";

export default function Loader() {
  return (
    <div className="flex flex-col items-center justify-center h-screen m-auto">
      <div className="animate-pulse duration-500 z-[99999]">
        <BrandLogo />
      </div>
    </div>
  );
}
