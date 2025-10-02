"use client";

import { Button } from "@/components/ui/button";
import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { PlayCircleIcon, MenuIcon, XIcon } from "lucide-react";
import { useState } from "react";

export const LandingNavbar = () => {
  const [open, setOpen] = useState(false);

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

          {/* Navigation Links (desktop) */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-600 hover:text-blue-600 transition-colors">
              Features
            </a>
            <a href="/about" className="text-gray-600 hover:text-blue-600 transition-colors">
              About
            </a>
            <a href="/contact" className="text-gray-600 hover:text-blue-600 transition-colors">
              Contact
            </a>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-3">
            <div className="hidden md:flex items-center space-x-3">
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
            {/* Mobile menu toggle */}
            <button
              className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-gray-600 hover:text-blue-600"
              aria-label="Toggle navigation"
              onClick={() => setOpen(v => !v)}
            >
              {open ? <XIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown panel */}
        {open && (
          <div className="md:hidden pb-4 space-y-3">
            <a href="#features" className="block px-2 py-2 rounded-lg text-gray-700 hover:bg-blue-50">Features</a>
            <a href="/about" className="block px-2 py-2 rounded-lg text-gray-700 hover:bg-blue-50">About</a>
            <a href="/contact" className="block px-2 py-2 rounded-lg text-gray-700 hover:bg-blue-50">Contact</a>
            <div className="flex gap-2 pt-2">
              <SignInButton>
                <Button variant="ghost" size="sm" className="flex-1">Sign In</Button>
              </SignInButton>
              <SignUpButton>
                <Button size="sm" className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white">Get Started</Button>
              </SignUpButton>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
