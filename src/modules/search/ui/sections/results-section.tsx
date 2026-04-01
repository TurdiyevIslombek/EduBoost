"use client";

import { DEFAULT_LIMIT } from "@/constants";
import { trpc } from "@/trpc/client";
import { VideoRowCard, VideoRowCardSkeleton } from "@/modules/videos/ui/components/video-row-card";
import { VideoGridCard, VideoGridCardSkeleton } from "@/modules/videos/ui/components/video-grid-card";
import { InfiniteScroll } from "@/components/infinite-scroll";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

interface ResultsSectionProps {
    query: string | undefined;
    categoryId: string | undefined;
}

export const ResultsSection = (props: ResultsSectionProps) => {
    return (
        <Suspense key={`${props.query}-${props.categoryId}`} fallback={<ResultsSectionSkeleton />}>
            <ErrorBoundary fallback={<div className="flex flex-col items-center justify-center py-16 text-center"><p className="text-sm text-slate-500">Something went wrong loading results. Please try again.</p></div>}>
                <ResultsSectionSuspense {...props} />
            </ErrorBoundary>
        </Suspense>
    )
}


const ResultsSectionSkeleton = () => {
    return (
        <div>
            <div className="hidden flex-col gap-4 md:flex">
                {Array.from({ length: DEFAULT_LIMIT }).map((_, index) => (
                    <VideoRowCardSkeleton key={index} />
                ))}
            </div>
            <div className="flex flex-col gap-4 gap-y-10 pt-6 md:hidden">
                {Array.from({ length: DEFAULT_LIMIT }).map((_, index) => (
                    <VideoGridCardSkeleton key={index} />
                ))}
            </div>
        </div>
    )
}


const ResultsSectionSuspense = ({ query, categoryId }: ResultsSectionProps) => {

    const [results, resultQuery] = trpc.search.getMany.useSuspenseInfiniteQuery(
        {query, categoryId, limit: DEFAULT_LIMIT},
        {
            getNextPageParam: (lastPage) => lastPage.nextCursor,
        }
    )

    const allResults = results.pages.flatMap((page) => page.items);

    if (allResults.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="rounded-full bg-slate-100 p-6 mb-4">
                    <svg className="size-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                    </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-700 mb-1">No results found</h3>
                <p className="text-sm text-slate-500">
                    {query ? `No videos match "${query}". Try a different search term.` : "Try searching for something."}
                </p>
            </div>
        );
    }

    return (
        <>
            <div className="flex flex-col gap-y-10 gap-4 md:hidden">
                {allResults.map((video) => (
                    <VideoGridCard key={video.id} data={video}/>
                ))}
            </div>

            <div className="hidden flex-col gap-4 md:flex">
                {allResults.map((video) => (
                    <VideoRowCard key={video.id} data={video}/>
                ))}
            </div>

            <InfiniteScroll
                hasNextPage={resultQuery.hasNextPage}
                isFetchingNextPage={resultQuery.isFetchingNextPage}
                fetchNextPage={resultQuery.fetchNextPage}
            />
        </>
    )
}