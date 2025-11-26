import { useIntersectionObserver } from "@/hooks/use-intersection-observer";
import { useEffect, useMemo } from "react";
import { Button } from "./ui/button";

interface InfiniteScrollProps{
isManual?: boolean;
hasNextPage: boolean;
isFetchingNextPage: boolean;
fetchNextPage: () => void;
}

export const InfiniteScroll = ({
  isManual = false,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
}: InfiniteScrollProps) => {
    // Memoize options to prevent observer re-creation on every render
    const options = useMemo(() => ({
        threshold: 0.5,
        rootMargin: "100px",
    }), []);

    const { targetRef, isIntersecting } = useIntersectionObserver(options);

    useEffect(() => {
      if (hasNextPage && !isFetchingNextPage && isIntersecting && !isManual) {
        fetchNextPage();
      }
    }, [hasNextPage, isFetchingNextPage, fetchNextPage, isManual, isIntersecting]);

    return (
        <div className="flex flex-col items-center gap-4 p-4">
            <div ref={targetRef} className="h-1"/>
            {hasNextPage ? (
                <Button 
                variant="secondary"
                disabled={!hasNextPage || isFetchingNextPage}
                onClick={() => fetchNextPage()}
                >
                    {isFetchingNextPage ? "Loading..." : "Load More"}
                </Button>
            ) : (
                <p className="text-xs text-muted-foreground">You have reached the end</p>
            )}
        </div>
    );
};