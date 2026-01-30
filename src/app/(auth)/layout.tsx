import AuthLayoutWrapper from "@/features/auth/components/AuthLayoutWrapper";
import { AcceptInvitationsProvider } from "@/components/accept-invitations-provider";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <AuthLayoutWrapper>
      <AcceptInvitationsProvider>{children}</AcceptInvitationsProvider>
    </AuthLayoutWrapper>
  );
}
