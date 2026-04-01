import { DEFAULT_LIMIT } from "@/constants";
import { SearchView } from "@/modules/search/ui/views/search-view";
import { HydrateClient, trpc } from "@/trpc/server";
import type { Metadata } from "next";

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{
    query: string | undefined;
    categoryId: string | undefined;
  }>;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const { query } = await searchParams;
  const title = query ? `Search: "${query}"` : "Search Courses";
  const description = query
    ? `Search results for "${query}" on EduBoost. Find free educational video courses.`
    : "Search for free educational video courses on EduBoost.";

  return {
    title,
    description,
    openGraph: {
      title: `${title} - EduBoost`,
      description,
      url: `https://www.eduboostonline.com/search${query ? `?query=${encodeURIComponent(query)}` : ""}`,
    },
    robots: { index: false, follow: true },
  };
}

const Page = async({
    searchParams,
}: PageProps) => {
    const { query, categoryId } = await searchParams;

    void trpc.categories.getMany.prefetch();
    void trpc.search.getMany.prefetchInfinite({
      query,
      categoryId,
      limit: DEFAULT_LIMIT,
    });

    return (
        <HydrateClient>
            <SearchView query={query} categoryId={categoryId} />
        </HydrateClient>
    )

}

export default Page;