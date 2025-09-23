import { HydrateClient } from "@/trpc/server";
import { AdminUsersView } from "@/modules/admin/ui/views/admin-users-view";

export const dynamic = "force-dynamic";

const AdminUsersPage = () => {
  return (
    <HydrateClient>
      <AdminUsersView />
    </HydrateClient>
  );
};

export default AdminUsersPage;
