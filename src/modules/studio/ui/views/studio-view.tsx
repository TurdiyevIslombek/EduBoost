import { VideosSection } from "../sections/videos-section";
import { Card, CardContent } from "@/components/ui/card";

export const StudioView = () => {
  return (
    <div className="flex flex-col gap-y-6 pt-2.5 p-6">
      <div className="px-4">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Channel Content
        </h1>
        <p className="text-gray-600 mt-2">
          Manage your channel content and videos here.
        </p>
      </div>
      
      <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
        <CardContent className="p-0">
          <VideosSection/>
        </CardContent>
      </Card>
    </div>
  );
};