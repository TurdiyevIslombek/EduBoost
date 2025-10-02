"use client";

import { Button } from "@/components/ui/button"
import { ClapperboardIcon, UserCircleIcon, UserIcon, ShieldIcon } from "lucide-react"
import { UserButton, SignInButton, SignedIn, SignedOut, useUser } from "@clerk/nextjs";

export const AuthButton = () => {
    const { user } = useUser();
    const isAdmin = user?.emailAddresses?.[0]?.emailAddress === "turdiyevislombek01@gmail.com";

    return (
        <>

        <SignedIn>
            <UserButton>
                <UserButton.MenuItems>

                    <UserButton.Link label="My profile" href="/users/current" labelIcon={<UserIcon className="size-4" />} />

                    <UserButton.Link label="Studio" href="/studio" labelIcon={<ClapperboardIcon className="size-4" />} />



                    {isAdmin && (
                        <UserButton.Link label="Admin Panel" href="/admin" labelIcon={<ShieldIcon className="size-4" />} />
                    )}
                    
                </UserButton.MenuItems>
            </UserButton>
        </SignedIn>

        <SignedOut>
            <SignInButton mode="modal">
                <Button
                variant="outline"
                className="px-4 py-2 text-sm font-medium  rounded-full text-blue-600 hover:text-blue-500 border-blue-500/20 shadow-none "
                >
                <UserCircleIcon />
                Sign in
            </Button>
            </SignInButton>

        </SignedOut>
        </>
    )
}