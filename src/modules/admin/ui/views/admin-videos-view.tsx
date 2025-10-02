"use client";

import { trpc } from "@/trpc/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  VideoIcon,
  EyeIcon,
  TrashIcon,
  EditIcon,
  PlayIcon,
  ClockIcon,
  WrenchIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

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
          <p className="text-gray-600 mt-2">Manage all videos on the platform</p>
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
                <p className="text-xl font-bold">{statsLoading ? "Loading..." : videoStats?.totalVideos || 0}</p>
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
                <p className="text-xl font-bold">{statsLoading ? "Loading..." : videoStats?.publicVideos || 0}</p>
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
                <p className="text-xl font-bold">{statsLoading ? "Loading..." : videoStats?.totalViews || 0}</p>
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
                <p className="text-xl font-bold">{statsLoading ? "Loading..." : videoStats?.thisMonth || 0}</p>
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
              videos.map((video) => <VideoRow key={video.id} video={video} />)
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
    category: { id: string; name: string } | null;
    viewCountReal: number;
    viewCountAdded: number;
    likeCountReal?: number;
    likeCountAdded?: number;
  };
}

const VideoRow = ({ video }: VideoRowProps) => {
  const utils = trpc.useContext();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: video.title,
    description: video.description || "",
    thumbnailUrl: video.thumbnailUrl || "",
    visibility: (video.visibility as "public" | "private") || "private",
    categoryId: video.category?.id || "",
    views: String(video.viewCountReal + video.viewCountAdded),
    likes: video.likeCountReal !== undefined && video.likeCountAdded !== undefined ? String(video.likeCountReal + video.likeCountAdded) : "",
  });

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

  const updateVideoMutation = trpc.admin.updateVideo.useMutation({
    onSuccess: () => {
      utils.admin.getAllVideos.invalidate();
    },
  });
  const updateMetricsMutation = trpc.admin.updateVideoMetrics.useMutation({
    onSuccess: () => {
      utils.admin.getAllVideos.invalidate();
      setOpen(false);
      toast.success("Video metrics updated");
    },
  });

  const { data: categories } = trpc.categories.getMany.useQuery();

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const handleDeleteVideo = async () => {
    if (window.confirm(`Are you sure you want to delete video "${video.title}"? This action cannot be undone.`)) {
      try {
        await deleteVideoMutation.mutateAsync({ id: video.id });
      } catch {
        alert("Failed to delete video. Check console for details.");
      }
    }
  };

  const handleToggleVisibility = async () => {
    const newVisibility = video.visibility === "public" ? "private" : "public";
    try {
      await toggleVisibilityMutation.mutateAsync({ id: video.id, visibility: newVisibility as "public" | "private" });
    } catch {
      alert("Failed to toggle visibility. Check console for details.");
    }
  };

  const handleSave = async () => {
    await updateVideoMutation.mutateAsync({
      id: video.id,
      title: form.title,
      description: form.description,
      thumbnailUrl: form.thumbnailUrl || null,
      visibility: form.visibility,
      categoryId: form.categoryId ? form.categoryId : null,
    });
    const payload: { id: string; views?: number; likes?: number } = { id: video.id };
    if (form.views.trim() !== "" && !Number.isNaN(Number(form.views))) payload.views = Number(form.views);
    if (form.likes.trim() !== "" && !Number.isNaN(Number(form.likes))) payload.likes = Number(form.likes);
    if (payload.views !== undefined || payload.likes !== undefined) {
      await updateMetricsMutation.mutateAsync(payload);
    } else {
      setOpen(false);
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
          <p className="text-xs text-gray-500">{formatDuration(video.duration)} • {video.category?.name || "No category"}</p>
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
          className={`hover:scale-105 transition-all ${video.visibility === "public" ? "bg-green-100 text-green-800 hover:bg-green-200" : "bg-gray-100 text-gray-800 hover:bg-gray-200"}`}
        >
          {toggleVisibilityMutation.isPending ? (
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current" />
          ) : (
            video.visibility
          )}
        </Button>
      </div>
      <div className="col-span-2 flex items-center">
        <p className="text-sm font-medium">
          {video.viewCountReal + video.viewCountAdded}
          <span className="text-xs text-gray-500 ml-2">({video.viewCountReal} + {video.viewCountAdded})</span>
        </p>
      </div>
      <div className="col-span-2 flex items-center gap-2">
        <Button size="sm" variant="ghost" className="hover:bg-blue-100" title="Quick Edit" onClick={() => setOpen(true)}>
          <EditIcon className="size-4" />
        </Button>
        <Link href={`/videos/${video.id}`}>
          <Button size="sm" variant="ghost" className="hover:bg-blue-100" title="Open Public Page">
            <WrenchIcon className="size-4" />
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
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600" />
          ) : (
            <TrashIcon className="size-4" />
          )}
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Video</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor={`title-${video.id}`}>Title</Label>
              <Input id={`title-${video.id}`} value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`description-${video.id}`}>Description</Label>
              <Textarea id={`description-${video.id}`} rows={4} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`thumb-${video.id}`}>Thumbnail URL</Label>
              <Input id={`thumb-${video.id}`} value={form.thumbnailUrl} onChange={(e) => setForm((f) => ({ ...f, thumbnailUrl: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Visibility</Label>
              <div className="flex gap-2">
                <Button type="button" variant={form.visibility === "public" ? "default" : "outline"} onClick={() => setForm((f) => ({ ...f, visibility: "public" }))}>Public</Button>
                <Button type="button" variant={form.visibility === "private" ? "default" : "outline"} onClick={() => setForm((f) => ({ ...f, visibility: "private" }))}>Private</Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                onValueChange={(value) => setForm((f) => ({ ...f, categoryId: value === "__none__" ? "" : value }))}
                value={form.categoryId ? form.categoryId : "__none__"}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">No category</SelectItem>
                  {(categories || []).map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`views-${video.id}`}>Views (override)</Label>
                <Input id={`views-${video.id}`} inputMode="numeric" value={form.views} onChange={(e) => setForm((f) => ({ ...f, views: e.target.value }))} placeholder="e.g. 12345" />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`likes-${video.id}`}>Likes (override)</Label>
                <Input id={`likes-${video.id}`} inputMode="numeric" value={form.likes} onChange={(e) => setForm((f) => ({ ...f, likes: e.target.value }))} placeholder="e.g. 678" />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={updateVideoMutation.isPending || updateMetricsMutation.isPending}>Cancel</Button>
            <Button onClick={handleSave} disabled={updateVideoMutation.isPending || updateMetricsMutation.isPending}>{updateVideoMutation.isPending || updateMetricsMutation.isPending ? "Saving..." : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const VideoRowSkeleton = () => {
  return (
    <div className="grid grid-cols-12 gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50/50 transition-colors">
      <div className="col-span-4 flex items-center gap-3">
        <div className="w-16 h-12 bg-gray-200 rounded animate-pulse" />
        <div className="space-y-1">
          <div className="h-4 bg-gray-200 rounded w-48 animate-pulse" />
          <div className="h-3 bg-gray-200 rounded w-32 animate-pulse" />
        </div>
      </div>
      <div className="col-span-2 flex items-center">
        <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
      </div>
      <div className="col-span-2 flex items-center">
        <div className="h-6 bg-gray-200 rounded-full w-16 animate-pulse" />
      </div>
      <div className="col-span-2 flex items-center">
        <div className="h-4 bg-gray-200 rounded w-16 animate-pulse" />
      </div>
      <div className="col-span-2 flex items-center gap-2">
        <div className="h-8 bg-gray-200 rounded w-8 animate-pulse" />
        <div className="h-8 bg-gray-200 rounded w-8 animate-pulse" />
      </div>
    </div>
  );
};
