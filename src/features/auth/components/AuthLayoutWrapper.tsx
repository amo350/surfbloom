"use client";
import AuthLayout from "./AuthLayout";
import { useAuthContext } from "./AuthContext";

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
