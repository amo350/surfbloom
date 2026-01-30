import { AcceptInvitationsProvider } from "@/components/accept-invitations-provider";
import { requireAuth } from "@/lib/auth-utils";
import React from "react";

type DashboardLayoutProps = {
  children: React.ReactNode;
};

const DashboardLayout = async ({ children }: DashboardLayoutProps) => {
  await requireAuth();

  return (
    <AcceptInvitationsProvider>
      <div className="min-h-screen bg-[#F7F8FA]">
        <div className="flex flex-col h-screen">{children}</div>
      </div>
    </AcceptInvitationsProvider>
  );
};

export default DashboardLayout;
