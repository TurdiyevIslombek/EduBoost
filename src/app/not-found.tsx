import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, SearchIcon, HomeIcon } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page Not Found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-50 px-4">
      <div className="max-w-md w-full text-center">
        <div className="text-7xl font-bold text-emerald-600 mb-4">404</div>
        <h1 className="text-3xl font-bold text-slate-800 mb-3">
          Page not found
        </h1>
        <p className="text-slate-600 mb-8 leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          It may have been a video that&apos;s no longer available, or the URL might be mistyped.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/">
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white w-full sm:w-auto">
              <HomeIcon className="w-4 h-4 mr-2" />
              Back to home
            </Button>
          </Link>
          <Link href="/feed/trending">
            <Button variant="outline" className="w-full sm:w-auto">
              <SearchIcon className="w-4 h-4 mr-2" />
              Browse trending
            </Button>
          </Link>
        </div>
        <Link href="/" className="inline-flex items-center text-sm text-emerald-600 hover:text-emerald-700 mt-8">
          <ArrowLeftIcon className="w-4 h-4 mr-1" />
          Return to EduBoost
        </Link>
      </div>
    </div>
  );
}
