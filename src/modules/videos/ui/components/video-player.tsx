"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { PlayIcon } from "lucide-react";
import { youtubeEmbedUrl, youtubeThumbnail } from "@/lib/youtube";

const MuxPlayer = dynamic(() => import("@mux/mux-player-react"), {
  ssr: false,
  loading: () => <div className="aspect-video bg-black rounded-xl" />,
});

interface VideoPlayerProps {
    playbackId?: string | null | undefined;
    thumbnailUrl?: string | null | undefined;
    youtubeVideoId?: string | null | undefined;
    autoPlay?: boolean;
    onPlay?: () => void;
}

export const VideoPlayerSkeleton = () => {
    return <div className="aspect-video bg-black rounded-xl"/>
}

// Lightweight YouTube embed: shows the thumbnail with a play button and only
// loads the (heavy) YouTube iframe once the viewer clicks. This keeps the page
// fast and gives us a precise hook to record the view on first play.
const YoutubePlayer = ({
    youtubeVideoId,
    thumbnailUrl,
    onPlay,
}: {
    youtubeVideoId: string;
    thumbnailUrl?: string | null;
    onPlay?: () => void;
}) => {
    // Always start on the facade (ignore autoPlay): browsers block
    // autoplay-with-sound anyway, and the deliberate click is what we count
    // as a view.
    const [activated, setActivated] = useState(false);

    const activate = () => {
        if (!activated) {
            setActivated(true);
            onPlay?.();
        }
    };

    if (activated) {
        return (
            <iframe
                className="w-full h-full"
                src={youtubeEmbedUrl(youtubeVideoId, {
                    autoplay: 1,
                    rel: 0,
                    modestbranding: 1,
                    playsinline: 1,
                })}
                title="Video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
            />
        );
    }

    const poster = thumbnailUrl || youtubeThumbnail(youtubeVideoId, "max");

    return (
        <button
            type="button"
            onClick={activate}
            className="group relative w-full h-full block bg-black"
            aria-label="Play video"
        >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src={poster}
                alt=""
                className="w-full h-full object-cover"
                onError={(e) => {
                    // maxres doesn't exist for every video — fall back to hq.
                    e.currentTarget.src = youtubeThumbnail(youtubeVideoId, "hq");
                }}
            />
            <span className="absolute inset-0 flex items-center justify-center bg-black/25 group-hover:bg-black/10 transition-colors">
                <span className="flex items-center justify-center size-16 rounded-full bg-emerald-600/90 shadow-xl group-hover:scale-110 group-hover:bg-emerald-600 transition-all duration-200">
                    <PlayIcon className="size-8 text-white fill-white translate-x-0.5" />
                </span>
            </span>
        </button>
    );
};

export const VideoPlayer = ({
    playbackId,
    thumbnailUrl,
    youtubeVideoId,
    autoPlay,
    onPlay
} : VideoPlayerProps) => {
    if (youtubeVideoId) {
        return (
            <YoutubePlayer
                youtubeVideoId={youtubeVideoId}
                thumbnailUrl={thumbnailUrl}
                onPlay={onPlay}
            />
        );
    }

    return(
        <MuxPlayer
            playbackId={playbackId || ""}
            poster={thumbnailUrl || "/placeholder.svg"}
            playerInitTime={0}
            autoPlay={autoPlay}
            onPlay={onPlay}
            thumbnailTime={0}
            className="w-full h-full object-contain"
            accentColor="#059669"
            aria-label="Video player"
        />
    )
}
