"use client";
import { createContext, ReactNode, useContext } from "react";

interface AuthContextValue {
  title?: string;
  subtitle?: string;
}

const AuthContext = createContext<AuthContextValue>({});

export function AuthProvider({
  children,
  title,
  subtitle,
}: {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}) {
  return (
    <AuthContext.Provider value={{ title, subtitle }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  return useContext(AuthContext);
}
