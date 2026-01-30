"use client";

import { useEffect, useRef } from "react";
import { useAcceptPendingInvitations } from "@/features/invitations/hooks/use-invitations";

export const AcceptInvitationsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const acceptInvitations = useAcceptPendingInvitations();
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;
    acceptInvitations.mutate();
  }, [acceptInvitations]);

  return <>{children}</>;
};
