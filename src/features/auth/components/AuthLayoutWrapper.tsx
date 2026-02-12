"use client";
import { useAuthContext } from "./AuthContext";
import AuthLayout from "./AuthLayout";

export default function AuthLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { title, subtitle } = useAuthContext();

  return (
    <AuthLayout title={title} subtitle={subtitle}>
      {children}
    </AuthLayout>
  );
}
