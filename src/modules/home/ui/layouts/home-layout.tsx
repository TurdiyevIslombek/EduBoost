import { SidebarProvider } from "@/components/ui/sidebar";
import { HomeNavbar } from "../components/home-navbar";
import { HomeSidebar } from "../components/home-sidebar";
interface HomeLayoutProps {
  children: React.ReactNode
}

export const HomeLayout = ({ children }: HomeLayoutProps) => {
  return (
    <SidebarProvider>
      
      <div className="w-full bg-gradient-to-br from-slate-50 via-white to-blue-50 min-h-screen">
        <HomeNavbar/>
        <div className="flex min-h-screen py-[4rem]">
            <HomeSidebar />
            <main className="flex-1 overflow-y-auto bg-transparent">
                {children}
            </main>
        </div>
      </div>
      
    </SidebarProvider>
  );
};


