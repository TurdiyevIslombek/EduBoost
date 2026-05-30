"use client";

import { Button } from "@/components/ui/button"
import { ClapperboardIcon, UserCircleIcon, UserIcon, ShieldIcon } from "lucide-react"
import { UserButton, SignInButton, SignedIn, SignedOut, useAuth } from "@clerk/nextjs";
import { trpc } from "@/trpc/client";

export const AuthButton = () => {
    const { isSignedIn } = useAuth();
    const { data: isAdmin } = trpc.admin.isAdmin.useQuery(undefined, {
        enabled: !!isSignedIn,
        staleTime: 5 * 60 * 1000,
        retry: false,
    });

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
                className="px-4 py-2 text-sm font-medium rounded-full text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 border-emerald-500/30 shadow-none dark:text-emerald-400 dark:hover:text-emerald-300 dark:hover:bg-emerald-950/30 dark:border-emerald-400/30"
                >
                <UserCircleIcon />
                Sign in
            </Button>
            </SignInButton>

        </SignedOut>
        </>
    )
}