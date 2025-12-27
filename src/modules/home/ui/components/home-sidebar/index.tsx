import { Sidebar, SidebarContent } from "@/components/ui/sidebar";
import { MainSection } from "./main-section";
import { PersonalSection } from "./personal-section";
import { Separator } from "@/components/ui/separator";
import { SignedIn } from "@clerk/nextjs";
import { SubscriptionsSection } from "./subscriptions-section";

export const HomeSidebar = () => {
  return (
    <Sidebar
      className="pt-16 z-40 border-none"
      collapsible="icon"
    >
      <SidebarContent className="bg-gradient-to-b from-emerald-700 via-emerald-800 to-teal-900 text-white">
        <MainSection />
        <Separator className="bg-emerald-600/40" />
        <PersonalSection />
        <SignedIn>
          <>
            <Separator className="bg-emerald-600/40" />
            <SubscriptionsSection />
          </>
        </SignedIn>
      </SidebarContent>
    </Sidebar>
  );
};
