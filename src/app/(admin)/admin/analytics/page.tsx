import { HydrateClient } from "@/trpc/server";
import { AdminAnalyticsView } from "@/modules/admin/ui/views/admin-analytics-view";

export const dynamic = "force-dynamic";

const AdminAnalyticsPage = () => {
  return (
    <HydrateClient>
      <AdminAnalyticsView />
    </HydrateClient>
  );
};

export default AdminAnalyticsPage;
