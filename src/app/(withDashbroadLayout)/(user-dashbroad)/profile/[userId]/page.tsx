import React from "react";
import PublicProfile from "../../../_component/module/publicProfile";

interface TPublicProfilePageProps {
  params: {
    userId: string;
  };
}

export default function PublicProfilePage({ params }: TPublicProfilePageProps) {
  const userId = params.userId;

  return (
    <div>
      <PublicProfile userId={userId} />
    </div>
  );
}
