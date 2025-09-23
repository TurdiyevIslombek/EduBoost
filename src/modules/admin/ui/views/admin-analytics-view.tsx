"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart3Icon, 
  TrendingUpIcon, 
  UsersIcon,
  VideoIcon,
  EyeIcon
} from "lucide-react";
import Image from "next/image";
import { trpc } from "@/trpc/client";

export const AdminAnalyticsView = () => {
  const { data: stats, isLoading: statsLoading, error: statsError } = trpc.admin.getStats.useQuery();
  const { data: videoStats, isLoading: videoStatsLoading } = trpc.admin.getVideoStats.useQuery();
  const { data: userStats, isLoading: userStatsLoading } = trpc.admin.getUserStats.useQuery();
  const { data: recentVideos, isLoading: recentVideosLoading } = trpc.admin.getRecentVideos.useQuery();
  const { data: viewsOverTime, isLoading: viewsLoading } = trpc.admin.getViewsOverTime.useQuery({ days: 7 });

  if (statsError) {
    return (
      <div className="space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Analytics Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Detailed insights and platform metrics
          </p>
        </div>
        <Card className="bg-red-50 border-red-200 shadow-lg">
          <CardContent className="p-6">
            <div className="text-center text-red-600">
              <p className="text-lg font-medium">Access Denied</p>
              <p className="text-sm mt-2">You need admin privileges to view analytics.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Analytics Dashboard
        </h1>
        <p className="text-gray-600 mt-2">
          Detailed insights and platform metrics
        </p>
      </div>

      {/* Platform Overview */}
      <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3Icon className="size-5" />
            Platform Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {statsLoading ? "..." : (stats?.totalVideos || 0)}
              </div>
              <div className="text-sm text-gray-600">Total Videos</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {statsLoading ? "..." : (stats?.totalUsers || 0)}
              </div>
              <div className="text-sm text-gray-600">Total Users</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {statsLoading ? "..." : (stats?.totalViews || 0)}
              </div>
              <div className="text-sm text-gray-600">Total Views</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {statsLoading ? "..." : (stats?.totalCategories || 0)}
              </div>
              <div className="text-sm text-gray-600">Categories</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Views</p>
                <p className="text-2xl font-bold text-gray-900">
                  {statsLoading ? "..." : (stats?.totalViews || 0)}
                </p>
                <p className="text-xs text-green-600 mt-1">Real-time data</p>
              </div>
              <div className="p-3 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg">
                <EyeIcon className="size-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Videos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {statsLoading ? "..." : (stats?.totalVideos || 0)}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  {statsLoading ? "..." : `${stats?.publicVideos || 0} public`}
                </p>
              </div>
              <div className="p-3 rounded-full bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg">
                <VideoIcon className="size-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {statsLoading ? "..." : (stats?.totalUsers || 0)}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  {statsLoading ? "..." : `${stats?.recentUsers || 0} new this week`}
                </p>
              </div>
              <div className="p-3 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg">
                <UsersIcon className="size-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Categories</p>
                <p className="text-2xl font-bold text-gray-900">
                  {statsLoading ? "..." : (stats?.totalCategories || 0)}
                </p>
                <p className="text-xs text-green-600 mt-1">Content categories</p>
              </div>
              <div className="p-3 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg">
                <TrendingUpIcon className="size-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3Icon className="size-5" />
              Views Over Time (Last 7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {viewsLoading ? (
              <div className="h-64 flex items-center justify-center text-gray-500">
                <p>Loading...</p>
              </div>
            ) : viewsOverTime && viewsOverTime.length > 0 ? (
              <div className="space-y-4">
                {/* Simple bar chart using CSS */}
                <div className="h-48 flex items-end gap-2 justify-between px-4">
                  {viewsOverTime.map((item, index) => {
                    const maxViews = Math.max(...viewsOverTime.map(d => d.count));
                    const height = maxViews === 0 ? 4 : Math.max(4, (item.count / maxViews) * 150);
                    
                    return (
                      <div key={index} className="flex flex-col items-center gap-2 flex-1">
                        <div className="text-xs text-gray-600 font-medium">
                          {item.count}
                        </div>
                        <div 
                          className="bg-gradient-to-t from-blue-500 to-blue-400 rounded-t w-8 min-h-[4px] transition-all"
                          style={{ height: `${height}px` }}
                        />
                        <div className="text-xs text-gray-500 transform rotate-45 whitespace-nowrap">
                          {new Date(item.date).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="text-center text-sm text-gray-600">
                  Total views: {viewsOverTime.reduce((sum, item) => sum + item.count, 0)}
                </div>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <BarChart3Icon className="size-12 mx-auto mb-4 text-gray-400" />
                  <p>No view data available for the last 7 days</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <VideoIcon className="size-5" />
              Recent Videos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentVideosLoading ? (
                <div className="text-center text-gray-500 py-8">
                  <p>Loading...</p>
                </div>
              ) : recentVideos && recentVideos.length > 0 ? (
                recentVideos.slice(0, 5).map((video) => (
                  <div key={video.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                    <div className="flex-shrink-0">
                      {video.thumbnailUrl ? (
                        <Image 
                          src={video.thumbnailUrl} 
                          alt={video.title}
                          width={64}
                          height={48}
                          className="w-16 h-12 object-cover rounded"
                        />
                      ) : (
                        <div className="w-16 h-12 bg-gray-200 rounded flex items-center justify-center">
                          <VideoIcon className="size-4 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {video.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        by {video.user?.name || 'Unknown'}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          video.visibility === 'public' 
                            ? 'bg-green-100 text-green-600' 
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {video.visibility}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <VideoIcon className="size-12 mx-auto mb-4 text-gray-400" />
                  <p>No videos available yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUpIcon className="size-5" />
            Platform Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {userStatsLoading ? "..." : (userStats?.newThisWeek || 0)}
              </div>
              <div className="text-gray-600">New Users This Week</div>
              <div className="text-xs text-gray-500 mt-1">Last 7 days</div>
            </div>
            <div className="text-center p-4">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {userStatsLoading ? "..." : (userStats?.contentCreators || 0)}
              </div>
              <div className="text-gray-600">Content Creators</div>
              <div className="text-xs text-gray-500 mt-1">Users with videos</div>
            </div>
            <div className="text-center p-4">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {videoStatsLoading ? "..." : (videoStats?.thisMonth || 0)}
              </div>
              <div className="text-gray-600">Videos This Month</div>
              <div className="text-xs text-gray-500 mt-1">New uploads</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
