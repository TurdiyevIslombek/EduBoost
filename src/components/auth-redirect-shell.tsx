"use client";

import { AuthRedirect } from "@/components/auth-redirect";

interface AuthRedirectShellProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export const AuthRedirectShell = ({ children, redirectTo }: AuthRedirectShellProps) => {
  return <AuthRedirect redirectTo={redirectTo}>{children}</AuthRedirect>;
};
