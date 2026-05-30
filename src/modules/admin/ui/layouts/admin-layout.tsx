"use client";

import { trpc } from "@/trpc/client";
import { AdminSidebar } from "../components/admin-sidebar";
import { AdminNavbar } from "../components/admin-navbar";
import { AdminErrorBoundary } from "@/components/admin-error-boundary";
import { redirect } from "next/navigation";
import { useEffect } from "react";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  // Admin status is resolved server-side from the ADMIN_EMAILS allowlist.
  // This only gates the UI; every admin procedure is still guarded by
  // `requireAdmin` on the server.
  const { data: isAdmin, isLoading } = trpc.admin.isAdmin.useQuery(undefined, {
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      redirect("/");
    }
  }, [isAdmin, isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
      <AdminNavbar />
      <div className="flex pt-16">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto bg-transparent p-6 ml-64">
          <div className="max-w-7xl mx-auto">
            <AdminErrorBoundary>
              {children}
            </AdminErrorBoundary>
          </div>
        </main>
      </div>
    </div>
  );
};
