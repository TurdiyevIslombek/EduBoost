import { VideosSection } from "../sections/videos-section";

export const StudioView = () => {
  return (
    <div className="flex flex-col gap-y-6 p-6 pt-4 max-w-screen-xl mx-auto w-full">
      <div className="px-1">
        <h1 className="text-3xl font-bold edu-text-gradient">
          Channel Content
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage your videos, track performance, and keep your channel growing.
        </p>
      </div>

      <VideosSection />
    </div>
  );
};
