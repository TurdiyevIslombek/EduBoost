"use client";

import Image from "next/image";
import Link from "next/link";
import { HeartIcon } from "lucide-react";

export const LandingFooter = () => {
  return (
    <footer className="bg-slate-50 border-t border-slate-200 py-16">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col items-center gap-8">
          {/* Logo and tagline */}
          <div className="flex flex-col items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5">
              <Image
                src="/logo_eduboost.png"
                alt="EduBoost"
                width={36}
                height={36}
                className="rounded-lg"
              />
              <span className="text-2xl font-bold text-slate-800 tracking-tight">
                Edu<span className="text-emerald-600">Boost</span>
              </span>
            </Link>
            <p className="text-slate-500 text-sm">
              Empowering students to teach and learn together
            </p>
          </div>

          {/* Links */}
          <div className="flex items-center gap-8 text-sm">
            <Link
              href="/about"
              className="text-slate-600 hover:text-emerald-600 transition-colors font-medium"
            >
              About
            </Link>
            <Link
              href="/contact"
              className="text-slate-600 hover:text-emerald-600 transition-colors font-medium"
            >
              Contact
            </Link>
            <Link
              href="#features"
              className="text-slate-600 hover:text-emerald-600 transition-colors font-medium"
            >
              Features
            </Link>
          </div>

          {/* Divider */}
          <div className="w-full max-w-md h-px bg-slate-200"></div>

          {/* Copyright */}
          <div className="flex flex-col sm:flex-row items-center gap-2 text-sm text-slate-500">
            <p>© {new Date().getFullYear()} EduBoost. All rights reserved.</p>
            <span className="hidden sm:block">•</span>
            <p className="flex items-center gap-1">
              Made with <HeartIcon className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500" /> for students
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
