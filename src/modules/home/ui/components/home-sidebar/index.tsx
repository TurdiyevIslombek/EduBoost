import { Sidebar, SidebarContent } from "@/components/ui/sidebar"
import { MainSection } from "./main-section"
import { PersonalSection } from "./personal-section"
import { Separator } from "@/components/ui/separator"
import { SignedIn } from "@clerk/nextjs"
import { SubscriptionsSection } from "./subscriptions-section"
export const HomeSidebar = () => {
    return(
        <Sidebar className="pt-16 z-40 border-none bg-white/80 backdrop-blur-md shadow-xl" collapsible="icon">
            <SidebarContent className="bg-white/90 backdrop-blur-sm border-r border-gray-100">
                <MainSection />
                <Separator />
                <PersonalSection/>
                <SignedIn>
                    <>
                        <Separator />
                        <SubscriptionsSection />
                    </>
                </SignedIn>
            </SidebarContent>


        </Sidebar>

    )
}