import { HydrateClient, trpc } from "@/trpc/server";
import { DEFAULT_LIMIT } from "@/constants";
import { TrendingView } from "@/modules/home/ui/views/trending-view";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Trending Courses",
  description: "Discover the most popular and trending courses on EduBoost. Watch free educational videos created by students for students.",
  openGraph: {
    title: "Trending Courses - EduBoost",
    description: "Discover the most popular courses on EduBoost.",
    url: "https://www.eduboostonline.com/feed/trending",
  },
};

const Page = async () => {


  void trpc.videos.getManyTrending.prefetchInfinite({ limit:DEFAULT_LIMIT });


  return (
    <HydrateClient>
      <TrendingView />
    </HydrateClient>
  );
}

export default Page;