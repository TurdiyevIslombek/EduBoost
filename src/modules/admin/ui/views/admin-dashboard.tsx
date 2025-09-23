"use client";

import { trpc } from "@/trpc/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  VideoIcon, 
  UsersIcon, 
  EyeIcon, 
  TagIcon,
  TrendingUpIcon,
  PlayIcon
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Image from "next/image";

export const AdminDashboard = () => {
  const { data: stats, isLoading: statsLoading, error: statsError } = trpc.admin.getStats.useQuery();
  const { data: recentVideos, isLoading: videosLoading, error: videosError } = trpc.admin.getRecentVideos.useQuery();
  const { data: recentUsers, isLoading: usersLoading, error: usersError } = trpc.admin.getRecentUsers.useQuery();
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Admin Dashboard
        </h1>
        <p className="text-gray-600 mt-2">
          Monitor and manage your EduBoost platform
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Videos"
          icon={VideoIcon}
          value={statsLoading ? "Loading..." : statsError ? "Error" : stats?.totalVideos.toString() || "0"}
          description="Published videos"
          gradient="from-blue-500 to-blue-600"
          isLoading={statsLoading}
          error={statsError}
        />
        <StatsCard
          title="Total Users"
          icon={UsersIcon}
          value={statsLoading ? "Loading..." : statsError ? "Error" : stats?.totalUsers.toString() || "0"}
          description="Registered users"
          gradient="from-green-500 to-green-600"
          isLoading={statsLoading}
          error={statsError}
        />
        <StatsCard
          title="Total Views"
          icon={EyeIcon}
          value={statsLoading ? "Loading..." : statsError ? "Error" : stats?.totalViews.toString() || "0"}
          description="Video views"
          gradient="from-purple-500 to-purple-600"
          isLoading={statsLoading}
          error={statsError}
        />
        <StatsCard
          title="Categories"
          icon={TagIcon}
          value={statsLoading ? "Loading..." : statsError ? "Error" : stats?.totalCategories.toString() || "0"}
          description="Content categories"
          gradient="from-orange-500 to-orange-600"
          isLoading={statsLoading}
          error={statsError}
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUpIcon className="size-5" />
              Recent Videos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {videosLoading ? (
                <div className="text-center text-gray-500 py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  Loading recent videos...
                </div>
              ) : videosError ? (
                <div className="text-center text-red-500 py-8">
                  <p>Error loading videos</p>
                  <p className="text-sm text-gray-500">{videosError.message}</p>
                </div>
              ) : recentVideos && recentVideos.length > 0 ? (
                recentVideos.map((video) => (
                  <div key={video.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50/50 transition-colors">
                    <Image
                      src={video.thumbnailUrl || "/placeholder.svg"}
                      alt={video.title}
                      width={60}
                      height={40}
                      className="rounded-lg object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg";
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{video.title}</p>
                      <p className="text-xs text-gray-500">{video.user?.name}</p>
                      <p className="text-xs text-gray-400">
                        {formatDistanceToNow(new Date(video.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    <Badge variant={video.visibility === "public" ? "default" : "secondary"}>
                      {video.visibility}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-8">
                  No videos yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UsersIcon className="size-5" />
              Recent Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {usersLoading ? (
                <div className="text-center text-gray-500 py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  Loading recent users...
                </div>
              ) : usersError ? (
                <div className="text-center text-red-500 py-8">
                  <p>Error loading users</p>
                  <p className="text-sm text-gray-500">{usersError.message}</p>
                </div>
              ) : recentUsers && recentUsers.length > 0 ? (
                recentUsers.map((user) => (
                  <div key={user.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50/50 transition-colors">
                    <Image
                      src={user.imageUrl || "/user-placeholder.svg"}
                      alt={user.name}
                      width={40}
                      height={40}
                      className="rounded-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "/user-placeholder.svg";
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{user.name}</p>
                      <p className="text-xs text-gray-400">
                        Joined {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-8">
                  No users yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Overview */}
      <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlayIcon className="size-5" />
            Platform Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4">
              <div className="text-2xl font-bold text-blue-600 mb-2">100%</div>
              <div className="text-gray-600">System Health</div>
            </div>
            <div className="text-center p-4">
              <div className="text-2xl font-bold text-green-600 mb-2">24/7</div>
              <div className="text-gray-600">Uptime</div>
            </div>
            <div className="text-center p-4">
              <div className="text-2xl font-bold text-purple-600 mb-2">Fast</div>
              <div className="text-gray-600">Performance</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

interface StatsCardProps {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  value: string;
  description: string;
  gradient: string;
  isLoading?: boolean;
  error?: unknown;
}

const StatsCard = ({ title, icon: Icon, value, description, gradient, isLoading, error }: StatsCardProps) => {
  return (
    <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <div className="flex items-center gap-2">
              {isLoading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              )}
              <p className={`text-2xl font-bold ${error ? "text-red-500" : "text-gray-900"}`}>
                {value}
              </p>
            </div>
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          </div>
          <div className={`p-3 rounded-full bg-gradient-to-r ${gradient} text-white shadow-lg`}>
            <Icon className="size-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
