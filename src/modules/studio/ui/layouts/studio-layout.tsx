import { SidebarProvider } from "@/components/ui/sidebar";
import { StudioNavbar } from "../components/studio-navbar";
import { StudioSidebar } from "../components/studio-sidebar";
interface StudioLayoutProps {
  children: React.ReactNode
}

export const StudioLayout = ({ children }: StudioLayoutProps) => {
  return (
    <SidebarProvider>
      
      <div className="w-full bg-gradient-to-br from-slate-50 via-white to-blue-50 min-h-screen">
        <StudioNavbar/>
        <div className="flex min-h-screen py-[4rem]">
            <StudioSidebar />
            <main className="flex-1 overflow-y-auto bg-transparent">
                {children}
            </main>
        </div>
      </div>
      
    </SidebarProvider>
  );
};


