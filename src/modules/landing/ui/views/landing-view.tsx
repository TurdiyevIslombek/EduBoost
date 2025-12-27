"use client";

import { LandingHero } from "../components/landing-hero";
import { LandingFeatures } from "../components/landing-features";
import { LandingNavbar } from "../components/landing-navbar";
import { LandingFooter } from "../components/landing-footer";
import { AuthRedirect } from "@/components/auth-redirect";

export const LandingView = () => {
  return (
    <AuthRedirect>
      <div className="min-h-screen bg-white overflow-hidden">
        {/* Animated background */}
        <div className="fixed inset-0 -z-10">
          <div className="absolute inset-0 edu-gradient-subtle" />
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-200/30 rounded-full blur-3xl animate-blob" />
          <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-teal-200/30 rounded-full blur-3xl animate-blob animation-delay-2000" />
          <div className="absolute bottom-1/4 left-1/3 w-[600px] h-[600px] bg-cyan-200/20 rounded-full blur-3xl animate-blob animation-delay-4000" />
        </div>
        
        <LandingNavbar />
        <LandingHero />
        <LandingFeatures />
        <LandingFooter />
      </div>
    </AuthRedirect>
  );
};
