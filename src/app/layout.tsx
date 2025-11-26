import type { Metadata } from "next";
import {Inter} from "next/font/google";
import {ClerkProvider} from "@clerk/nextjs"
import { SpeedInsights } from "@vercel/speed-insights/next"
import "./globals.css";
import { TRPCProvider } from "@/trpc/client";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EduBoost",
  description: "The best platform to boost your education",
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
