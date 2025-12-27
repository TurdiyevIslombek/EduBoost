import { SidebarProvider } from "@/components/ui/sidebar";
import { HomeNavbar } from "../components/home-navbar";
import { HomeSidebar } from "../components/home-sidebar";

interface HomeLayoutProps {
  children: React.ReactNode;
}

export const HomeLayout = ({ children }: HomeLayoutProps) => {
  return (
    <SidebarProvider>
      <div className="w-full edu-gradient-subtle min-h-screen">
        <HomeNavbar />
        <div className="flex min-h-screen pt-16">
          <HomeSidebar />
          <main className="flex-1 overflow-y-auto bg-transparent">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
};
