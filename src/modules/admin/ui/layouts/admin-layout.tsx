"use client";

import { useUser } from "@clerk/nextjs";
import { AdminSidebar } from "../components/admin-sidebar";
import { AdminNavbar } from "../components/admin-navbar";
import { AdminErrorBoundary } from "@/components/admin-error-boundary";
import { redirect } from "next/navigation";
import { useEffect } from "react";

import { SchedulerProvider, useScheduler } from "../components/scheduler-context";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayoutInner = ({ children }: AdminLayoutProps) => {
  const { user, isLoaded } = useUser();
  const { isRunning, interval: schedulerInterval } = useScheduler();

  useEffect(() => {
    if (isLoaded && (!user || user.emailAddresses[0]?.emailAddress !== "turdiyevislombek01@gmail.com")) {
      redirect("/");
    }
  }, [user, isLoaded]);

  // Auto-scheduler for development environment to simulate cron job
  useEffect(() => {
    // Only run in development or if explicitly enabled
    const isDev = process.env.NODE_ENV === 'development';
    if (!isDev || !isRunning) return; // Check isRunning from context

    const runScheduler = async () => {
      try {
        // Quietly trigger the scheduler
        const res = await fetch('/api/test-scheduler');
        const data = await res.json();
        if (data.processed > 0) {
          console.log(`[Dev Scheduler] Processed ${data.processed} scheduled metrics`);
        }
      } catch (e) {
        console.error("[Dev Scheduler] Failed to trigger:", e);
      }
    };

    // Run immediately on start/resume
    runScheduler();

    // Run based on configured interval
    const timer = setInterval(runScheduler, schedulerInterval);
    
    return () => clearInterval(timer);
  }, [isRunning, schedulerInterval]); // Re-run effect when settings change

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

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  return (
    <SchedulerProvider>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </SchedulerProvider>
  );
};
