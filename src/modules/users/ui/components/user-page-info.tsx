import { UserAvatar } from "@/components/user-avatar";
import { UserGetOneOutput } from "../../types";
import { useClerk, useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SubscriptionButton } from "@/modules/subscriptions/ui/components/subscription-button";
import { UseSubscription } from "@/modules/subscriptions/hooks/use-subscription";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { PencilIcon, CheckIcon, XIcon } from "lucide-react";
import { trpc } from "@/trpc/client";
import { toast } from "sonner";


interface UserPageInfoProps {
    user: UserGetOneOutput;
}


export const UserPageInfoSkeleton = () => {
    return (
        <div className="py-6">
            {/* mobile layout */}
            <div className="flex flex-col md:hidden ">
                <div className="flex items-center gap-3">
                    <Skeleton className="h-[60px] w-[60px] rounded-full" />
                    <div className="flex-1 min-w-0">
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-4 w-48 mt-1" />
                    </div>
                </div>
                <Skeleton className="h-10 w-full mt-3 rounded-full" />
            </div>
            {/* desktop layout */}
            <div className="hidden md:flex items-start gap-4">
                <Skeleton className="h-[160px] w-[160px] rounded-full" />
                <div className="flex-1 min-w-0">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-5 w-48 mt-4" />
                    <Skeleton className="h-10 w-32 mt-3 rounded-full" />
                </div>
            </div>
        </div>
    )
}


export const UserPageInfo = ({ user }: UserPageInfoProps) => {
    const {userId, isLoaded} = useAuth();
    const clerk = useClerk();
    const {isPending, onClick} = UseSubscription({
        userId: user.id,
        isSubscribed: user.viewerSubscribed,
    })

    const [isEditing, setIsEditing] = useState(false);
    const [newName, setNewName] = useState(user.name);
    const canEdit = userId === user.clerkId;

    const updateName = trpc.users.updateName.useMutation({
        onSuccess: () => {
            toast.success("Name updated");
            setIsEditing(false);
        },
        onError: (e) => {
            toast.error(e.message || "Failed to update name");
        }
    });

    const saveName = async () => {
        if (!newName || newName.trim().length < 2) return;
        await updateName.mutateAsync({ name: newName.trim() });
    };

    return (
        <div className="py-6">
            <div className="flex flex-col md:hidden ">
                <div className="flex items-center gap-3">
                    <UserAvatar 
                        size="lg"
                        imageUrl={user.imageUrl}
                        name={user.name}
                        className="h-[60px] w-[60px]"
                        onClick={() => {
                            if (user.clerkId === userId) {
                                clerk.openUserProfile();
                            }
                        }}
                    />

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            {isEditing ? (
                                <>
                                    <Input
                                        value={newName}
                                        onChange={(e) => setNewName(e.target.value)}
                                        className="h-8"
                                    />
                                    <Button size="icon" variant="ghost" onClick={saveName} disabled={updateName.isPending || newName.trim().length < 2}>
                                        <CheckIcon className="size-4" />
                                    </Button>
                                    <Button size="icon" variant="ghost" onClick={() => { setIsEditing(false); setNewName(user.name); }} disabled={updateName.isPending}>
                                        <XIcon className="size-4" />
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <h1 className="text-xl font-bold truncate">{user.name}</h1>
                                    {canEdit && (
                                        <Button size="icon" variant="ghost" onClick={() => setIsEditing(true)} title="Edit name">
                                            <PencilIcon className="size-4" />
                                        </Button>
                                    )}
                                </>
                            )}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                            <span>{user.subscriberCount} subscribers</span>
                            <span>•</span>
                            <span>{user.videoCount} videos</span>
                        </div>
                    </div>
                </div>
                {canEdit ? (
                    <Button
                        variant="secondary"
                        asChild
                        className="w-full mt-3 rounded-full"
                    >
                        <Link prefetch  href="/studio">Go to studio</Link>
                    </Button>
                ) : (
                    <SubscriptionButton 
                        disabled = {isPending || !isLoaded}
                        isSubscribed={user.viewerSubscribed}
                        onClick={onClick}
                        className="w-full mt-3 rounded-full"
                    />
                )}
            </div>
            {/* desktop layout */}
            <div className="hidden md:flex items-start gap-4">
                <UserAvatar 
                    size="xl"
                    imageUrl={user.imageUrl}
                    name={user.name}
                    className={cn(canEdit && "cursor-pointer hover:opacity-80 transition-opacity duration-300")}
                    onClick={() => {
                        if (canEdit) {
                            clerk.openUserProfile();
                        }
                    }}
                />
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                        {isEditing ? (
                            <>
                                <Input
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    className="max-w-sm h-9"
                                />
                                <Button size="icon" variant="ghost" onClick={saveName} disabled={updateName.isPending || newName.trim().length < 2}>
                                    <CheckIcon className="size-5" />
                                </Button>
                                <Button size="icon" variant="ghost" onClick={() => { setIsEditing(false); setNewName(user.name); }} disabled={updateName.isPending}>
                                    <XIcon className="size-5" />
                                </Button>
                            </>
                        ) : (
                            <>
                                <h1 className="text-4xl font-bold truncate">{user.name}</h1>
                                {canEdit && (
                                    <Button size="icon" variant="ghost" onClick={() => setIsEditing(true)} title="Edit name">
                                        <PencilIcon className="size-5" />
                                    </Button>
                                )}
                            </>
                        )}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mt-3">
                        <span>{user.subscriberCount} subscribers</span>
                        <span>•</span>
                        <span>{user.videoCount} videos</span>
                    </div>
                    {canEdit ? (
                        <Button
                            variant="secondary"
                            asChild
                            className="mt-3 rounded-full"
                        >
                            <Link prefetch  href="/studio">Go to studio</Link>
                        </Button>
                    ) : (
                        <SubscriptionButton 
                            disabled = {isPending || !isLoaded}
                            isSubscribed={user.viewerSubscribed}
                            onClick={onClick}
                            className="mt-3"
                        />
                    )}
                </div>
               
            </div>
        </div>
    )

}