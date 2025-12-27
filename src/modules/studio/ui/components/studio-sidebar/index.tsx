"use client";

import { Sidebar, SidebarContent, SidebarGroup, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import Link from "next/link"
import { LogOutIcon, VideoIcon } from "lucide-react"
import { usePathname } from "next/navigation"
import { Separator } from "@/components/ui/separator";
import { StudioSidebarHeader } from "./studio-sidebar-header";


export const StudioSidebar = () => {

    const pathname = usePathname();

    return(
        <Sidebar className="pt-16 z-40 border-none" collapsible="icon">
            <SidebarContent className="bg-gradient-to-b from-emerald-700 via-emerald-800 to-teal-900 text-white">
                <SidebarGroup>
                    <SidebarMenu>
                        <StudioSidebarHeader />
                        <SidebarMenuItem>
                            <SidebarMenuButton 
                                isActive={pathname === "/studio"} 
                                tooltip="Content" 
                                asChild
                                className="text-emerald-100/80 hover:text-white hover:bg-white/10 data-[active=true]:bg-white/20 data-[active=true]:text-white transition-colors"
                            >
                            <Link prefetch  href="/studio">
                            <VideoIcon className="size-5"/>
                            <span className="text-sm font-medium">Content</span>
                            </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <Separator className="bg-emerald-600/40" />
                        <SidebarMenuItem>
                            <SidebarMenuButton 
                                tooltip="Exit Studio" 
                                asChild
                                className="text-emerald-100/80 hover:text-white hover:bg-white/10 transition-colors"
                            >
                            <Link prefetch  href="/">
                            <LogOutIcon className="size-5"/>
                            <span className="text-sm font-medium">Exit Studio</span>
                            </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>


        </Sidebar>

    )
}
