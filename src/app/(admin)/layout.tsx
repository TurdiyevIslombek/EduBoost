import { AdminLayout } from "@/modules/admin/ui/layouts/admin-layout";

interface LayoutProps {
  children: React.ReactNode;
}

const layout = ({ children }: LayoutProps) => {
  return (
    <AdminLayout>
      {children}
    </AdminLayout>
  );
};

export default layout;
