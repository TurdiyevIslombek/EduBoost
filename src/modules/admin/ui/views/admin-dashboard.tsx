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
  MessageSquareIcon,
  BarChart3Icon,
  SettingsIcon,
  ArrowRightIcon,
  SparklesIcon,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { AdminImage } from "@/components/admin-image";
import { AdminStatCard } from "../components/admin-stat-card";

const quickActions = [
  { title: "Manage Videos", description: "Visibility, metrics, schedules", href: "/admin/videos", icon: VideoIcon, gradient: "from-emerald-500 to-emerald-600" },
  { title: "Manage Users", description: "Invites, subscribers, cleanup", href: "/admin/users", icon: UsersIcon, gradient: "from-teal-500 to-teal-600" },
  { title: "Moderate Comments", description: "Review the latest comments", href: "/admin/comments", icon: MessageSquareIcon, gradient: "from-cyan-500 to-cyan-600" },
  { title: "View Analytics", description: "Views, top videos, trends", href: "/admin/analytics", icon: BarChart3Icon, gradient: "from-emerald-600 to-teal-700" },
];

export const AdminDashboard = () => {
  const { data: stats, isLoading: statsLoading, error: statsError } = trpc.admin.getStats.useQuery();
  const { data: recentVideos, isLoading: videosLoading, error: videosError } = trpc.admin.getRecentVideos.useQuery();
  const { data: recentUsers, isLoading: usersLoading, error: usersError } = trpc.admin.getRecentUsers.useQuery();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
          Admin Dashboard
        </h1>
        <p className="text-gray-600 mt-2">
          Monitor and manage your EduBoost platform
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <AdminStatCard
          title="Total Videos"
          icon={VideoIcon}
          value={stats?.totalVideos ?? 0}
          description={stats ? `${stats.publicVideos} public` : "Published videos"}
          gradient="from-emerald-500 to-emerald-600"
          isLoading={statsLoading}
          error={!!statsError}
        />
        <AdminStatCard
          title="Total Users"
          icon={UsersIcon}
          value={stats?.totalUsers ?? 0}
          description={stats ? `+${stats.recentUsers} this week` : "Registered users"}
          gradient="from-teal-500 to-teal-600"
          isLoading={statsLoading}
          error={!!statsError}
        />
        <AdminStatCard
          title="Total Views"
          icon={EyeIcon}
          value={(stats?.totalViews ?? 0).toLocaleString()}
          description={stats ? `${stats.realViews.toLocaleString()} organic` : "Displayed views"}
          gradient="from-cyan-500 to-teal-600"
          isLoading={statsLoading}
          error={!!statsError}
        />
        <AdminStatCard
          title="Comments"
          icon={MessageSquareIcon}
          value={stats?.totalComments ?? 0}
          description="Across all videos"
          gradient="from-emerald-600 to-teal-700"
          isLoading={statsLoading}
          error={!!statsError}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Link key={action.href} href={action.href} className="group">
              <Card className="h-full bg-white/70 backdrop-blur-sm border-white/50 shadow-md hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-1 transition-all duration-300">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl bg-gradient-to-br ${action.gradient} text-white shadow-md transition-transform duration-300 group-hover:scale-110`}>
                    <Icon className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-900 truncate">{action.title}</p>
                    <p className="text-xs text-gray-500 truncate">{action.description}</p>
                  </div>
                  <ArrowRightIcon className="size-4 text-gray-300 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all duration-200" />
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white/70 backdrop-blur-sm border-white/50 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="flex items-center gap-2">
              <TrendingUpIcon className="size-5 text-emerald-600" />
              Recent Videos
            </CardTitle>
            <Link href="/admin/videos" className="text-xs font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
              View all <ArrowRightIcon className="size-3" />
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-1.5">
              {videosLoading ? (
                <ListSkeleton />
              ) : videosError ? (
                <ErrorState message={videosError.message} />
              ) : recentVideos && recentVideos.length > 0 ? (
                recentVideos.slice(0, 6).map((video) => (
                  <Link
                    key={video.id}
                    href={`/videos/${video.id}`}
                    target="_blank"
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-emerald-50/60 transition-colors"
                  >
                    <AdminImage
                      src={video.thumbnailUrl || "/placeholder.svg"}
                      alt={video.title}
                      width={60}
                      height={40}
                      className="rounded-lg object-cover w-[60px] h-[40px] bg-gray-100"
                      fallback="/placeholder.svg"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{video.title}</p>
                      <p className="text-xs text-gray-500 truncate">
                        {video.user?.name} · {formatDistanceToNow(new Date(video.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    <Badge
                      variant={video.visibility === "public" ? "default" : "secondary"}
                      className={video.visibility === "public" ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100" : ""}
                    >
                      {video.visibility}
                    </Badge>
                  </Link>
                ))
              ) : (
                <EmptyState message="No videos yet" />
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm border-white/50 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="flex items-center gap-2">
              <UsersIcon className="size-5 text-teal-600" />
              Recent Users
            </CardTitle>
            <Link href="/admin/users" className="text-xs font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
              View all <ArrowRightIcon className="size-3" />
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-1.5">
              {usersLoading ? (
                <ListSkeleton />
              ) : usersError ? (
                <ErrorState message={usersError.message} />
              ) : recentUsers && recentUsers.length > 0 ? (
                recentUsers.slice(0, 6).map((user) => (
                  <Link
                    key={user.id}
                    href={`/users/${user.id}`}
                    target="_blank"
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-emerald-50/60 transition-colors"
                  >
                    <AdminImage
                      src={user.imageUrl || "/user-placeholder.svg"}
                      alt={user.name}
                      width={40}
                      height={40}
                      className="rounded-full object-cover w-10 h-10 bg-gray-100"
                      fallback="/user-placeholder.svg"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{user.name}</p>
                      <p className="text-xs text-gray-400">
                        Joined {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </Link>
                ))
              ) : (
                <EmptyState message="No users yet" />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Platform Snapshot — real numbers only */}
      <Card className="bg-white/70 backdrop-blur-sm border-white/50 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SparklesIcon className="size-5 text-emerald-600" />
            Platform Snapshot
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <SnapshotItem
              label="Views this week"
              value={statsLoading ? null : (stats?.viewsThisWeek ?? 0).toLocaleString()}
              accent="text-emerald-600"
            />
            <SnapshotItem
              label="Public videos"
              value={statsLoading ? null : `${stats?.publicVideos ?? 0} / ${stats?.totalVideos ?? 0}`}
              accent="text-teal-600"
            />
            <SnapshotItem
              label="New users (7d)"
              value={statsLoading ? null : `+${stats?.recentUsers ?? 0}`}
              accent="text-cyan-600"
            />
            <SnapshotItem
              label="Categories"
              value={statsLoading ? null : stats?.totalCategories ?? 0}
              accent="text-emerald-700"
              icon={TagIcon}
            />
          </div>
          <div className="mt-4 flex justify-end">
            <Link
              href="/admin/settings"
              className="text-xs font-medium text-gray-500 hover:text-emerald-700 flex items-center gap-1 transition-colors"
            >
              <SettingsIcon className="size-3.5" />
              System status & settings
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const SnapshotItem = ({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number | null;
  accent: string;
  icon?: React.ComponentType<{ className?: string }>;
}) => (
  <div className="text-center p-4 rounded-2xl bg-gradient-to-b from-white/60 to-emerald-50/40 border border-emerald-100/60">
    {value === null ? (
      <div className="h-8 w-16 mx-auto rounded-md bg-gray-200 animate-pulse mb-1" />
    ) : (
      <div className={`text-2xl font-bold tabular-nums ${accent}`}>{value}</div>
    )}
    <div className="text-xs text-gray-600 mt-1">{label}</div>
  </div>
);

const ListSkeleton = () => (
  <div className="space-y-2">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="flex items-center gap-3 p-2.5">
        <div className="w-[60px] h-[40px] bg-gray-200 rounded-lg animate-pulse" />
        <div className="flex-1 space-y-1.5">
          <div className="h-3.5 bg-gray-200 rounded w-3/4 animate-pulse" />
          <div className="h-3 bg-gray-100 rounded w-1/2 animate-pulse" />
        </div>
      </div>
    ))}
  </div>
);

const ErrorState = ({ message }: { message: string }) => (
  <div className="text-center text-red-500 py-8">
    <p className="font-medium">Something went wrong</p>
    <p className="text-sm text-gray-500 mt-1">{message}</p>
  </div>
);

const EmptyState = ({ message }: { message: string }) => (
  <div className="text-center text-gray-500 py-8">{message}</div>
);
