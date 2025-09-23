import Link from "next/link";
import {VideoGetManyOutput} from "../../types"
import { VideoThumbnail, VideoThumbnailSkeleton } from "./video-thumbnail";
import { VideoInfo, VideoInfoSkeleton } from "./video-info";


interface VideoGridCardProps{
    data: VideoGetManyOutput["items"][number];
    onRemove?: () => void;
}

export const VideoGridCardSkeleton = () => {
    return(
        <div className="flex flex-col gap-3 w-full bg-white/60 backdrop-blur-sm rounded-2xl p-3 shadow-lg hover:shadow-xl transition-all duration-300">
            <VideoThumbnailSkeleton />
            <VideoInfoSkeleton />
        </div>
    )
}

export const VideoGridCard = ({
    data,
    onRemove,
}: VideoGridCardProps) => {
    return(
        <div className="flex flex-col gap-3 w-full group bg-white/60 backdrop-blur-sm rounded-2xl p-3 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
            <Link prefetch  href={`/videos/${data.id}`}>
                <VideoThumbnail 
                    imageUrl={data.thumbnailUrl}
                    previewUrl={data.previewUrl}
                    title={data.title}
                    duration={data.duration}
                />
            
            </Link>
            <VideoInfo data={data} onRemove={onRemove}/>
        </div>
    )
}