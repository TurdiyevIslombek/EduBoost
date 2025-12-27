import Image from "next/image";
import Link from "next/link";
import { ArrowLeftIcon, BookOpenIcon, UsersIcon, AwardIcon } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen flex">
      {/* Left Side - Emerald Gradient Background with Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 flex-col justify-between p-12 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl animate-blob" />
          <div className="absolute bottom-40 right-20 w-96 h-96 bg-teal-300 rounded-full blur-3xl animate-blob animation-delay-2000" />
          <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-cyan-300 rounded-full blur-3xl animate-blob animation-delay-4000" />
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

        <div className="flex-1 flex flex-col justify-center max-w-md relative z-10">
          <h1 className="text-4xl font-bold text-white mb-6 leading-tight tracking-tight">
            Master Your Learning Journey
          </h1>
          <p className="text-emerald-100 text-lg mb-12 leading-relaxed">
            Join a community where students teach students. Create courses, share knowledge, and build your future.
          </p>

          {/* Features */}
          <div className="space-y-4 mb-12">
            {[
              { icon: BookOpenIcon, text: "50+ Free Lessons" },
              { icon: UsersIcon, text: "1,000+ Active Students" },
              { icon: AwardIcon, text: "Build Your Portfolio" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-white/90">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <item.icon className="w-5 h-5" />
                </div>
                <span className="font-medium">{item.text}</span>
              </div>
            ))}
          </div>

          {/* Testimonial */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <p className="text-white/90 italic mb-4">
              &quot;EduBoost transformed how I learn. Teaching others has made me a better student and leader.&quot;
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-white/30 to-white/10 flex items-center justify-center text-white font-semibold">
                A
              </div>
              <div>
                <p className="text-white font-semibold">Alex Chen</p>
                <p className="text-emerald-200 text-sm">Computer Science Student</p>
              </div>
            </div>
          </div>
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
