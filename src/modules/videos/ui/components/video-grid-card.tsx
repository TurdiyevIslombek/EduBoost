import Link from "next/link";
import { VideoGetManyOutput } from "../../types";
import { VideoThumbnail, VideoThumbnailSkeleton } from "./video-thumbnail";
import { VideoInfo, VideoInfoSkeleton } from "./video-info";

interface VideoGridCardProps {
  data: VideoGetManyOutput["items"][number];
  onRemove?: () => void;
}

export const VideoGridCardSkeleton = () => {
  return (
    <div className="flex flex-col gap-3 w-full bg-white border border-gray-200 rounded-md p-3">
      <VideoThumbnailSkeleton />
      <VideoInfoSkeleton />
    </div>
  );
};

export const VideoGridCard = ({ data, onRemove }: VideoGridCardProps) => {
  return (
    <div className="flex flex-col gap-3 w-full group bg-white border border-gray-200 rounded-md p-3 hover:border-blue-600 transition-colors duration-200">
      <Link prefetch href={`/videos/${data.id}`}>
        <VideoThumbnail
          imageUrl={data.thumbnailUrl}
          previewUrl={data.previewUrl}
          title={data.title}
          duration={data.duration}
        />
      </Link>
      <VideoInfo data={data} onRemove={onRemove} />
    </div>
  );
};
