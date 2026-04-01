import { LandingView } from "@/modules/landing/ui/views/landing-view";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "EduBoost - Free Online Learning Platform by Students",
  description: "EduBoost is a free online learning platform where students teach students. Create and watch video courses, build your teaching portfolio, and boost your education at eduboostonline.com.",
  openGraph: {
    title: "EduBoost - Free Online Learning Platform by Students",
    description: "Create and watch free video courses. Students teaching students.",
    url: "https://www.eduboostonline.com",
  },
};

const RootPage = () => {
  return <LandingView />;
}

export default RootPage;
