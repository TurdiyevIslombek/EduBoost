import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { isClerkUserAdmin } from "@/lib/admin";
import { AdminLayout } from "@/modules/admin/ui/layouts/admin-layout";

interface LayoutProps {
  children: React.ReactNode;
}

// Server-side admin gate: non-admins are redirected before any admin UI is
// rendered or shipped to the browser. Every admin tRPC procedure is still
// independently guarded by `requireAdmin` — this is defense in depth.
const Layout = async ({ children }: LayoutProps) => {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const isAdmin = await isClerkUserAdmin(userId).catch(() => false);

  if (!isAdmin) {
    redirect("/");
  }

  return <AdminLayout>{children}</AdminLayout>;
};

export default Layout;
