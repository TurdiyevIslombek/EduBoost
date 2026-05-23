import type { Metadata } from "next";
import {Inter} from "next/font/google";
import {ClerkProvider} from "@clerk/nextjs"
import { SpeedInsights } from "@vercel/speed-insights/next"
import Script from "next/script";
import "./globals.css";
import { TRPCProvider } from "@/trpc/client";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

const SITE_URL = "https://www.eduboostonline.com";
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-default.png`;

export const metadata: Metadata = {
  title: {
    default: "EduBoost - Online Learning Platform | EduBoostOnline",
    template: "%s | EduBoost",
  },
  description: "EduBoost (EduBoostOnline) is the best online learning platform to boost your education with high-quality video courses and tutorials. Learn at eduboostonline.com",
  keywords: ["eduboost", "eduboostonline", "edu boost", "eduboost online", "education", "online learning", "courses", "tutorials", "video courses"],
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: "/",
  },
  manifest: "/site.webmanifest",
  openGraph: {
    title: "EduBoost - Online Learning Platform",
    description: "Boost your education with high-quality video courses and tutorials.",
    url: SITE_URL,
    siteName: "EduBoost",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "EduBoost - Online Learning Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "EduBoost - Online Learning Platform",
    description: "Boost your education with high-quality video courses and tutorials.",
    images: [DEFAULT_OG_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  verification: {
    google: "3ZSE8oN76hvrPehAufQRY2j31MF1Mf5ZU_zSPGPVufo",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "EduBoost",
  alternateName: "EduBoostOnline",
  url: SITE_URL,
  logo: `${SITE_URL}/logo_eduboost.png`,
  description:
    "EduBoost is a free peer-to-peer online learning platform where students teach students through high-quality video courses.",
  sameAs: ["https://t.me/Islombek_0072"],
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "EduBoost",
  url: SITE_URL,
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE_URL}/search?query={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
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
          <Script
            id="ld-organization"
            type="application/ld+json"
            strategy="beforeInteractive"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
          />
          <Script
            id="ld-website"
            type="application/ld+json"
            strategy="beforeInteractive"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
          />
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
