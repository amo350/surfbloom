import AuthLayoutWrapper from "@/features/auth/components/AuthLayoutWrapper";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <AuthLayoutWrapper>{children}</AuthLayoutWrapper>;
}
