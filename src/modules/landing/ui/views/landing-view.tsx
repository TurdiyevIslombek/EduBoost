import { LandingHero } from "../components/landing-hero";
import { LandingFeatures } from "../components/landing-features";
import { LandingNavbar } from "../components/landing-navbar";
import { AuthRedirect } from "@/components/auth-redirect";

export const LandingView = () => {
  return (
    <AuthRedirect>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <LandingNavbar />
        <LandingHero />
        <LandingFeatures />
      </div>
    </AuthRedirect>
  );
};
