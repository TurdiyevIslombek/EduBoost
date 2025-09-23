"use client";

import { useUser } from "@clerk/nextjs";
import { AdminSidebar } from "../components/admin-sidebar";
import { AdminNavbar } from "../components/admin-navbar";
import { AdminErrorBoundary } from "@/components/admin-error-boundary";
import { redirect } from "next/navigation";
import { useEffect } from "react";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { user, isLoaded } = useUser();

  useEffect(() => {
    if (isLoaded && (!user || user.emailAddresses[0]?.emailAddress !== "turdiyevislombek01@gmail.com")) {
      redirect("/");
    }
  }, [user, isLoaded]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user || user.emailAddresses[0]?.emailAddress !== "turdiyevislombek01@gmail.com") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
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
