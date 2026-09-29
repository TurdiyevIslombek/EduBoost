import Image from "next/image";
import Link from "next/link";
import { ArrowLeftIcon, BookOpenIcon, UsersIcon, AwardIcon } from "lucide-react";
import type { Metadata } from "next";
import { AuthMascot } from "@/modules/auth/ui/components/auth-mascot";

// Auth screens are thin, duplicate-looking pages — keep them out of Google's
// index so they never compete with the real landing page.
export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen flex">
      {/* Left Side - Emerald Gradient Background with 3D mascot */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-700 via-teal-700 to-cyan-800 flex-col justify-between p-12 relative overflow-hidden">
        {/* Light, dot grid and animated glow */}
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(167,243,208,0.28),transparent_60%)]" />
          <div className="absolute inset-0 opacity-[0.14] bg-[radial-gradient(rgba(255,255,255,0.9)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_at_center,black_25%,transparent_75%)]" />
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl animate-blob" />
          <div className="absolute -bottom-32 -right-24 w-[28rem] h-[28rem] bg-cyan-300/20 rounded-full blur-3xl animate-blob animation-delay-2000" />
        </div>

        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2.5 group">
            <Image
              src="/logo_eduboost.png"
              alt="EduBoost Logo"
              width={40}
              height={40}
              className="rounded-lg"
            />
            <span className="text-2xl font-bold text-white tracking-tight">
              EduBoost
            </span>
          </Link>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center text-center relative z-10">
          <AuthMascot />

          <h1 className="mt-2 text-4xl xl:text-[2.75rem] font-bold text-white leading-tight tracking-tight">
            Master Your Learning Journey
          </h1>
          <p className="mt-4 max-w-md text-emerald-50/85 text-lg leading-relaxed">
            Join a community where students teach students. Create courses, share knowledge, and build your future.
          </p>

          {/* Features */}
          <ul className="mt-8 flex flex-wrap justify-center gap-3">
            {[
              { icon: BookOpenIcon, text: "50+ Free Lessons" },
              { icon: UsersIcon, text: "1,000+ Students" },
              { icon: AwardIcon, text: "Build Your Portfolio" },
            ].map((item) => (
              <li
                key={item.text}
                className="flex items-center gap-2 rounded-full bg-white/10 border border-white/15 backdrop-blur-sm px-4 py-2 text-sm font-medium text-white/90"
              >
                <item.icon className="w-4 h-4 text-emerald-200" />
                {item.text}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-emerald-200/60 text-sm relative z-10">
          © {new Date().getFullYear()} EduBoost. All rights reserved.
        </p>
      </div>

      {/* Right Side - White Background with Form */}
      <div className="w-full lg:w-1/2 edu-gradient-subtle flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Back to Home */}
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-slate-500 hover:text-emerald-600 transition-colors mb-8 text-sm font-medium"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back to Home
          </Link>

          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <Image
              src="/logo_eduboost.png"
              alt="EduBoost Logo"
              width={32}
              height={32}
              className="rounded-lg"
            />
            <span className="text-xl font-bold text-slate-800 tracking-tight">
              Edu<span className="text-emerald-600">Boost</span>
            </span>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight mb-2">
              Welcome Back
            </h2>
            <p className="text-slate-500">
              Sign in to continue your learning journey
            </p>
          </div>

          <div className="flex justify-center">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default Layout;
