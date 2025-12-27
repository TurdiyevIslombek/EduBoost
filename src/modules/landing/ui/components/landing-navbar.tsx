"use client";

import { Button } from "@/components/ui/button";
import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { MenuIcon, XIcon, ArrowRightIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export const LandingNavbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-5xl">
      <div className="bg-white/90 backdrop-blur-xl border border-emerald-100/50 rounded-2xl px-6 py-3 shadow-lg shadow-emerald-900/5">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="relative">
              <Image
                src="/logo_eduboost.png"
                alt="EduBoost"
                width={32}
                height={32}
                className="rounded-lg"
              />
            </div>
            <span className="text-xl font-bold text-slate-800 tracking-tight">
              Edu<span className="text-emerald-600">Boost</span>
            </span>
          </Link>

          {/* Center Links (desktop) */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="#features"
              className="text-slate-600 hover:text-emerald-600 text-sm font-medium transition-colors"
            >
              Features
            </Link>
            <Link
              href="/about"
              className="text-slate-600 hover:text-emerald-600 text-sm font-medium transition-colors"
            >
              About
            </Link>
            <Link
              href="/contact"
              className="text-slate-600 hover:text-emerald-600 text-sm font-medium transition-colors"
            >
              Contact
            </Link>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-3">
              <SignInButton>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 font-medium rounded-xl"
                >
                  Sign In
                </Button>
              </SignInButton>
              <SignUpButton>
                <Button
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-5 font-medium shadow-md shadow-emerald-600/25"
                >
                  Get Started
                  <ArrowRightIcon className="ml-1.5 w-4 h-4" />
                </Button>
              </SignUpButton>
            </div>

            {/* Mobile menu toggle */}
            <button
              className="md:hidden inline-flex items-center justify-center p-2 text-slate-700 rounded-xl hover:bg-emerald-50"
              aria-label="Toggle navigation"
              onClick={() => setOpen((v) => !v)}
            >
              {open ? (
                <XIcon className="h-5 w-5" />
              ) : (
                <MenuIcon className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile dropdown panel */}
        {open && (
          <div className="md:hidden pt-4 pb-2 space-y-2 border-t border-emerald-100 mt-4">
            <Link
              href="#features"
              className="block px-3 py-2.5 text-slate-700 font-medium hover:bg-emerald-50 rounded-xl"
            >
              Features
            </Link>
            <Link
              href="/about"
              className="block px-3 py-2.5 text-slate-700 font-medium hover:bg-emerald-50 rounded-xl"
            >
              About
            </Link>
            <Link
              href="/contact"
              className="block px-3 py-2.5 text-slate-700 font-medium hover:bg-emerald-50 rounded-xl"
            >
              Contact
            </Link>
            <div className="flex gap-2 pt-3">
              <SignInButton>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 font-medium rounded-xl border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                >
                  Sign In
                </Button>
              </SignInButton>
              <SignUpButton>
                <Button
                  size="sm"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium"
                >
                  Get Started
                </Button>
              </SignUpButton>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
