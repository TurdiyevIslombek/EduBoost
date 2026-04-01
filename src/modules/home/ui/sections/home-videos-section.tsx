"use client";

import { InfiniteScroll } from "@/components/infinite-scroll";
import { DEFAULT_LIMIT } from "@/constants";
import { VideoGridCard, VideoGridCardSkeleton } from "@/modules/videos/ui/components/video-grid-card";
import { trpc } from "@/trpc/client";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

interface HomeVideosSectionProps {
  categoryId?: string;
}

export const HomeVideosSection = (props : HomeVideosSectionProps) => {
  return (
    <Suspense key={props.categoryId} fallback={<HomeVideosSectionSkeleton />}>
        <ErrorBoundary fallback={<div className="flex flex-col items-center justify-center py-16 text-center"><p className="text-sm text-slate-500">Something went wrong loading videos. Please refresh the page.</p></div>}>
            <HomeVideosSectionSuspense {...props} />
        </ErrorBoundary>
    </Suspense>
  );
}

const HomeVideosSectionSkeleton = () => {
    return (
        <div className="gap-6 gap-y-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 [@media(min-width:1920px)]:grid-cols-5 [@media(min-width:2200px)]:grid-cols-6">
                {Array.from({ length: 18 })
                    .map((_, index) => (
                        <VideoGridCardSkeleton key={index} />
                    ))
                }

        </div>
    )
}

const HomeVideosSectionSuspense = ({ categoryId }: HomeVideosSectionProps) => {

    const [videos, query] =trpc.videos.getMany.useSuspenseInfiniteQuery(
        {categoryId, limit: DEFAULT_LIMIT},
        {
            getNextPageParam: (lastPage) => lastPage.nextCursor,
        }
    )

    const allVideos = videos.pages.flatMap((page) => page.items);

    if (allVideos.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="rounded-full bg-slate-100 p-6 mb-4">
                    <svg className="size-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
                    </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-700 mb-1">No videos found</h3>
                <p className="text-sm text-slate-500">
                    {categoryId ? "No videos in this category yet." : "No videos have been uploaded yet."}
                </p>
            </div>
        );
    }

    return (
        <div>
            <div className="gap-6 gap-y-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 [@media(min-width:1920px)]:grid-cols-5 [@media(min-width:2200px)]:grid-cols-6">
                {allVideos.map((video) => (
                    <VideoGridCard key={video.id} data={video} />
                ))}
            </div>
            <InfiniteScroll
                hasNextPage={query.hasNextPage}
                isFetchingNextPage={query.isFetchingNextPage}
                fetchNextPage={query.fetchNextPage}
            />
        </div>
    )
}