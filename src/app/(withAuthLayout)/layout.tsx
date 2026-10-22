import React from "react";

import Container from "@/src/components/shared/container";

export default function WithDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative isolate min-h-[100svh] overflow-hidden bg-default-50">
      <Container>
        {/* Soft background blobs — kept behind all page content via -z-10
            (the root `isolate` guarantees they still paint above the
            background color). */}
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="w-[200px] md:w-[300px] h-[300px] bg-sage-500 opacity-70 blur-[100px] absolute top-10 left-20" />
          <div className="w-[200px] md:w-[300px] h-[300px] bg-blue-400 opacity-70 blur-[100px] absolute bottom-10 right-20" />
        </div>
        <div className="relative z-10">{children}</div>
      </Container>
    </div>
  );
}
