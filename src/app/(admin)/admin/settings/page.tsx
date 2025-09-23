import { HydrateClient } from "@/trpc/server";
import { AdminSettingsView } from "@/modules/admin/ui/views/admin-settings-view";

export const dynamic = "force-dynamic";

const AdminSettingsPage = () => {
  return (
    <HydrateClient>
      <AdminSettingsView />
    </HydrateClient>
  );
};

export default AdminSettingsPage;
