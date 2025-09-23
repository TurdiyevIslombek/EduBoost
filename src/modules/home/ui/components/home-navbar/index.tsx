import { SidebarTrigger } from "@/components/ui/sidebar"
import  Link  from "next/link"
import Image from "next/image"
import { SearchInput } from "../home-navbar/search-input"
import { AuthButton } from "@/modules/auth/ui/components/auth-button"


export const HomeNavbar = () =>{
    return(
        <nav className="fixed top-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-lg border-b border-white/20 shadow-lg flex items-center px-2 pr-5 z-50">
            <div className="flex items-center gap-4 w-full">
                {/* Menu and Logo */}
                <div className="flex items-center flex-shrink-0 ">
                    <SidebarTrigger/>
                    <Link prefetch  href="/" className="hidden md:block">
                        <div className="p-4 flex items-center gap-2">
                            <Image src="/logo_eduboost.png" alt="Logo" width={32} height={32} className="drop-shadow-sm" />
                            <p className="text-xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">EduBoost</p>
                        </div>
                    </Link>
                </div>

                {/* Search Bar */}
                <div className="flex-1 flex justify-center max-w-[720px] mx-auto">
                    <SearchInput/>


                </div>
                
                {/* Auth Button */}
                <div className="flex-shrink-0 items-center flex gap-4 ">
                    <AuthButton/>

                </div>

            </div>
        </nav>
    )
}