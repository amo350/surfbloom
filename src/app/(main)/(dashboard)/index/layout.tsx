import React from "react";
import IndexNavbar from "@/components/IndexNavbar";
import { requireAuth } from "@/lib/auth-utils";

type IndexLayoutProps = {
  children: React.ReactNode;
};

const IndexLayout = async ({ children }: IndexLayoutProps) => {
  await requireAuth();

  return (
    <div className="min-h-screen">
      <div className="flex flex-col h-screen">
        <IndexNavbar />
        {children}
      </div>
    </div>
  );
};

export default IndexLayout;
