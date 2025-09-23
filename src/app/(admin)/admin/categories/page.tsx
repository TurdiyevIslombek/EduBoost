import { HydrateClient } from "@/trpc/server";
import { AdminCategoriesView } from "@/modules/admin/ui/views/admin-categories-view";

export const dynamic = "force-dynamic";

const AdminCategoriesPage = () => {
  return (
    <HydrateClient>
      <AdminCategoriesView />
    </HydrateClient>
  );
};

export default AdminCategoriesPage;
