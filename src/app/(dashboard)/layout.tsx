import { requireAuth } from "@/lib/auth-utils";
import React from "react";

type DashboardLayoutProps = {
  children: React.ReactNode;
};

const DashboardLayout = async ({ children }: DashboardLayoutProps) => {
  await requireAuth();

  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      <div className="flex flex-col h-screen">{children}</div>
    </div>
  );
};

export default DashboardLayout;
