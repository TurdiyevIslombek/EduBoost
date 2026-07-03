"use client";

import { AdminSidebar, AdminMobileNav } from "../components/admin-sidebar";
import { AdminNavbar } from "../components/admin-navbar";
import { AdminErrorBoundary } from "@/components/admin-error-boundary";

interface AdminLayoutProps {
  children: React.ReactNode;
}

// Pure UI shell — admin access is enforced server-side in
// src/app/(admin)/layout.tsx before this ever renders.
export const AdminLayout = ({ children }: AdminLayoutProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/70 relative">
      {/* Ambient depth blobs (GPU-cheap, pointer-transparent) */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-emerald-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 -left-40 w-[30rem] h-[30rem] bg-teal-200/25 rounded-full blur-3xl" />
      </div>

      <AdminNavbar />
      <div className="flex pt-16 relative">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto bg-transparent p-4 sm:p-6 lg:ml-64 min-w-0">
          <AdminMobileNav />
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
