import { HydrateClient } from "@/trpc/server";
import { AdminVideosView } from "@/modules/admin/ui/views/admin-videos-view";

export const dynamic = "force-dynamic";

const AdminVideosPage = () => {
  return (
    <HydrateClient>
      <AdminVideosView />
    </HydrateClient>
  );
};

export default AdminVideosPage;
