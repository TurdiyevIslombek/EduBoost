import type { Metadata } from "next";
import {Inter} from "next/font/google";
import {ClerkProvider} from "@clerk/nextjs"
import { SpeedInsights } from "@vercel/speed-insights/next"
import "./globals.css";
import { TRPCProvider } from "@/trpc/client";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "EduBoost - Online Learning Platform | EduBoostOnline",
    template: "%s | EduBoost",
  },
  description: "EduBoost (EduBoostOnline) is the best online learning platform to boost your education with high-quality video courses and tutorials. Learn at eduboostonline.com",
  keywords: ["eduboost", "eduboostonline", "edu boost", "eduboost online", "education", "online learning", "courses", "tutorials", "video courses"],
  metadataBase: new URL("https://www.eduboostonline.com"),
  openGraph: {
    title: "EduBoost - Online Learning Platform",
    description: "Boost your education with high-quality video courses and tutorials.",
    url: "https://www.eduboostonline.com",
    siteName: "EduBoost",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "EduBoost - Online Learning Platform",
    description: "Boost your education with high-quality video courses and tutorials.",
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: "3ZSE8oN76hvrPehAufQRY2j31MF1Mf5ZU_zSPGPVufo",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider 
      afterSignOutUrl="/"
      afterSignInUrl="/home"
      afterSignUpUrl="/home"
    >
      <html lang="en">
        <body
          className={inter.className}
        >
          <TRPCProvider>
            <Toaster />
            {children}
            <SpeedInsights />
          </TRPCProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
