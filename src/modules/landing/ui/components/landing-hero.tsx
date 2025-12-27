"use client";

import { Button } from "@/components/ui/button";
import { SignUpButton } from "@clerk/nextjs";
import { ArrowRightIcon, SparklesIcon, CheckCircleIcon, BookOpenIcon, UsersIcon, AwardIcon } from "lucide-react";
import { BrowserMockup } from "./browser-mockup";

export const LandingHero = () => {
  return (
    <section className="pt-32 pb-20 relative">
      {/* Hero Content */}
      <div className="max-w-5xl mx-auto text-center px-4 pt-8 pb-16">
        {/* Badge - Animated */}
        <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200/60 text-emerald-700 px-4 py-2 rounded-full text-sm font-medium mb-8 shadow-sm animate-fade-in-up">
          <SparklesIcon className="w-4 h-4 animate-pulse" />
          <span>Free Peer-to-Peer Learning Platform</span>
        </div>

        {/* Headline - Animated */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-slate-800 mb-6 animate-fade-in-up animation-delay-100">
          Learn Together.
          <span className="block edu-text-gradient animate-gradient bg-[length:200%_auto]">Grow Together.</span>
        </h1>

        {/* Subheadline - Animated */}
        <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up animation-delay-200">
          Join a community where students teach students. Create courses, share
          knowledge, and build your future—<span className="font-semibold text-emerald-600">completely free</span>.
        </p>

        {/* CTA Buttons - Animated */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up animation-delay-300">
          <SignUpButton>
            <Button
              size="lg"
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-8 py-6 text-base font-semibold shadow-lg shadow-emerald-600/30 transition-all hover:shadow-xl hover:shadow-emerald-600/40 hover:scale-105 group"
            >
              Start Learning Free
              <ArrowRightIcon className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </SignUpButton>
        </div>

        {/* Trust Indicators - Animated */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-8 mt-12 text-sm text-slate-600 animate-fade-in-up animation-delay-400">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 border-2 border-white shadow-sm animate-fade-in"
                  style={{ animationDelay: `${400 + i * 100}ms` }}
                />
              ))}
            </div>
            <span className="font-medium">1,000+ students</span>
          </div>
          <div className="hidden sm:block w-px h-5 bg-slate-200"></div>
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <svg
                key={i}
                className="w-4 h-4 text-amber-400 fill-current animate-scale-in"
                style={{ animationDelay: `${500 + i * 50}ms` }}
                viewBox="0 0 20 20"
              >
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
              </svg>
            ))}
            <span className="ml-1 font-medium">4.9/5 rating</span>
          </div>
          <div className="hidden sm:block w-px h-5 bg-slate-200"></div>
          <div className="flex items-center gap-1.5">
            <CheckCircleIcon className="w-4 h-4 text-emerald-500" />
            <span className="font-medium">100% Free</span>
          </div>
        </div>
      </div>

      {/* Floating Cards - Animated */}
      <div className="hidden lg:block absolute top-40 left-8 animate-float">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-xl border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
              <BookOpenIcon className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="font-semibold text-slate-800 text-sm">50+ Lessons</p>
              <p className="text-xs text-slate-500">Created by students</p>
            </div>
          </div>
        </div>
      </div>

      <div className="hidden lg:block absolute top-60 right-12 animate-float-delay-1">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-xl border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center">
              <UsersIcon className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <p className="font-semibold text-slate-800 text-sm">1000+ Students</p>
              <p className="text-xs text-slate-500">Learning together</p>
            </div>
          </div>
        </div>
      </div>

      <div className="hidden lg:block absolute bottom-40 left-16 animate-float-delay-2">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-xl border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-100 flex items-center justify-center">
              <AwardIcon className="w-5 h-5 text-cyan-600" />
            </div>
            <div>
              <p className="font-semibold text-slate-800 text-sm">Build Skills</p>
              <p className="text-xs text-slate-500">Grow your portfolio</p>
            </div>
          </div>
        </div>
      </div>

      {/* Browser Mockup */}
      <div className="animate-fade-in-up animation-delay-500">
        <BrowserMockup />
      </div>
    </section>
  );
};
