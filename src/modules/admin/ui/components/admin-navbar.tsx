import Link from "next/link";
import Image from "next/image";
import { UserButton } from "@clerk/nextjs";
import { ShieldCheckIcon, ExternalLinkIcon } from "lucide-react";

export const AdminNavbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-white/85 backdrop-blur-xl border-b border-emerald-100/80 shadow-[0_8px_30px_-12px_rgba(16,185,129,0.25)] flex items-center px-4 sm:px-6 z-50">
      <div className="flex items-center justify-between w-full">
        {/* Logo and Admin Label */}
        <Link href="/admin" className="flex items-center gap-3 group">
          <Image
            src="/logo_eduboost.png"
            alt="EduBoost logo"
            width={32}
            height={32}
            className="drop-shadow-sm rounded-lg transition-transform duration-200 group-hover:scale-105"
          />
          <div className="flex items-center gap-2">
            <p className="text-xl font-bold tracking-tight bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              EduBoost
            </p>
            <div className="flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-full text-white text-xs font-semibold shadow-md shadow-emerald-500/30">
              <ShieldCheckIcon className="size-3" />
              Admin
            </div>
          </div>
        </Link>

        {/* User Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/"
            className="hidden sm:flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-full transition-all duration-200"
          >
            <ExternalLinkIcon className="size-3.5" />
            Back to Site
          </Link>
          <UserButton />
        </div>
      </div>
    </nav>
  );
};
