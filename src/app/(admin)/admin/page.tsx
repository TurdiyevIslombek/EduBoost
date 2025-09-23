import { HydrateClient } from "@/trpc/server";
import { AdminDashboard } from "@/modules/admin/ui/views/admin-dashboard";

export const dynamic = "force-dynamic";

const AdminPage = () => {
  return (
    <HydrateClient>
      <AdminDashboard />
    </HydrateClient>
  );
};

export default AdminPage;
