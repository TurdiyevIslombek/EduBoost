import Link from "next/link";
import Image from "next/image";
import { UserButton } from "@clerk/nextjs";
import { ShieldCheckIcon } from "lucide-react";

export const AdminNavbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-lg border-b border-gray-200 shadow-lg flex items-center px-6 z-50">
      <div className="flex items-center justify-between w-full">
        {/* Logo and Admin Label */}
        <div className="flex items-center gap-4">
          <Link href="/admin" className="flex items-center gap-3">
            <Image src="/logo_eduboost.png" alt="Logo" width={32} height={32} className="drop-shadow-sm" />
            <div className="flex items-center gap-2">
              <p className="text-xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                EduBoost
              </p>
              <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-red-500 to-red-600 rounded-full text-white text-xs font-semibold">
                <ShieldCheckIcon className="size-3" />
                Admin
              </div>
            </div>
          </Link>
        </div>

        {/* User Actions */}
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors duration-200"
          >
            Back to Site
          </Link>
          <UserButton />
        </div>
      </div>
    </nav>
  );
};
