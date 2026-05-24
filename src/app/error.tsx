"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangleIcon, RotateCwIcon, HomeIcon } from "lucide-react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Hook for future Sentry / error-tracking integration
    console.error("App error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-50 px-4">
      <div className="max-w-md w-full text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 mb-6">
          <AlertTriangleIcon className="w-8 h-8 text-amber-600" />
        </div>
        <h1 className="text-3xl font-bold text-slate-800 mb-3">
          Something went wrong
        </h1>
        <p className="text-slate-600 mb-2 leading-relaxed">
          An unexpected error occurred while loading this page. You can try again
          or head back to the homepage.
        </p>
        {error.digest && (
          <p className="text-xs text-slate-400 mb-8 font-mono">
            Error ID: {error.digest}
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={reset}
            className="bg-emerald-600 hover:bg-emerald-700 text-white w-full sm:w-auto"
          >
            <RotateCwIcon className="w-4 h-4 mr-2" />
            Try again
          </Button>
          <Link href="/">
            <Button variant="outline" className="w-full sm:w-auto">
              <HomeIcon className="w-4 h-4 mr-2" />
              Back to home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
