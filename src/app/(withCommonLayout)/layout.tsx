import React from "react";

import Footer from "@/src/app/(withCommonLayout)/_component/ui/footer";
import Navbar from "@/src/app/(withCommonLayout)/_component/ui/navbar";

export default function WithCommonLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen relative">
      <Navbar />
      {/* Blurred Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="w-[200px] md:w-[300px] h-[300px] bg-sage-500 opacity-70 blur-[100px] absolute top-10 left-20" />
        <div className="w-[200px] md:w-[300px] h-[300px] bg-blue-400 opacity-70 blur-[100px] absolute bottom-10 right-20 " />
      </div>

      <div className="relative z-10">{children}</div>
      <Footer />
    </div>
  );
}
