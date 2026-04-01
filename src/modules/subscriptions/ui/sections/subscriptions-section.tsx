"use client";

import { InfiniteScroll } from "@/components/infinite-scroll";
import { DEFAULT_LIMIT } from "@/constants";
import { trpc } from "@/trpc/client";
import Link from "next/link";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { toast } from "sonner";
import { SubscriptionItem, SubscriptionItemSkeleton } from "../components/subscription-item";


export const SubscriptionsSection = () => {
  return (
    <Suspense fallback={<SubscriptionsSectionSkeleton />}>
        <ErrorBoundary fallback={<div className="flex flex-col items-center justify-center py-16 text-center"><p className="text-sm text-slate-500">Something went wrong loading subscriptions. Please refresh the page.</p></div>}>
            <SubscriptionsSectionSuspense />
        </ErrorBoundary>
    </Suspense>
  );
}

const SubscriptionsSectionSkeleton = () => {
    return (
        <div className="flex flex-col gap-4">
                {Array.from({ length: 10 })
                    .map((_, index) => (
                        <SubscriptionItemSkeleton key={index} />
                    ))
                }
        </div>

    )
}

const SubscriptionsSectionSuspense = () => {
    const utils = trpc.useUtils();

    const [subscriptions, query] =trpc.subscriptions.getMany.useSuspenseInfiniteQuery(
        {limit: DEFAULT_LIMIT},
        {
            getNextPageParam: (lastPage) => lastPage.nextCursor,
        }
    )

    const unsubscribe = trpc.subscriptions.remove.useMutation({
        onSuccess: (data) => {
            toast.success("Unsubscribed");

            utils.subscriptions.getMany.invalidate();
            utils.videos.getManySubscribed.invalidate();
            utils.users.getOne.invalidate({ id: data.creatorId })

        },
        onError: () => {
            toast.error("Something went wrong");

        }
    });



    const allSubscriptions = subscriptions.pages.flatMap((page) => page.items);

    if (allSubscriptions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="rounded-full bg-slate-100 p-6 mb-4">
                    <svg className="size-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
                    </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-700 mb-1">No subscriptions yet</h3>
                <p className="text-sm text-slate-500">Subscribe to channels to see them here.</p>
            </div>
        );
    }

    return (
        <div>
            <div className="flex flex-col gap-4">
                {allSubscriptions.map((subscription) => (
                    <Link prefetch href={`/users/${subscription.user.id}`} key={subscription.creatorId}>
                        <SubscriptionItem
                            name={subscription.user.name}
                            imageUrl={subscription.user.imageUrl}
                            subscriberCount={subscription.subscriberCount as unknown as number}
                            onUnsubscribe={() => {
                                unsubscribe.mutate({userId: subscription.creatorId})
                            }}
                            disabled={unsubscribe.isPending}
                        />
                    </Link>
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