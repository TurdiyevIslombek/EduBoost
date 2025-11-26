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
  RefreshCwIcon,
  CalendarClockIcon,
  PauseCircleIcon,
  PlayCircleIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { useScheduler } from "../components/scheduler-context";
import { formatDistanceToNow } from "date-fns";

export const AdminVideosView = () => {
  const { data: videos, isLoading, error } = trpc.admin.getAllVideos.useQuery();
  const { data: videoStats, isLoading: statsLoading } = trpc.admin.getVideoStats.useQuery();
  const [selectedVideos, setSelectedVideos] = useState<string[]>([]);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [bulkScheduleMode, setBulkScheduleMode] = useState(false);
  const [bulkForm, setBulkForm] = useState({
    views: "",
    likes: "",
    durationDays: "7",
  });
  const utils = trpc.useContext();
  
  // Scheduler Context
  const { isRunning, setIsRunning, interval: schedulerInterval, setInterval: setSchedulerInterval } = useScheduler();
  const [manageSchedulesOpen, setManageSchedulesOpen] = useState(false);
  const [selectedSchedules, setSelectedSchedules] = useState<string[]>([]);

  const { data: allSchedules, refetch: refetchAllSchedules } = trpc.admin.getAllScheduledMetrics.useQuery(
    undefined,
    { 
      enabled: manageSchedulesOpen,
      staleTime: 60000, // Cache for 1 minute to prevent rapid refetches
      refetchOnWindowFocus: false
    }
  );

  const deleteAllScheduleMutation = trpc.admin.deleteScheduledMetric.useMutation({
    onSuccess: () => {
      toast.success("Schedule deleted");
      refetchAllSchedules();
      utils.admin.getScheduledMetrics.invalidate(); // Also invalidate individual video schedules
    },
    onError: (error) => {
      toast.error(`Failed to delete: ${error.message}`);
    }
  });
  
  const toggleScheduleSelection = (id: string) => {
    setSelectedSchedules(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const handleBulkDeleteSchedules = async () => {
    if (selectedSchedules.length === 0) return;
    
    if (confirm(`Are you sure you want to delete ${selectedSchedules.length} schedule(s)?`)) {
      let successCount = 0;
      
      // Use Promise.all to run deletes in parallel
      await Promise.all(selectedSchedules.map(async (id) => {
        try {
          // Pass empty onSuccess to prevent spamming toasts and refetches for each item
          await deleteAllScheduleMutation.mutateAsync(
            { scheduleId: id },
            { onSuccess: () => {} } 
          );
          successCount++;
        } catch (e) {
          console.error(e);
        }
      }));
      
      if (successCount > 0) {
        toast.success(`Deleted ${successCount} schedules`);
        refetchAllSchedules(); // Single refetch
        utils.admin.getScheduledMetrics.invalidate(); // Single invalidate
        setSelectedSchedules([]);
      }
    }
  };

  const triggerSchedulerMutation = trpc.admin.triggerScheduler.useMutation({
    onSuccess: (data) => {
      // data.message now contains detailed stats
      toast.success(data.message || `Scheduler ran successfully: ${data.processed} items processed`);
      utils.admin.getAllVideos.invalidate();
    },
    onError: (error) => {
      toast.error(`Scheduler failed: ${error.message}`);
    }
  });

  const scheduleBulkMutation = trpc.admin.scheduleMetricsBulk.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      setBulkDialogOpen(false);
      setSelectedVideos([]);
      setBulkForm({ views: "", likes: "", durationDays: "7" });
      setBulkScheduleMode(false);
    },
    onError: (error) => {
      toast.error(`Failed: ${error.message}`);
    },
  });

  const updateMetricsBulkMutation = trpc.admin.updateMetricsBulk.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      setBulkDialogOpen(false);
      setSelectedVideos([]);
      setBulkForm({ views: "", likes: "", durationDays: "7" });
      utils.admin.getAllVideos.invalidate();
    },
    onError: (error) => {
      toast.error(`Failed: ${error.message}`);
    },
  });

  const handleBulkSave = async () => {
    const targetViews = Number(bulkForm.views);
    const targetLikes = Number(bulkForm.likes);
    const durationDays = Number(bulkForm.durationDays);

    if (selectedVideos.length === 0) {
      toast.error("No videos selected");
      return;
    }

    if (bulkScheduleMode) {
      // Scheduled Mode
      if ((targetViews > 0 || targetLikes > 0) && durationDays > 0) {
        await scheduleBulkMutation.mutateAsync({
          videoIds: selectedVideos,
          targetViews: targetViews || 0,
          targetLikes: targetLikes || 0,
          durationDays,
        });
      } else {
        toast.error("Please enter valid target metrics and duration");
      }
    } else {
      // Instant Mode
      // For instant update, we only send what's provided (allow 0 or empty to skip)
      // But typically "at once" means setting a value.
      // If user leaves empty, we assume they don't want to change that metric.
      const payload: { videoIds: string[]; views?: number; likes?: number } = { 
        videoIds: selectedVideos 
      };
      
      if (bulkForm.views !== "" && !isNaN(targetViews)) payload.views = targetViews;
      if (bulkForm.likes !== "" && !isNaN(targetLikes)) payload.likes = targetLikes;

      if (payload.views !== undefined || payload.likes !== undefined) {
        await updateMetricsBulkMutation.mutateAsync(payload);
      } else {
        setBulkDialogOpen(false);
      }
    }
  };

  const toggleVideoSelection = (videoId: string) => {
    setSelectedVideos(prev =>
      prev.includes(videoId) ? prev.filter(id => id !== videoId) : [...prev, videoId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedVideos.length === videos?.length) {
      setSelectedVideos([]);
    } else {
      setSelectedVideos(videos?.map(v => v.id) || []);
    }
  };

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
        <div className="flex gap-2 items-center">
          <div className="flex items-center bg-white rounded-md border shadow-sm mr-2 h-9">
            {process.env.NODE_ENV === 'development' && (
              <>
                <Button
                  onClick={() => setIsRunning(!isRunning)}
                  variant="ghost"
                  size="sm"
                  className={`h-full rounded-none rounded-l-md border-r px-3 ${isRunning ? "text-green-600 hover:text-green-700 hover:bg-green-50" : "text-red-600 hover:text-red-700 hover:bg-red-50"}`}
                  title={isRunning ? "Dev Simulator: Running (Client-side polling)" : "Dev Simulator: Stopped"}
                >
                  {isRunning ? <PauseCircleIcon className="size-4 mr-2" /> : <PlayCircleIcon className="size-4 mr-2" />}
                  {isRunning ? "DEV: ON" : "DEV: OFF"}
                </Button>
                <Select 
                  value={String(schedulerInterval)} 
                  onValueChange={(val) => setSchedulerInterval(Number(val))}
                >
                  <SelectTrigger className="w-[110px] h-full rounded-none rounded-r-md border-0 focus:ring-0 bg-transparent text-xs focus:ring-offset-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5000">Every 5s</SelectItem>
                    <SelectItem value="10000">Every 10s</SelectItem>
                    <SelectItem value="30000">Every 30s</SelectItem>
                    <SelectItem value="60000">Every 1m</SelectItem>
                    <SelectItem value="300000">Every 5m</SelectItem>
                    <SelectItem value="3600000">Every 1h</SelectItem>
                  </SelectContent>
                </Select>
              </>
            )}
          </div>

          <Button
            onClick={() => setManageSchedulesOpen(true)}
            variant="outline"
            title="View and manage all active schedules"
          >
            <CalendarClockIcon className="size-4 mr-2" />
            All Schedules
          </Button>

          <Button
            onClick={() => triggerSchedulerMutation.mutate()}
            disabled={triggerSchedulerMutation.isPending}
            variant="outline"
            title="Manually trigger the metrics scheduler now (Server-side)"
          >
            <RefreshCwIcon className={`size-4 mr-2 ${triggerSchedulerMutation.isPending ? "animate-spin" : ""}`} />
            {triggerSchedulerMutation.isPending ? "Running..." : "Run Scheduler Now"}
          </Button>
          {selectedVideos.length > 0 && (
            <Button
              onClick={() => setBulkDialogOpen(true)}
              variant="outline"
              className="border-blue-500 text-blue-600 hover:bg-blue-50"
            >
              <WrenchIcon className="size-4 mr-2" />
              Schedule for {selectedVideos.length} video(s)
            </Button>
          )}
          <Link href="/studio">
            <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
              <VideoIcon className="size-4 mr-2" />
              Add Video
            </Button>
          </Link>
        </div>
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
              <div className="col-span-1 flex items-center">
                <input
                  type="checkbox"
                  checked={selectedVideos.length === videos?.length && videos.length > 0}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 cursor-pointer"
                />
              </div>
              <div className="col-span-3">Video</div>
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
                <VideoRow 
                  key={video.id} 
                  video={video} 
                  isSelected={selectedVideos.includes(video.id)}
                  onToggleSelect={toggleVideoSelection}
                />
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

      {/* Bulk Schedule Dialog */}
      <Dialog open={bulkDialogOpen} onOpenChange={setBulkDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {bulkScheduleMode ? "Schedule Metrics" : "Update Metrics"} for {selectedVideos.length} Video(s)
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg border">
              <input
                type="checkbox"
                id="bulk-schedule-mode"
                checked={bulkScheduleMode}
                onChange={(e) => setBulkScheduleMode(e.target.checked)}
                className="w-4 h-4"
              />
              <Label htmlFor="bulk-schedule-mode" className="cursor-pointer font-medium">
                Gradual Distribution (Randomized)
              </Label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>
                  {bulkScheduleMode ? "Target Views to Add" : "Views (Instant Override)"}
                </Label>
                <Input
                  type="number"
                  value={bulkForm.views}
                  onChange={(e) => setBulkForm(f => ({ ...f, views: e.target.value }))}
                  placeholder={bulkScheduleMode ? "e.g. 700" : "Leave empty to skip"}
                />
              </div>
              <div className="space-y-2">
                <Label>
                  {bulkScheduleMode ? "Target Likes to Add" : "Likes (Instant Override)"}
                </Label>
                <Input
                  type="number"
                  value={bulkForm.likes}
                  onChange={(e) => setBulkForm(f => ({ ...f, likes: e.target.value }))}
                  placeholder={bulkScheduleMode ? "e.g. 10" : "Leave empty to skip"}
                />
              </div>
            </div>
            
            {bulkScheduleMode && (
              <div className="space-y-2">
                <Label>Distribution Duration (Days)</Label>
                <Input
                  type="number"
                  value={bulkForm.durationDays}
                  onChange={(e) => setBulkForm(f => ({ ...f, durationDays: e.target.value }))}
                  placeholder="e.g. 7"
                />
                <p className="text-xs text-gray-500">
                  📊 Metrics will be randomly distributed over {bulkForm.durationDays} days for all selected videos
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleBulkSave} 
              disabled={scheduleBulkMutation.isPending || updateMetricsBulkMutation.isPending}
            >
              {scheduleBulkMutation.isPending || updateMetricsBulkMutation.isPending 
                ? (bulkScheduleMode ? "Scheduling..." : "Updating...") 
                : (bulkScheduleMode ? "Schedule" : "Update Instant")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manage All Schedules Dialog */}
      <Dialog open={manageSchedulesOpen} onOpenChange={setManageSchedulesOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center pr-8">
              <span>Active Metric Schedules</span>
              {selectedSchedules.length > 0 && (
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={handleBulkDeleteSchedules}
                >
                  <TrashIcon className="size-4 mr-2" />
                  Delete Selected ({selectedSchedules.length})
                </Button>
              )}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {allSchedules && allSchedules.length > 0 ? (
              <div className="border rounded-lg divide-y">
                <div className="p-2 bg-gray-50 border-b flex items-center gap-3">
                   <input 
                      type="checkbox"
                      className="w-4 h-4 ml-2 cursor-pointer"
                      checked={selectedSchedules.length === allSchedules.length}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedSchedules(allSchedules.map(s => s.id));
                        else setSelectedSchedules([]);
                      }}
                   />
                   <span className="text-sm font-medium text-gray-600">Select All</span>
                </div>
                {allSchedules.map((schedule) => (
                  <div key={schedule.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                    <div className="flex items-center gap-4">
                      <input 
                          type="checkbox"
                          className="w-4 h-4 cursor-pointer"
                          checked={selectedSchedules.includes(schedule.id)}
                          onChange={() => toggleScheduleSelection(schedule.id)}
                       />
                      <Image 
                        src={schedule.video.thumbnailUrl || "/placeholder.svg"} 
                        alt={schedule.video.title} 
                        width={60} 
                        height={34} 
                        className="rounded object-cover bg-gray-200"
                        unoptimized
                        onError={(e) => { e.currentTarget.src = "/placeholder.svg" }}
                      />
                      <div>
                        <p className="font-medium text-sm line-clamp-1 max-w-[200px]">{schedule.video.title}</p>
                        <div className="text-xs text-gray-500 flex gap-2">
                          <span>Started: {formatDistanceToNow(new Date(schedule.startDate), { addSuffix: true })}</span>
                          <span>•</span>
                          <span>Ends: {new Date(schedule.endDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                       <div className="text-sm text-right">
                          <div className="font-medium text-blue-600">{schedule.appliedViews} / {schedule.targetViews} Views</div>
                          <div className="w-24 bg-gray-200 rounded-full h-1.5 mt-1 ml-auto">
                            <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${Math.min(100, (schedule.appliedViews/schedule.targetViews)*100)}%` }} />
                          </div>
                       </div>
                       <div className="text-sm text-right">
                          <div className="font-medium text-pink-600">{schedule.appliedLikes} / {schedule.targetLikes} Likes</div>
                          <div className="w-24 bg-gray-200 rounded-full h-1.5 mt-1 ml-auto">
                            <div className="bg-pink-500 h-1.5 rounded-full" style={{ width: `${Math.min(100, (schedule.appliedLikes/schedule.targetLikes)*100)}%` }} />
                          </div>
                       </div>
                       
                       <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => {
                            if(confirm("Are you sure you want to delete this schedule?")) {
                              deleteAllScheduleMutation.mutate({ scheduleId: schedule.id });
                            }
                          }}
                       >
                         <TrashIcon className="size-4" />
                       </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <CalendarClockIcon className="size-12 mx-auto mb-4 text-gray-300" />
                <p>No active schedules found</p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button onClick={() => setManageSchedulesOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
  isSelected: boolean;
  onToggleSelect: (videoId: string) => void;
}

const VideoRow = ({ video, isSelected, onToggleSelect }: VideoRowProps) => {
  const utils = trpc.useContext();
  const [open, setOpen] = useState(false);
  const [scheduleMode, setScheduleMode] = useState(false);
  const [showSchedules, setShowSchedules] = useState(false);
  const [form, setForm] = useState({
    title: video.title,
    description: video.description || "",
    thumbnailUrl: video.thumbnailUrl || "",
    visibility: (video.visibility as "public" | "private") || "private",
    categoryId: video.category?.id || "",
    views: "",
    likes: "",
    durationDays: "7",
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

  const scheduleMetricsMutation = trpc.admin.scheduleMetrics.useMutation({
    onSuccess: (data) => {
      utils.admin.getAllVideos.invalidate();
      toast.success(data.message);
      setScheduleMode(false);
      setForm(f => ({ ...f, views: "", likes: "", durationDays: "7" }));
    },
    onError: (error) => {
      toast.error(`Failed to schedule: ${error.message}`);
    },
  });

  const { data: scheduledMetrics, refetch: refetchSchedules } = trpc.admin.getScheduledMetrics.useQuery(
    { videoId: video.id },
    { enabled: showSchedules }
  );

  const deleteScheduleMutation = trpc.admin.deleteScheduledMetric.useMutation({
    onSuccess: () => {
      toast.success("Schedule deleted");
      refetchSchedules();
    },
    onError: (error) => {
      toast.error(`Failed to delete: ${error.message}`);
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
    try {
      await updateVideoMutation.mutateAsync({
        id: video.id,
        title: form.title,
        description: form.description,
        thumbnailUrl: form.thumbnailUrl || null,
        visibility: form.visibility,
        categoryId: form.categoryId ? form.categoryId : null,
      });
      
      if (scheduleMode) {
        const targetViews = Number(form.views);
        const targetLikes = Number(form.likes);
        const durationDays = Number(form.durationDays);
        
        if ((targetViews > 0 || targetLikes > 0) && durationDays > 0) {
          await scheduleMetricsMutation.mutateAsync({
            videoId: video.id,
            targetViews: targetViews || 0,
            targetLikes: targetLikes || 0,
            durationDays,
          });
        } else {
          toast.error("Please enter valid views/likes and duration");
        }
      } else {
        const payload: { id: string; views?: number; likes?: number } = { id: video.id };
        if (form.views.trim() !== "" && !Number.isNaN(Number(form.views))) payload.views = Number(form.views);
        if (form.likes.trim() !== "" && !Number.isNaN(Number(form.likes))) payload.likes = Number(form.likes);
        if (payload.views !== undefined || payload.likes !== undefined) {
          await updateMetricsMutation.mutateAsync(payload);
        } else {
          setOpen(false);
        }
      }
    } catch (error) {
      console.error("Save error:", error);
    }
  };


  return (
    <div className="grid grid-cols-12 gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50/50 transition-colors">
      <div className="col-span-1 flex items-center justify-center">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelect(video.id)}
          className="w-4 h-4 cursor-pointer"
        />
      </div>
      <div className="col-span-3 flex items-center gap-3">
        <Image
          unoptimized
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
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`schedule-mode-${video.id}`}
                    checked={scheduleMode}
                    onChange={(e) => setScheduleMode(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <Label htmlFor={`schedule-mode-${video.id}`} className="cursor-pointer">
                    Gradual Distribution (Randomized)
                  </Label>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSchedules(!showSchedules)}
                >
                  {showSchedules ? "Hide" : "View"} Schedules
                </Button>
              </div>

              {showSchedules && (
                <div className="p-3 bg-gray-50 rounded-lg space-y-2">
                  <p className="text-sm font-medium">Active Schedules:</p>
                  {scheduledMetrics && scheduledMetrics.length > 0 ? (
                    <div className="space-y-2">
                      {scheduledMetrics.map((schedule) => (
                        <div key={schedule.id} className="text-xs bg-white p-2 rounded border relative">
                          <button
                            onClick={() => {
                              if (window.confirm("Delete this schedule?")) {
                                deleteScheduleMutation.mutate({ scheduleId: schedule.id });
                              }
                            }}
                            className="absolute top-1 right-1 text-red-500 hover:text-red-700 p-1"
                            title="Delete schedule"
                          >
                            <TrashIcon className="size-3" />
                          </button>
                          <div className="flex justify-between pr-6">
                            <span className={schedule.isActive ? "text-green-600 font-medium" : "text-gray-400"}>
                              {schedule.isActive ? "🟢 Active" : "⚪ Completed"}
                            </span>
                            <span className="text-gray-600">
                              {new Date(schedule.startDate).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="mt-1 font-medium">
                            Views: {schedule.appliedViews}/{schedule.targetViews} • 
                            Likes: {schedule.appliedLikes}/{schedule.targetLikes}
                          </div>
                          <div className="text-gray-500 mt-1">
                            Ends: {new Date(schedule.endDate).toLocaleDateString()}
                          </div>
                          {schedule.isActive && (
                            <div className="mt-1">
                              <div className="w-full bg-gray-200 rounded-full h-1.5">
                                <div 
                                  className="bg-blue-500 h-1.5 rounded-full" 
                                  style={{ 
                                    width: `${((schedule.appliedViews / schedule.targetViews) * 100).toFixed(0)}%` 
                                  }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500">No scheduled metrics</p>
                  )}
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`views-${video.id}`}>
                    {scheduleMode ? "Target Views to Add" : "Views (instant override)"}
                  </Label>
                  <Input id={`views-${video.id}`} inputMode="numeric" value={form.views} onChange={(e) => setForm((f) => ({ ...f, views: e.target.value }))} placeholder={scheduleMode ? "e.g. 700" : "Leave empty to skip"} />
                  {!scheduleMode && (
                    <p className="text-xs text-gray-500">
                      Current: {video.viewCountReal + video.viewCountAdded}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`likes-${video.id}`}>
                    {scheduleMode ? "Target Likes to Add" : "Likes (instant override)"}
                  </Label>
                  <Input id={`likes-${video.id}`} inputMode="numeric" value={form.likes} onChange={(e) => setForm((f) => ({ ...f, likes: e.target.value }))} placeholder={scheduleMode ? "e.g. 10" : "Leave empty to skip"} />
                  {!scheduleMode && video.likeCountReal !== undefined && video.likeCountAdded !== undefined && (
                    <p className="text-xs text-gray-500">
                      Current: {video.likeCountReal + video.likeCountAdded}
                    </p>
                  )}
                </div>
              </div>

              {scheduleMode && (
                <div className="space-y-2">
                  <Label htmlFor={`duration-${video.id}`}>Distribution Duration (Days)</Label>
                  <Input
                    id={`duration-${video.id}`}
                    inputMode="numeric"
                    value={form.durationDays}
                    onChange={(e) => setForm((f) => ({ ...f, durationDays: e.target.value }))}
                    placeholder="e.g. 7"
                  />
                  <p className="text-xs text-gray-500">
                    📊 Views and likes will be randomly distributed over {form.durationDays} days
                  </p>
                </div>
              )}
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
