"use client";

import { Button } from "@/components/ui/button";
import { SignUpButton } from "@clerk/nextjs";
import { ArrowRightIcon, StarIcon } from "lucide-react";
import { FloatingElements } from "./floating-elements";

export const LandingHero = () => {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/20 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-400/20 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-400/20 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left px-4 lg:px-0">
            <div className="inline-flex items-center px-4 py-2 bg-green-50 rounded-full text-green-700 text-sm font-medium mb-6">
              <StarIcon className="w-4 h-4 mr-2" />
              100% FREE Platform
            </div>
            
            <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold leading-tight mb-6">
              <span className="text-gray-900">Welcome to EduBoost –</span>
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Where Learning Meets Teaching
              </span>
            </h1>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-lg border border-white/50 mb-8">
              <p className="text-base sm:text-lg text-gray-800 font-medium">
                <strong>Our Mission:</strong> To create a community where students learn best—by teaching each other.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <SignUpButton>
                <Button 
                  size="lg" 
                  className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300"
                >
                  Get Started
                  <ArrowRightIcon className="ml-2 w-5 h-5" />
                </Button>
              </SignUpButton>
            </div>
            
            {/* Stats */}
            <div className="flex flex-wrap gap-8 justify-center lg:justify-start">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">FREE</div>
                <div className="text-sm text-gray-500">Forever</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">🤝</div>
                <div className="text-sm text-gray-500">Volunteering</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">👥</div>
                <div className="text-sm text-gray-500">Peer Learning</div>
              </div>
            </div>
          </div>

          {/* Right 3D Elements */}
          <div className="relative lg:h-[600px] flex items-center justify-center">
            <FloatingElements />
          </div>
        </div>
      </div>
    </div>
  );
};
