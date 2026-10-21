import React from "react";
import Image from "next/image";

export default function BrandLogo() {
  return (
    <span className="inline-block h-8 w-[133px] shrink-0 md:h-9 md:w-[150px]">
      <Image
        alt="Aura Trip"
        className="hidden h-full w-full dark:block"
        height={328}
        src="/logo/AuraTrip-Transparent-Logo-DarkMode.png"
        width={1364}
      />
      <Image
        alt="Aura Trip"
        className="block h-full w-full dark:hidden"
        height={328}
        priority
        src="/logo/AuraTrip-Transparent-Logo.png"
        width={1364}
      />
    </span>
  );
}
