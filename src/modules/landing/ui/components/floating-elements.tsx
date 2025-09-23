"use client";

import { 
  BookOpenIcon, 
  GraduationCapIcon, 
  PlayCircleIcon, 
  UsersIcon, 
  TrendingUpIcon,
  HeartIcon,
  StarIcon,
  AwardIcon
} from "lucide-react";

export const FloatingElements = () => {
  return (
    <div className="relative w-full h-full hidden lg:block">
      {/* Central 3D Card */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="relative">
          {/* Main Video Card */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/50 overflow-hidden transform rotate-3 hover:rotate-0 transition-all duration-500 w-80 h-48">
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 h-32 flex items-center justify-center">
              <PlayCircleIcon className="w-16 h-16 text-white" />
            </div>
            <div className="p-4">
              <div className="h-2 bg-gray-200 rounded mb-2"></div>
              <div className="h-2 bg-gray-100 rounded w-3/4"></div>
            </div>
          </div>

          {/* Floating Icons */}
          <div className="absolute -top-8 -left-8 animate-float">
            <div className="bg-blue-500 p-3 rounded-full shadow-lg">
              <BookOpenIcon className="w-6 h-6 text-white" />
            </div>
          </div>

          <div className="absolute -top-4 -right-8 animate-float-delay-1">
            <div className="bg-purple-500 p-3 rounded-full shadow-lg">
              <GraduationCapIcon className="w-6 h-6 text-white" />
            </div>
          </div>

          <div className="absolute -bottom-4 -left-12 animate-float-delay-2">
            <div className="bg-indigo-500 p-3 rounded-full shadow-lg">
              <UsersIcon className="w-6 h-6 text-white" />
            </div>
          </div>

          <div className="absolute -bottom-8 -right-4 animate-float-delay-3">
            <div className="bg-pink-500 p-3 rounded-full shadow-lg">
              <TrendingUpIcon className="w-6 h-6 text-white" />
            </div>
          </div>

          <div className="absolute top-12 -right-16 animate-float">
            <div className="bg-green-500 p-2 rounded-full shadow-lg">
              <HeartIcon className="w-4 h-4 text-white" />
            </div>
          </div>

          <div className="absolute bottom-16 -left-16 animate-float-delay-1">
            <div className="bg-yellow-500 p-2 rounded-full shadow-lg">
              <StarIcon className="w-4 h-4 text-white" />
            </div>
          </div>

          <div className="absolute top-1/3 -left-20 animate-float-delay-2">
            <div className="bg-red-500 p-2 rounded-full shadow-lg">
              <AwardIcon className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Background Cards */}
      <div className="absolute top-20 left-8 transform rotate-12 opacity-60">
        <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg border border-white/50 w-64 h-40">
          <div className="bg-gradient-to-br from-green-500 to-teal-500 h-24 rounded-t-xl"></div>
          <div className="p-3">
            <div className="h-2 bg-gray-200 rounded mb-1"></div>
            <div className="h-2 bg-gray-100 rounded w-2/3"></div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-20 right-8 transform -rotate-12 opacity-60">
        <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg border border-white/50 w-64 h-40">
          <div className="bg-gradient-to-br from-orange-500 to-red-500 h-24 rounded-t-xl"></div>
          <div className="p-3">
            <div className="h-2 bg-gray-200 rounded mb-1"></div>
            <div className="h-2 bg-gray-100 rounded w-2/3"></div>
          </div>
        </div>
      </div>

      {/* Orbital Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400 rounded-full animate-ping"></div>
        <div className="absolute bottom-1/4 right-1/4 w-2 h-2 bg-purple-400 rounded-full animate-ping animation-delay-1000"></div>
        <div className="absolute top-3/4 left-1/3 w-1 h-1 bg-pink-400 rounded-full animate-ping animation-delay-2000"></div>
      </div>
    </div>
  );
};
