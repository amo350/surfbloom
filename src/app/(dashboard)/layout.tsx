import React from "react";
import { AcceptInvitationsProvider } from "@/components/accept-invitations-provider";
import { requireAuth } from "@/lib/auth-utils";

type DashboardLayoutProps = {
  children: React.ReactNode;
};

const DashboardLayout = async ({ children }: { children: React.ReactNode }) => {
  await requireAuth();

  return <AcceptInvitationsProvider>{children}</AcceptInvitationsProvider>;
};

export default DashboardLayout;
