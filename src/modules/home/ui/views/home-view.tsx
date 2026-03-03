import { CategoriesSection } from "../sections/categories-section";
import { HomeVideosSection } from "../sections/home-videos-section";
import { MaintenanceBanner } from "../components/maintenance-banner";

interface HomeViewProps {
  categoryId?: string;
}

export const HomeView = ({ categoryId }: HomeViewProps) => {
  return (
    <div className="max-w-[2400px] mx-auto mb-10 px-4 pt-2.5 flex flex-col gap-y-8">
        <MaintenanceBanner />
        <CategoriesSection categoryId={categoryId} />
        <HomeVideosSection categoryId={categoryId} />
    </div>
  );
}