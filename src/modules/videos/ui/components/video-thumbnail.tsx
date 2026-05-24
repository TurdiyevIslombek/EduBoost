import { Skeleton } from "@/components/ui/skeleton";
import { formatDuration } from "@/lib/utils";
import { PlayIcon } from "lucide-react";
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
          src={imageUrl ?? "/placeholder.svg"}
          alt={title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="size-full object-cover group-hover:opacity-0"
        />
        <Image
          src={previewUrl ?? "/placeholder.svg"}
          alt={title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          loading="lazy"
          className="size-full object-cover opacity-0 group-hover:opacity-100"
        />
      </div>
      {/* Play overlay — fades in on hover */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
      >
        <div className="bg-black/55 backdrop-blur-sm rounded-full p-3 shadow-lg">
          <PlayIcon className="size-6 text-white fill-white" />
        </div>
      </div>
      <div className="absolute bottom-2 right-2 px-2 py-1 rounded-sm bg-slate-900/90 text-white text-xs font-semibold">
        {formatDuration(duration)}
      </div>
    </div>
  );
};
