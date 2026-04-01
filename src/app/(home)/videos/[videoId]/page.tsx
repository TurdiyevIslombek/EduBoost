import { DEFAULT_LIMIT } from "@/constants";
import { VideoView } from "@/modules/videos/ui/views/video-view";
import { HydrateClient, trpc } from "@/trpc/server";
import { db } from "@/db";
import { users, videos } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface PageProps {
    params: Promise<{
        videoId: string;
    }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { videoId } = await params;

    const [video] = await db
        .select({
            title: videos.title,
            description: videos.description,
            thumbnailUrl: videos.thumbnailUrl,
            createdAt: videos.createdAt,
            userName: users.name,
        })
        .from(videos)
        .leftJoin(users, eq(videos.userId, users.id))
        .where(eq(videos.id, videoId))
        .limit(1);

    if (!video) {
        return { title: "Video Not Found" };
    }

    const title = video.title;
    const description = video.description || `Watch "${video.title}" by ${video.userName || "a creator"} on EduBoost`;

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            type: "video.other",
            url: `https://www.eduboostonline.com/videos/${videoId}`,
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
            userName: users.name,
        })
        .from(videos)
        .leftJoin(users, eq(videos.userId, users.id))
        .where(eq(videos.id, videoId))
        .limit(1);

    const jsonLd = video ? {
        "@context": "https://schema.org",
        "@type": "VideoObject",
        name: video.title,
        description: video.description || `Watch "${video.title}" on EduBoost`,
        thumbnailUrl: video.thumbnailUrl || undefined,
        uploadDate: video.createdAt.toISOString(),
        duration: video.duration ? `PT${Math.floor(video.duration / 60)}M${video.duration % 60}S` : undefined,
        contentUrl: `https://www.eduboostonline.com/videos/${videoId}`,
        embedUrl: video.muxPlaybackId ? `https://stream.mux.com/${video.muxPlaybackId}` : undefined,
        author: video.userName ? { "@type": "Person", name: video.userName } : undefined,
    } : null;

    return(
        <HydrateClient>
            {jsonLd && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
            )}
            <VideoView videoId={videoId}/>
        </HydrateClient>
    )
}

export default Page;