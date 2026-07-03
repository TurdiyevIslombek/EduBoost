import { HydrateClient } from "@/trpc/server";
import { AdminCommentsView } from "@/modules/admin/ui/views/admin-comments-view";

export const dynamic = "force-dynamic";

const AdminCommentsPage = () => {
  return (
    <HydrateClient>
      <AdminCommentsView />
    </HydrateClient>
  );
};

export default AdminCommentsPage;
