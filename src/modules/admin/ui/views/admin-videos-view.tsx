"use client";

import { trpc } from "@/trpc/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { 
  VideoIcon, 
  EyeIcon, 
  TrashIcon, 
  EditIcon,
  PlayIcon,
  ClockIcon
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export const AdminVideosView = () => {
  const { data: videos, isLoading, error } = trpc.admin.getAllVideos.useQuery();
  const { data: videoStats, isLoading: statsLoading } = trpc.admin.getVideoStats.useQuery();
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Video Management
          </h1>
          <p className="text-gray-600 mt-2">
            Manage all videos on the platform
          </p>
        </div>
        <Link href="/studio">
          <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
            <VideoIcon className="size-4 mr-2" />
            Add Video
          </Button>
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                <VideoIcon className="size-4" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Videos</p>
                <p className="text-xl font-bold">
                  {statsLoading ? "Loading..." : videoStats?.totalVideos || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-gradient-to-r from-green-500 to-green-600 text-white">
                <PlayIcon className="size-4" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Published</p>
                <p className="text-xl font-bold">
                  {statsLoading ? "Loading..." : videoStats?.publicVideos || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                <EyeIcon className="size-4" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Views</p>
                <p className="text-xl font-bold">
                  {statsLoading ? "Loading..." : videoStats?.totalViews || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                <ClockIcon className="size-4" />
              </div>
              <div>
                <p className="text-sm text-gray-600">This Month</p>
                <p className="text-xl font-bold">
                  {statsLoading ? "Loading..." : videoStats?.thisMonth || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Videos Table */}
      <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <VideoIcon className="size-5" />
            All Videos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 p-4 bg-gray-50/80 rounded-lg font-medium text-sm text-gray-700">
              <div className="col-span-4">Video</div>
              <div className="col-span-2">Creator</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2">Views</div>
              <div className="col-span-2">Actions</div>
            </div>

            {/* Video Rows */}
            {isLoading ? (
              <>
                <VideoRowSkeleton />
                <VideoRowSkeleton />
                <VideoRowSkeleton />
              </>
            ) : error ? (
              <div className="text-center text-red-500 py-8">
                <p>Error loading videos</p>
                <p className="text-sm text-gray-500">{error.message}</p>
              </div>
            ) : videos && videos.length > 0 ? (
              videos.map((video) => (
                <VideoRow key={video.id} video={video} />
              ))
            ) : (
              <div className="text-center text-gray-500 py-8">
                <VideoIcon className="size-12 mx-auto mb-4 text-gray-400" />
                <p>No videos found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

interface VideoRowProps {
  video: {
    id: string;
    title: string;
    description: string | null;
    thumbnailUrl: string | null;
    visibility: string;
    duration: number;
    createdAt: Date;
    user: { name: string; imageUrl: string } | null;
    category: { name: string } | null;
    viewCount: number;
  };
}

const VideoRow = ({ video }: VideoRowProps) => {
  const utils = trpc.useContext();
  const deleteVideoMutation = trpc.admin.deleteVideo.useMutation({
    onSuccess: () => {
      utils.admin.getAllVideos.invalidate();
    },
  });

  const toggleVisibilityMutation = trpc.admin.toggleVideoVisibility.useMutation({
    onSuccess: () => {
      utils.admin.getAllVideos.invalidate();
    },
  });

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleDeleteVideo = async () => {
    if (window.confirm(`Are you sure you want to delete video "${video.title}"? This action cannot be undone.`)) {
      try {
        console.log("Attempting to delete video:", video.id);
        await deleteVideoMutation.mutateAsync({ id: video.id });
        console.log("Video deleted successfully");
      } catch (error) {
        console.error("Failed to delete video:", error);
        alert("Failed to delete video. Check console for details.");
      }
    }
  };

  const handleToggleVisibility = async () => {
    const newVisibility = video.visibility === "public" ? "private" : "public";
    try {
      console.log("Toggling video visibility:", video.id, "from", video.visibility, "to", newVisibility);
      await toggleVisibilityMutation.mutateAsync({ 
        id: video.id, 
        visibility: newVisibility as "public" | "private"
      });
      console.log("Video visibility toggled successfully");
    } catch (error) {
      console.error("Failed to toggle visibility:", error);
      alert("Failed to toggle visibility. Check console for details.");
    }
  };

  return (
    <div className="grid grid-cols-12 gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50/50 transition-colors">
      <div className="col-span-4 flex items-center gap-3">
        <Image
          src={video.thumbnailUrl || "/placeholder.svg"}
          alt={video.title}
          width={64}
          height={48}
          className="rounded-lg object-cover"
          onError={(e) => {
            e.currentTarget.src = "/placeholder.svg";
          }}
        />
        <div className="space-y-1 min-w-0">
          <p className="font-medium text-sm truncate">{video.title}</p>
          <p className="text-xs text-gray-500">
            {formatDuration(video.duration)} • {video.category?.name || "No category"}
          </p>
        </div>
      </div>
      <div className="col-span-2 flex items-center">
        <p className="text-sm">{video.user?.name || "Unknown"}</p>
      </div>
      <div className="col-span-2 flex items-center">
        <Button
          size="sm"
          variant="ghost"
          onClick={handleToggleVisibility}
          disabled={toggleVisibilityMutation.isPending}
          className={`hover:scale-105 transition-all ${
            video.visibility === "public" 
              ? "bg-green-100 text-green-800 hover:bg-green-200" 
              : "bg-gray-100 text-gray-800 hover:bg-gray-200"
          }`}
        >
          {toggleVisibilityMutation.isPending ? (
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
          ) : (
            video.visibility
          )}
        </Button>
      </div>
      <div className="col-span-2 flex items-center">
        <p className="text-sm font-medium">{video.viewCount}</p>
      </div>
      <div className="col-span-2 flex items-center gap-2">
        <Link href={`/studio/videos/${video.id}`}>
          <Button size="sm" variant="ghost" className="hover:bg-blue-100" title="Edit Video">
            <EditIcon className="size-4" />
          </Button>
        </Link>
        <Button 
          size="sm" 
          variant="ghost" 
          className="hover:bg-red-100 text-red-600"
          onClick={handleDeleteVideo}
          disabled={deleteVideoMutation.isPending}
          title="Delete Video"
        >
          {deleteVideoMutation.isPending ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
          ) : (
            <TrashIcon className="size-4" />
          )}
        </Button>
      </div>
    </div>
  );
};

const VideoRowSkeleton = () => {
  return (
    <div className="grid grid-cols-12 gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50/50 transition-colors">
      <div className="col-span-4 flex items-center gap-3">
        <div className="w-16 h-12 bg-gray-200 rounded animate-pulse"></div>
        <div className="space-y-1">
          <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
          <div className="h-3 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
      </div>
      <div className="col-span-2 flex items-center">
        <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
      </div>
      <div className="col-span-2 flex items-center">
        <div className="h-6 bg-gray-200 rounded-full w-16 animate-pulse"></div>
      </div>
      <div className="col-span-2 flex items-center">
        <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
      </div>
      <div className="col-span-2 flex items-center gap-2">
        <div className="h-8 bg-gray-200 rounded w-8 animate-pulse"></div>
        <div className="h-8 bg-gray-200 rounded w-8 animate-pulse"></div>
      </div>
    </div>
  );
};
