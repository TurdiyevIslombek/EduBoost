"use client";
import { InfiniteScroll } from "@/components/infinite-scroll";
import { DEFAULT_LIMIT } from "@/constants";
import { trpc } from "@/trpc/client";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useRouter } from "next/navigation";
import { VideoThumbnail } from "@/modules/videos/ui/components/video-thumbnail";
import { cn, snakeCaseToTitle } from "@/lib/utils";
import {
  Globe2Icon,
  LockIcon,
  AlertTriangle,
  Info,
  VideoIcon,
  EyeIcon,
  ThumbsUpIcon,
  MessageSquareIcon,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

const compact = (n: number) =>
  Intl.NumberFormat("en", { notation: "compact" }).format(n);

export const VideosSection = () => {
  return (
    <Suspense fallback={<VideosSectionSkeleton />}>
      <ErrorBoundary fallback={<p>Error</p>}>
        <VideosSectionSuspense />
      </ErrorBoundary>
    </Suspense>
  );
};

interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  gradient: string;
}

const StatCard = ({ icon: Icon, label, value, gradient }: StatCardProps) => (
  <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-sm">
    <CardContent className="p-4 flex items-center gap-3">
      <div className={cn("p-2.5 rounded-xl text-white shadow bg-gradient-to-br", gradient)}>
        <Icon className="size-5" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-xl font-bold tabular-nums">{value}</p>
      </div>
    </CardContent>
  </Card>
);

const StatusBadge = ({ status }: { status: string | null }) => {
  const isReady = status === "ready";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        isReady ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
      )}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          isReady ? "bg-emerald-500" : "bg-amber-500 animate-pulse"
        )}
      />
      {snakeCaseToTitle(status || "error")}
    </span>
  );
};

const VideosSectionSkeleton = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="bg-white/70 border-white/40 shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <Skeleton className="size-10 rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-5 w-12" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-6 w-[510px]">Video</TableHead>
              <TableHead>Visibility</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Views</TableHead>
              <TableHead className="text-right">Comments</TableHead>
              <TableHead className="text-right pr-6">Likes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell className="pl-6">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-20 w-36 rounded-lg" />
                    <div className="flex flex-col gap-2">
                      <Skeleton className="h-4 w-[100px]" />
                      <Skeleton className="h-3 w-[150px]" />
                    </div>
                  </div>
                </TableCell>
                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-4 w-12 ml-auto" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-4 w-12 ml-auto" /></TableCell>
                <TableCell className="text-right pr-6"><Skeleton className="h-4 w-12 ml-auto" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

const VideosSectionSuspense = () => {
  const [videos, query] = trpc.studio.getMany.useSuspenseInfiniteQuery(
    {
      limit: DEFAULT_LIMIT,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  const router = useRouter();
  const { data: isAdmin } = trpc.admin.isAdmin.useQuery(undefined, {
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const items = videos.pages.flatMap((page) => page.items);

  // Aggregate totals across loaded videos for the summary cards.
  const totals = items.reduce(
    (acc, v) => ({
      views: acc.views + (v.viewCount ?? 0),
      likes: acc.likes + (v.likeCount ?? 0),
      comments: acc.comments + (v.commentCount ?? 0),
    }),
    { views: 0, likes: 0, comments: 0 }
  );

  // Calculate total video count for limit warning (admin only)
  const videoCount = items.length;
  const limit = 10; // Free plan limit

  return (
    <div className="space-y-6">
      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={VideoIcon} label="Videos" value={compact(videoCount)} gradient="from-emerald-500 to-emerald-600" />
        <StatCard icon={EyeIcon} label="Total views" value={compact(totals.views)} gradient="from-teal-500 to-teal-600" />
        <StatCard icon={ThumbsUpIcon} label="Total likes" value={compact(totals.likes)} gradient="from-cyan-500 to-cyan-600" />
        <StatCard icon={MessageSquareIcon} label="Total comments" value={compact(totals.comments)} gradient="from-sky-500 to-sky-600" />
      </div>

      {/* Video Limit Warning Banner (Admin Only) */}
      {isAdmin && videoCount >= limit ? (
        <Card className="bg-red-50/90 backdrop-blur-sm border-red-200 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="size-5 text-red-600 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-red-800">Upload Limit Reached ({videoCount}/{limit})</h3>
                <p className="text-sm text-red-700 mt-1">
                  You&apos;ve reached the free plan limit. Delete some old videos to upload new ones.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : isAdmin && videoCount >= limit - 2 ? (
        <Card className="bg-amber-50/90 backdrop-blur-sm border-amber-200 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Info className="size-5 text-amber-600 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-amber-800">Approaching Upload Limit ({videoCount}/{limit})</h3>
                <p className="text-sm text-amber-700 mt-1">
                  Consider deleting old videos before uploading new ones.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Videos table */}
      <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg overflow-hidden">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-20 px-6">
            <div className="p-4 rounded-full bg-emerald-50 mb-4">
              <VideoIcon className="size-10 text-emerald-500" />
            </div>
            <h3 className="text-lg font-semibold">No videos yet</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              Upload your first video using the <span className="font-medium">Create</span> button in the top bar to get started.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-emerald-50/70 hover:bg-emerald-50/70 border-emerald-100">
                <TableHead className="pl-6 w-[510px]">Video</TableHead>
                <TableHead>Visibility</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Views</TableHead>
                <TableHead className="text-right">Comments</TableHead>
                <TableHead className="text-right pr-6">Likes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((video) => (
                <TableRow
                  onClick={() => router.push(`/studio/videos/${video.id}`)}
                  key={video.id}
                  className="cursor-pointer hover:bg-emerald-50/40"
                >
                  <TableCell className="pl-6">
                    <div className="flex items-center gap-4">
                      <div className="relative aspect-video w-36 shrink-0 rounded-lg overflow-hidden">
                        <VideoThumbnail
                          imageUrl={video.thumbnailUrl}
                          previewUrl={video.previewUrl}
                          title={video.title}
                          duration={video.duration || 0}
                        />
                      </div>
                      <div className="flex flex-col overflow-hidden gap-y-1">
                        <span className="text-sm font-medium line-clamp-1">{video.title}</span>
                        <span className="text-xs text-muted-foreground line-clamp-1">
                          {video.description || "No description"}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      {video.visibility === "private" ? (
                        <LockIcon className="size-4 mr-2 text-muted-foreground" />
                      ) : (
                        <Globe2Icon className="size-4 mr-2 text-emerald-600" />
                      )}
                      {snakeCaseToTitle(video.visibility)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={video.muxStatus} />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground truncate">
                    {format(new Date(video.createdAt), "d MMM yyyy")}
                  </TableCell>
                  <TableCell className="text-right text-sm tabular-nums">{compact(video.viewCount)}</TableCell>
                  <TableCell className="text-right text-sm tabular-nums">{compact(video.commentCount)}</TableCell>
                  <TableCell className="text-right text-sm tabular-nums pr-6">{compact(video.likeCount)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
      <InfiniteScroll
        isManual
        hasNextPage={query.hasNextPage}
        isFetchingNextPage={query.isFetchingNextPage}
        fetchNextPage={query.fetchNextPage}
      />
    </div>
  );
};
