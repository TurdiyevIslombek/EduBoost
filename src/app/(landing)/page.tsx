import { LandingView } from "@/modules/landing/ui/views/landing-view";
import type { Metadata } from "next";

export const metadata: Metadata = {
  // absolute: skip the root "%s | EduBoost" template so the brand isn't doubled.
  title: { absolute: "EduBoost - Free Online Learning Platform by Students" },
  description: "EduBoost is a free online learning platform where students teach students. Create and watch video courses, build your teaching portfolio, and boost your education at eduboostonline.com.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "EduBoost - Free Online Learning Platform by Students",
    description: "Create and watch free video courses. Students teaching students.",
    url: "https://www.eduboostonline.com",
    siteName: "EduBoost",
    type: "website",
    // Child openGraph replaces the root's entirely, so the image must be
    // repeated here or the landing page ships without one.
    images: [
      {
        url: "https://www.eduboostonline.com/og-default.png",
        width: 1200,
        height: 630,
        alt: "EduBoost - Online Learning Platform",
      },
    ],
  },
};

const RootPage = () => {
  return <LandingView />;
}

export default RootPage;
