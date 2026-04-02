"use client";

import dynamic from "next/dynamic";

const MuxPlayer = dynamic(() => import("@mux/mux-player-react"), {
  ssr: false,
  loading: () => <div className="aspect-video bg-black rounded-xl" />,
});

interface VideoPlayerProps {
    playbackId?: string | null | undefined;
    thumbnailUrl?: string | null | undefined;
    autoPlay?: boolean;
    onPlay?: () => void;
}

export const VideoPlayerSkeleton = () => {
    return <div className="aspect-video bg-black rounded-xl"/>
}



export const VideoPlayer = ({
    playbackId,
    thumbnailUrl,
    autoPlay,
    onPlay
} : VideoPlayerProps) => {
    // if (!playbackId) return null;


    return(
        <MuxPlayer
            playbackId={playbackId || ""}
            poster={thumbnailUrl || "/placeholder.svg"}
            playerInitTime={0}
            autoPlay={autoPlay}
            onPlay={onPlay}
            thumbnailTime={0}
            className="w-full h-full object-contain"
            accentColor="#2563eb"
            aria-label="Video player"
        />
    )
}