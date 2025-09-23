import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { HydrateClient, trpc } from "@/trpc/server";
import { HomeView } from "@/modules/home/ui/views/home-view";
import { DEFAULT_LIMIT } from "@/constants";

export const dynamic = "force-dynamic";
export const revalidate = 0; // Disable caching

interface PageProps {
  searchParams: Promise<{
    categoryId?: string;
  }>;
}

const HomePage = async ({searchParams}: PageProps) => {
  const user = await currentUser();
  
  // If user is not authenticated, redirect to landing page
  if (!user) {
    redirect("/");
  }

  // If user is authenticated, show home page
  const { categoryId } = await searchParams;

  void trpc.categories.getMany.prefetch();
  void trpc.videos.getMany.prefetchInfinite({ categoryId, limit:DEFAULT_LIMIT });

  return (
    <HydrateClient>
      <HomeView categoryId={categoryId} />
    </HydrateClient>
  );
}

export default HomePage;
