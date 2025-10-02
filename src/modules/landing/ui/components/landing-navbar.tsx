"use client";

import { Button } from "@/components/ui/button";
import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { PlayCircleIcon } from "lucide-react";
import Link from "next/link";

export const LandingNavbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-2">
              <PlayCircleIcon className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              EduBoost
            </span>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-4 md:space-x-8">
            <a href="#features" className="text-gray-600 hover:text-blue-600 transition-colors text-sm md:text-base">
              Features
            </a>
            <Link href="/about" className="text-gray-600 hover:text-blue-600 transition-colors text-sm md:text-base">
              About
            </Link>
            <Link href="/contact" className="text-gray-600 hover:text-blue-600 transition-colors text-sm md:text-base">
              Contact
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="hidden sm:flex items-center space-x-3">
            <SignInButton>
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-blue-600">
                Sign In
              </Button>
            </SignInButton>
            <SignUpButton>
              <Button 
                size="sm" 
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
              >
                Get Started
              </Button>
            </SignUpButton>
          </div>
        </div>
      </div>
    </nav>
  );
};
