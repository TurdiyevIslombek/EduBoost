import { DEFAULT_LIMIT } from "@/constants";
import { VideoView } from "@/modules/videos/ui/views/video-view";
import { HydrateClient, trpc } from "@/trpc/server";
import { db } from "@/db";
import { users, videos } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import type { Metadata } from "next";

export const revalidate = 3600;

const SITE_URL = "https://www.eduboostonline.com";

interface PageProps {
    params: Promise<{
        videoId: string;
    }>
}

function formatIsoDuration(seconds: number | null | undefined): string | undefined {
    if (!seconds || seconds <= 0) return undefined;
    const minutes = Math.floor(seconds / 60);
    const remainder = seconds % 60;
    return `PT${minutes}M${remainder}S`;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { videoId } = await params;

    const [video] = await db
        .select({
            title: videos.title,
            description: videos.description,
            thumbnailUrl: videos.thumbnailUrl,
            createdAt: videos.createdAt,
            visibility: videos.visibility,
            userName: users.name,
        })
        .from(videos)
        .leftJoin(users, eq(videos.userId, users.id))
        .where(eq(videos.id, videoId))
        .limit(1);

    if (!video) {
        return { title: "Video Not Found", robots: { index: false, follow: false } };
    }

    const isPublic = video.visibility === "public";
    const title = video.title;
    const description = video.description || `Watch "${video.title}" by ${video.userName || "a creator"} on EduBoost`;
    const canonicalUrl = `${SITE_URL}/videos/${videoId}`;

    return {
        title,
        description,
        alternates: { canonical: canonicalUrl },
        robots: isPublic
            ? { index: true, follow: true }
            : { index: false, follow: false },
        openGraph: {
            title,
            description,
            type: "video.other",
            url: canonicalUrl,
            siteName: "EduBoost",
            ...(video.thumbnailUrl && { images: [{ url: video.thumbnailUrl, width: 1280, height: 720, alt: title }] }),
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            ...(video.thumbnailUrl && { images: [video.thumbnailUrl] }),
        },
    };
}

const Page = async ({ params }: PageProps) => {
    const {videoId} = await params;

    void trpc.videos.getOne.prefetch({id: videoId});
    void trpc.comments.getMany.prefetchInfinite({videoId, limit: DEFAULT_LIMIT});
    void trpc.suggestions.getMany.prefetchInfinite({videoId, limit: DEFAULT_LIMIT})

    const [video] = await db
        .select({
            title: videos.title,
            description: videos.description,
            thumbnailUrl: videos.thumbnailUrl,
            duration: videos.duration,
            createdAt: videos.createdAt,
            muxPlaybackId: videos.muxPlaybackId,
            userId: videos.userId,
            viewCountOverride: videos.viewCountOverride,
            userName: users.name,
        })
        .from(videos)
        .leftJoin(users, eq(videos.userId, users.id))
        .where(and(eq(videos.id, videoId), eq(videos.visibility, "public")))
        .limit(1);

    const canonicalUrl = `${SITE_URL}/videos/${videoId}`;

    const videoJsonLd = video ? {
        "@context": "https://schema.org",
        "@type": "VideoObject",
        name: video.title,
        description: video.description || `Watch "${video.title}" on EduBoost`,
        thumbnailUrl: video.thumbnailUrl || undefined,
        uploadDate: video.createdAt.toISOString(),
        duration: formatIsoDuration(video.duration),
        contentUrl: canonicalUrl,
        embedUrl: video.muxPlaybackId ? `https://stream.mux.com/${video.muxPlaybackId}` : undefined,
        author: video.userName
            ? {
                "@type": "Person",
                name: video.userName,
                url: `${SITE_URL}/users/${video.userId}`,
            }
            : undefined,
        interactionStatistic: video.viewCountOverride > 0
            ? {
                "@type": "InteractionCounter",
                interactionType: { "@type": "WatchAction" },
                userInteractionCount: video.viewCountOverride,
            }
            : undefined,
    } : null;

    const breadcrumbJsonLd = video ? {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
            { "@type": "ListItem", position: 2, name: "Trending", item: `${SITE_URL}/feed/trending` },
            { "@type": "ListItem", position: 3, name: video.title, item: canonicalUrl },
        ],
    } : null;

    return(
        <HydrateClient>
            {videoJsonLd && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(videoJsonLd) }}
                />
            )}
            {breadcrumbJsonLd && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
                />
            )}
            <VideoView videoId={videoId}/>
        </HydrateClient>
    )
}

export default Page;