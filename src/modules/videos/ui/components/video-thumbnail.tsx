import { Skeleton } from "@/components/ui/skeleton";
import { formatDuration } from "@/lib/utils";
import Image from "next/image";

interface VideoThumbnailProps {
  imageUrl?: string | null;
  title: string;
  previewUrl?: string | null;
  duration: number;
}

export const VideoThumbnailSkeleton = () => {
  return (
    <div className="relative w-full overflow-hidden rounded-md aspect-video">
      <Skeleton className="size-full" />
    </div>
  );
};

export const VideoThumbnail = ({
  imageUrl,
  title,
  previewUrl,
  duration,
}: VideoThumbnailProps) => {
  return (
    <div className="relative group">
      <div className="relative w-full overflow-hidden rounded-md aspect-video">
        <Image
          unoptimized={true}
          src={imageUrl ?? "/placeholder.svg"}
          alt={title}
          fill
          className="size-full object-cover group-hover:opacity-0"
        />
        <Image
          unoptimized={true}
          src={previewUrl ?? "/placeholder.svg"}
          alt={title}
          fill
          className="size-full object-cover opacity-0 group-hover:opacity-100"
        />
      </div>
      <div className="absolute bottom-2 right-2 px-2 py-1 rounded-sm bg-slate-900 text-white text-xs font-semibold">
        {formatDuration(duration)}
      </div>
    </div>
  );
};
