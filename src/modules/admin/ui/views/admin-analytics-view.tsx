"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart3Icon,
  TrendingUpIcon,
  UsersIcon,
  VideoIcon,
  EyeIcon,
  TrophyIcon,
  ThumbsUpIcon,
} from "lucide-react";
import { trpc } from "@/trpc/client";
import { useState } from "react";
import Link from "next/link";
import { AdminImage } from "@/components/admin-image";
import { AdminStatCard } from "../components/admin-stat-card";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export const AdminAnalyticsView = () => {
  const [days, setDays] = useState<7 | 30>(7);

  const { data: stats, isLoading: statsLoading, error: statsError } = trpc.admin.getStats.useQuery();
  const { data: userStats, isLoading: userStatsLoading } = trpc.admin.getUserStats.useQuery();
  const { data: videoStats, isLoading: videoStatsLoading } = trpc.admin.getVideoStats.useQuery();
  const { data: viewsOverTime, isLoading: viewsLoading } = trpc.admin.getViewsOverTime.useQuery({ days });
  const { data: topVideos, isLoading: topLoading } = trpc.admin.getTopVideos.useQuery({ limit: 8 });

  if (statsError) {
    return (
      <div className="space-y-6">
        <AnalyticsHeader />
        <Card className="bg-red-50 border-red-200 shadow-lg">
          <CardContent className="p-6">
            <div className="text-center text-red-600">
              <p className="text-lg font-medium">Couldn&apos;t load analytics</p>
              <p className="text-sm mt-2">{statsError.message}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const chartData = (viewsOverTime ?? []).map((item) => ({
    ...item,
    label: new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
  }));

  return (
    <div className="space-y-6">
      <AnalyticsHeader />

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <AdminStatCard
          title="Total Views"
          icon={EyeIcon}
          value={(stats?.totalViews ?? 0).toLocaleString()}
          description={stats ? `${stats.viewsThisWeek.toLocaleString()} this week` : undefined}
          gradient="from-emerald-500 to-emerald-600"
          isLoading={statsLoading}
        />
        <AdminStatCard
          title="Total Videos"
          icon={VideoIcon}
          value={stats?.totalVideos ?? 0}
          description={stats ? `${stats.publicVideos} public` : undefined}
          gradient="from-teal-500 to-teal-600"
          isLoading={statsLoading}
        />
        <AdminStatCard
          title="Total Users"
          icon={UsersIcon}
          value={stats?.totalUsers ?? 0}
          description={stats ? `+${stats.recentUsers} new this week` : undefined}
          gradient="from-cyan-500 to-teal-600"
          isLoading={statsLoading}
        />
        <AdminStatCard
          title="Creators"
          icon={TrendingUpIcon}
          value={userStats?.contentCreators ?? 0}
          description="Users with videos"
          gradient="from-emerald-600 to-teal-700"
          isLoading={userStatsLoading}
        />
      </div>

      {/* Views chart + top videos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white/70 backdrop-blur-sm border-white/50 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="flex items-center gap-2">
              <BarChart3Icon className="size-5 text-emerald-600" />
              Organic Views
            </CardTitle>
            <div className="flex rounded-full border border-emerald-200 p-0.5 bg-white/80">
              {([7, 30] as const).map((d) => (
                <Button
                  key={d}
                  size="sm"
                  variant="ghost"
                  onClick={() => setDays(d)}
                  className={`rounded-full h-7 px-3 text-xs ${
                    days === d
                      ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:text-white"
                      : "text-gray-500 hover:text-emerald-700"
                  }`}
                >
                  {d}d
                </Button>
              ))}
            </div>
          </CardHeader>
          <CardContent>
            {viewsLoading ? (
              <div className="h-64 rounded-xl bg-gray-100 animate-pulse" />
            ) : chartData.length > 0 ? (
              <>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                      <defs>
                        <linearGradient id="viewsFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
                          <stop offset="100%" stopColor="#10b981" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                      <XAxis
                        dataKey="label"
                        tick={{ fontSize: 11, fill: "#6b7280" }}
                        tickLine={false}
                        axisLine={false}
                        interval="preserveStartEnd"
                        minTickGap={24}
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: "#6b7280" }}
                        tickLine={false}
                        axisLine={false}
                        allowDecimals={false}
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: "0.75rem",
                          border: "1px solid #a7f3d0",
                          boxShadow: "0 10px 30px -10px rgba(16,185,129,0.3)",
                          fontSize: "12px",
                        }}
                        labelStyle={{ fontWeight: 600, color: "#065f46" }}
                        formatter={(value: number | string) => [`${value} views`, ""]}
                      />
                      <Area
                        type="monotone"
                        dataKey="count"
                        stroke="#059669"
                        strokeWidth={2.5}
                        fill="url(#viewsFill)"
                        activeDot={{ r: 4, fill: "#059669" }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-center text-sm text-gray-600 mt-2">
                  {chartData.reduce((sum, item) => sum + item.count, 0).toLocaleString()} organic views in the
                  last {days} days
                </p>
              </>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <BarChart3Icon className="size-12 mx-auto mb-4 text-gray-300" />
                  <p>No view data for the last {days} days</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm border-white/50 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrophyIcon className="size-5 text-amber-500" />
              Top Videos
              <span className="text-xs font-normal text-gray-400">by displayed views</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1.5">
              {topLoading ? (
                [...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-2">
                    <div className="w-16 h-11 bg-gray-200 rounded-lg animate-pulse" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3.5 bg-gray-200 rounded w-3/4 animate-pulse" />
                      <div className="h-3 bg-gray-100 rounded w-1/3 animate-pulse" />
                    </div>
                  </div>
                ))
              ) : topVideos && topVideos.length > 0 ? (
                topVideos.map((video, i) => (
                  <Link
                    key={video.id}
                    href={`/videos/${video.id}`}
                    target="_blank"
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-emerald-50/60 transition-colors"
                  >
                    <span
                      className={`w-6 text-center text-sm font-bold shrink-0 ${
                        i === 0 ? "text-amber-500" : i === 1 ? "text-gray-400" : i === 2 ? "text-amber-700" : "text-gray-300"
                      }`}
                    >
                      {i + 1}
                    </span>
                    <AdminImage
                      src={video.thumbnailUrl || "/placeholder.svg"}
                      alt={video.title}
                      width={64}
                      height={44}
                      className="rounded-lg object-cover w-16 h-11 bg-gray-100 shrink-0"
                      fallback="/placeholder.svg"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{video.title}</p>
                      <p className="text-xs text-gray-500 truncate">{video.userName || "Unknown"}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold text-emerald-700 tabular-nums flex items-center gap-1 justify-end">
                        <EyeIcon className="size-3" /> {video.totalViews.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-400 tabular-nums flex items-center gap-1 justify-end">
                        <ThumbsUpIcon className="size-3" /> {video.totalLikes.toLocaleString()}
                      </p>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="text-center text-gray-500 py-12">
                  <VideoIcon className="size-12 mx-auto mb-4 text-gray-300" />
                  <p>No videos yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Growth metrics */}
      <Card className="bg-white/70 backdrop-blur-sm border-white/50 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUpIcon className="size-5 text-emerald-600" />
            Growth
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <GrowthItem
              value={userStatsLoading ? null : userStats?.newThisWeek ?? 0}
              label="New Users This Week"
              sub="Last 7 days"
              accent="text-emerald-600"
            />
            <GrowthItem
              value={videoStatsLoading ? null : videoStats?.thisMonth ?? 0}
              label="Videos This Month"
              sub="New uploads"
              accent="text-teal-600"
            />
            <GrowthItem
              value={statsLoading ? null : stats?.totalComments ?? 0}
              label="Total Comments"
              sub="All time"
              accent="text-cyan-600"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const AnalyticsHeader = () => (
  <div className="mb-8">
    <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
      Analytics Dashboard
    </h1>
    <p className="text-gray-600 mt-2">Detailed insights and platform metrics</p>
  </div>
);

const GrowthItem = ({
  value,
  label,
  sub,
  accent,
}: {
  value: number | null;
  label: string;
  sub: string;
  accent: string;
}) => (
  <div className="text-center p-5 rounded-2xl bg-gradient-to-b from-white/60 to-emerald-50/40 border border-emerald-100/60">
    {value === null ? (
      <div className="h-9 w-16 mx-auto rounded-md bg-gray-200 animate-pulse mb-1" />
    ) : (
      <div className={`text-3xl font-bold tabular-nums ${accent}`}>{value.toLocaleString()}</div>
    )}
    <div className="text-gray-700 text-sm font-medium mt-1">{label}</div>
    <div className="text-xs text-gray-500 mt-0.5">{sub}</div>
  </div>
);
