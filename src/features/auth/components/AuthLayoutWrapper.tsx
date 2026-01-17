"use client";
import AuthLayout from "./AuthLayout";
import { useAuthContext } from "./AuthContext";

export default function AuthLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { title, subtitle, footer } = useAuthContext();

  return (
    <AuthLayout title={title} subtitle={subtitle} footer={footer}>
      {children}
    </AuthLayout>
  );
}
