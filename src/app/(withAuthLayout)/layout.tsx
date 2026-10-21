import React from "react";

import Container from "@/src/components/shared/container";

export default function WithDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-default-50">
      {" "}
      <Container>
        {" "}
        <div className="absolute inset-0">
          <div className="w-[200px] md:w-[300px] h-[300px] bg-sage-500 opacity-70 blur-[100px] absolute top-10 left-20" />
          <div className="w-[200px] md:w-[300px] h-[300px] bg-blue-400 opacity-70 blur-[100px] absolute bottom-10 right-20" />
        </div>
        {children}
      </Container>
    </div>
  );
}
