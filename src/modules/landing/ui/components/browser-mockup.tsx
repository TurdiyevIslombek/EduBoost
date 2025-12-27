"use client";

import { PlayIcon, VideoIcon, UsersIcon, TrendingUpIcon } from "lucide-react";

export const BrowserMockup = () => {
  return (
    <div className="w-full max-w-5xl mx-auto px-4">
      <div className="relative">
        {/* Browser Frame */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-2xl shadow-slate-300/50 overflow-hidden">
          {/* Browser Header */}
          <div className="bg-slate-100 border-b border-slate-200 px-4 py-3 flex items-center gap-3">
            {/* Traffic Lights */}
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
            </div>

            {/* URL Bar */}
            <div className="flex-1 max-w-md mx-auto">
              <div className="bg-white border border-slate-200 rounded-md px-3 py-1.5 text-sm text-slate-500 text-center">
                eduboost.com/studio
              </div>
            </div>

            <div className="w-16"></div>
          </div>

          {/* Dashboard Content */}
          <div className="flex min-h-[400px]">
            {/* Sidebar */}
            <div className="w-56 bg-slate-900 p-4 hidden sm:block">
              <div className="flex items-center gap-2 mb-8">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
                  <PlayIcon className="w-4 h-4 text-white" />
                </div>
                <span className="text-white font-semibold">Studio</span>
              </div>

              <nav className="space-y-1">
                <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-emerald-600/20 text-emerald-400">
                  <VideoIcon className="w-4 h-4" />
                  <span className="text-sm">My Videos</span>
                </div>
                <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:text-white">
                  <TrendingUpIcon className="w-4 h-4" />
                  <span className="text-sm">Analytics</span>
                </div>
                <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:text-white">
                  <UsersIcon className="w-4 h-4" />
                  <span className="text-sm">Subscribers</span>
                </div>
              </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 bg-slate-50 p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-slate-900">
                  Your Videos
                </h2>
                <div className="bg-emerald-600 text-white text-sm px-4 py-2 rounded-lg font-medium">
                  + Upload Video
                </div>
              </div>

              {/* Video Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="bg-white border border-slate-200 rounded-lg overflow-hidden"
                  >
                    <div className="aspect-video bg-gradient-to-br from-slate-200 to-slate-300 relative">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <PlayIcon className="w-10 h-10 text-slate-400" />
                      </div>
                      <div className="absolute bottom-2 right-2 bg-slate-900 text-white text-xs px-2 py-1 rounded">
                        12:34
                      </div>
                    </div>
                    <div className="p-3">
                      <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-slate-100 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Glow Effect */}
        <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-cyan-500/20 rounded-2xl blur-2xl -z-10 opacity-60"></div>
      </div>
    </div>
  );
};
