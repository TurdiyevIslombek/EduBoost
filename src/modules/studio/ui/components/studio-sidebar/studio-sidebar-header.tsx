import { SidebarHeader, SidebarMenuItem, SidebarMenuButton, useSidebar } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { UserAvatar } from "@/components/user-avatar";
import { useUser } from "@clerk/nextjs"
import Link from "next/link";

export const StudioSidebarHeader = () => {

    const {user} = useUser();
    const { state } = useSidebar();

    if(!user) {return (
        <SidebarHeader className="flex items-center justify-center pb-4">
            <Skeleton className="size-[112px] rounded-full bg-emerald-600/30"/>
            <div className="flex flex-col items-center mt-2 gap-y-2">
                <Skeleton className="h-4 w-[80px] bg-emerald-600/30"/>
                <Skeleton className="h-4 w-[100px] bg-emerald-600/30"/>
            </div>
        </SidebarHeader>
    )};

    if (state === "collapsed"){
        return (
            <SidebarMenuItem>
                <SidebarMenuButton 
                    tooltip="Your profile" 
                    asChild
                    className="text-emerald-100/80 hover:text-white hover:bg-white/10 transition-colors"
                >
                    <Link prefetch  href="/users/current">
                        <UserAvatar imageUrl={user.imageUrl} name={user.fullName ?? "User"} size="xs"/>
                        <span className="text-sm font-medium">Your profile</span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
        )
    }

    return (
        <SidebarHeader className="flex items-center justify-center pb-4">
            <Link prefetch  href="/users/current">
                <UserAvatar 
                    imageUrl={user.imageUrl} 
                    name={user?.fullName ?? "User"} 
                    className="size-[112px] hover:opacity-80 transition-opacity ring-4 ring-white/20"
                />
            </Link>
            <div className="flex flex-col items-center mt-2 gap-y-1">
                <p className="text-sm font-medium text-white">
                    Your profile
                </p>
                <p className="text-xs text-emerald-200/70">
                    {user.fullName}
                </p>
            </div>
        </SidebarHeader>
    )
}
