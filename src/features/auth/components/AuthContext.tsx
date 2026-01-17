"use client";
import { createContext, useContext, ReactNode } from "react";

interface AuthContextValue {
  title?: string;
  subtitle?: string;
  footer?: ReactNode;
}

const AuthContext = createContext<AuthContextValue>({});

export function AuthProvider({
  children,
  title,
  subtitle,
  footer,
}: {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  footer?: ReactNode;
}) {
  return (
    <AuthContext.Provider value={{ title, subtitle, footer }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  return useContext(AuthContext);
}
