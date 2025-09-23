"use client";
import { InfiniteScroll } from "@/components/infinite-scroll";
import { DEFAULT_LIMIT } from "@/constants";
import { trpc } from "@/trpc/client";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import {format} from "date-fns"
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
import { snakeCaseToTitle } from "@/lib/utils";
import { Globe2Icon, LockIcon, AlertTriangle, Info } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { useUser } from "@clerk/nextjs";



export const VideosSection = () => {
  return (
    <Suspense fallback={<VideosSectionSkeleton/>}>
      <ErrorBoundary fallback={<p>Error</p>}>
        <VideosSectionSuspense />
      </ErrorBoundary>
    </Suspense>
  )
};

const VideosSectionSkeleton = () =>{
  return(
    <>
      <div className="border-y">
        <Table>
          <TableHeader>
            <TableRow>
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
          {Array.from({length: 5}).map((_, index) => (
            <TableRow key={index}>
              <TableCell className="pl-6">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-20 w-36"/>
                  <div className="flex flex-col gap-2">
                    <Skeleton className="h-4 w-[100px]"/>
                    <Skeleton className="h-3 w-[150px]"/>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-20"/>
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-16"/>
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-24"/>
              </TableCell>
              <TableCell className="text-right">
                <Skeleton className="h-4 w-12 ml-auto"/>
              </TableCell>
              <TableCell className="text-right">
                <Skeleton className="h-4 w-12 ml-auto"/>
              </TableCell>
              <TableCell className="text-right pr-6">
                <Skeleton className="h-4 w-12 ml-auto"/>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        </Table>
      </div>
    </>
  )
}


const VideosSectionSuspense = () => {
  const [ videos, query ] = trpc.studio.getMany.useSuspenseInfiniteQuery({
    limit: DEFAULT_LIMIT,
  }, {
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  const router = useRouter();
  const { user } = useUser();

  // Calculate total video count for limit warning (admin only)
  const videoCount = videos.pages.reduce((acc, page) => acc + page.items.length, 0);
  const limit = 10; // Free plan limit
  const isAdmin = user?.emailAddresses?.[0]?.emailAddress === "turdiyevislombek01@gmail.com";

  return (
  <div>
    {/* Video Limit Warning Banner (Admin Only) */}
    {isAdmin && videoCount >= limit ? (
      <Card className="bg-red-50/90 backdrop-blur-sm border-red-200 shadow-lg m-4">
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
      <Card className="bg-amber-50/90 backdrop-blur-sm border-amber-200 shadow-lg m-4">
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
    
    <div className="border-y">
      <Table>
        <TableHeader>
          <TableRow>
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
          {videos.pages.flatMap((page) => page.items).map((video) => (
              <TableRow onClick={() => router.push(`/studio/videos/${video.id}`)} key={video.id} className="cursor-pointer">
                <TableCell className="pl-6">
                  <div className="flex items-center gap-4">
                    <div className="relative aspect-video w-36 shrink-0">
                      <VideoThumbnail 
                        imageUrl={video.thumbnailUrl} 
                        previewUrl={video.previewUrl} 
                        title={video.title}
                        duration={video.duration || 0}
                      />
                    </div>
                    <div className="flex flex-col overflow-hidden gap-y-1"> 
                      <span className="text-sm line-clamp-1">{video.title}</span>
                      <span className="text-xs text-muted-foreground line-clamp-1">{video.description || "No decription"}</span>

                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center ">
                    {video.visibility === "private" ? (
                      <LockIcon className="size-4 mr-2"/>
                    ) : (
                      <Globe2Icon className="size-4 mr-2"/>
                    )}
                    {snakeCaseToTitle(video.visibility)}

                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    {snakeCaseToTitle(video.muxStatus || "error")}

                  </div>
                </TableCell>
                <TableCell className="text-sm truncate">
                  {format(new Date(video.createdAt), "d MMM yyyy")}
                </TableCell>
                <TableCell className="text-right text-sm">{video.viewCount}</TableCell>
                <TableCell className="text-right text-sm">{video.commentCount}</TableCell>
                <TableCell className="text-right text-sm pr-6">{video.likeCount}</TableCell>
              </TableRow>
          ))}
        </TableBody> 

      </Table>
    </div>
    <InfiniteScroll
      isManual
      hasNextPage={query.hasNextPage}
      isFetchingNextPage={query.isFetchingNextPage}
      fetchNextPage={query.fetchNextPage}
    />
  </div>);
};