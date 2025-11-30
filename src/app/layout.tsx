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
    default: "EduBoost - Online Learning Platform",
    template: "%s | EduBoost",
  },
  description: "EduBoost is the best online learning platform to boost your education with high-quality video courses and tutorials.",
  keywords: ["education", "online learning", "courses", "tutorials", "eduboost", "video courses"],
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
