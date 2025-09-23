"use client";
import {z} from "zod"
import { Suspense, useState, useRef, useEffect } from "react";
import { trpc } from "@/trpc/client";
import {useForm} from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {zodResolver} from "@hookform/resolvers/zod";
import { Textarea } from "@/components/ui/textarea";
import { ErrorBoundary } from "react-error-boundary";
import { Skeleton } from "@/components/ui/skeleton";
import { CopyCheckIcon, CopyIcon, Globe2Icon, ImagePlusIcon, Loader2Icon, LockIcon, MoreVerticalIcon, RotateCcwIcon, RotateCwIcon, SparklesIcon, TrashIcon, } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Form, 
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form";

import { 
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
 } from "@/components/ui/select";
import { videoUpdateSchema } from "@/db/schema";
import { toast } from "sonner";
import { VideoPlayer } from "@/modules/videos/ui/components/video-player";
import Link from "next/link";
import { snakeCaseToTitle } from "@/lib/utils";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ThumbnailUploadModal } from "../components/thumbnail-upload-modal";
import { ThumbnailGenerateModal } from "../components/thumbnail-generate-modal";
import { APP_URL } from "@/constants";

interface FormSectionProps {
    videoId: string;
}

export const FormSection = ({videoId}: FormSectionProps) => {
    return(
        <Suspense fallback={<FormSectionSkeleton />}>
            <ErrorBoundary fallback={<p>Something went wrong</p>}>
                <FormSectionSuspense videoId={videoId} />
            </ErrorBoundary>
        </Suspense>
    )
}

const FormSectionSkeleton = () => {
    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div className="space-y-2">
                    <Skeleton className="h-7 w-32"/>
                    <Skeleton className="h-4 w-40"/>
                </div>
                <Skeleton className="h-9 w-24"/>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="space-y-8 lg:col-span-3">
                    <div className="space-y-2">
                        <Skeleton className="h-5 w-16"/>
                        <Skeleton className="h-10 w-full"/>

                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-5 w-24"/>
                        <Skeleton className="h-[220px] w-full"/>
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-5 w-20"/>
                        <Skeleton className="h-[84px] w-[153px]"/>
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-5 w-20"/>
                        <Skeleton className="h-10 w-full"/>
                    </div>

                </div>
                <div className="flex flex-col gap-y-8 lg:col-span-2">
                    <div className="flex flex-col gap-4 bg-[#F9F9F9] rounded-xl overflow-hidden">
                        <Skeleton className="aspect-video"/>
                        <div className="px-4 py-4 space-y-6">
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-20"/>
                                <Skeleton className="h-5 w-full"/>
                            </div>
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-24"/>
                                <Skeleton className="h-5 w-32"/>
                            </div>
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-24"/>
                                <Skeleton className="h-5 w-32"/>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-5 w-20"/>
                        <Skeleton className="h-10 w-full"/>
                    </div>
                </div>

            </div>
        </div>
    );
}

const FormSectionSuspense = ({videoId}: FormSectionProps) => {
    const router = useRouter();
    const [video] = trpc.studio.getOne.useSuspenseQuery({id: videoId});
    const [categories] = trpc.categories.getMany.useSuspenseQuery();
    const utils = trpc.useUtils();

    // Polling state
    const pollingRef = useRef<NodeJS.Timeout | null>(null);
    const [isPolling, setIsPolling] = useState(false);
    const [pollingType, setPollingType] = useState<'ai' | 'status' | null>(null);

    // Store initial values to detect changes
    const initialVideoRef = useRef({
        title: video.title,
        description: video.description,
        thumbnailUrl: video.thumbnailUrl
    });

    // Function to start polling for AI updates
    const startPolling = () => {
        if (pollingRef.current && pollingType === 'ai') return; // Already polling for AI
        
        // Clear any existing status polling
        if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
        }
        
        setIsPolling(true);
        setPollingType('ai');
        pollingRef.current = setInterval(async () => {
            await utils.studio.getOne.invalidate({id: videoId});
        }, 3000); // Poll every 3 seconds for AI

        // Stop polling after 5 minutes (max AI processing time)
        setTimeout(() => {
            if (pollingRef.current && pollingType === 'ai') {
                clearInterval(pollingRef.current);
                pollingRef.current = null;
                setIsPolling(false);
                setPollingType(null);
            }
        }, 5 * 60 * 1000);
    };

    // Auto-poll for video processing status
    useEffect(() => {
        const shouldPollStatus = video.muxStatus !== "ready" || video.muxTrackStatus !== "ready";
        
        if (shouldPollStatus && !pollingRef.current && pollingType !== 'ai') {
            // Start polling for processing status (only if not already polling for AI)
            setPollingType('status');
            pollingRef.current = setInterval(async () => {
                await utils.studio.getOne.invalidate({id: videoId});
            }, 5000); // Poll every 5 seconds for processing status
        } else if (!shouldPollStatus && pollingRef.current && pollingType === 'status') {
            // Stop polling when both statuses are ready and we were polling for status
            clearInterval(pollingRef.current);
            pollingRef.current = null;
            setPollingType(null);
        }
        
        return () => {
            if (pollingRef.current && pollingType === 'status') {
                clearInterval(pollingRef.current);
                pollingRef.current = null;
                setPollingType(null);
            }
        };
    }, [video.muxStatus, video.muxTrackStatus, pollingType, videoId, utils]);

    // Stop polling when component unmounts
    useEffect(() => {
        return () => {
            if (pollingRef.current) {
                clearInterval(pollingRef.current);
                pollingRef.current = null;
                setIsPolling(false);
                setPollingType(null);
            }
        };
    }, []);

    // Detect when AI has updated the video and stop polling
    useEffect(() => {
        const hasChanged = 
            video.title !== initialVideoRef.current.title ||
            video.description !== initialVideoRef.current.description ||
            video.thumbnailUrl !== initialVideoRef.current.thumbnailUrl;

        if (hasChanged && pollingType === 'ai') {
            // AI update detected, stop AI polling
            if (pollingRef.current) {
                clearInterval(pollingRef.current);
                pollingRef.current = null;
                setIsPolling(false);
                setPollingType(null);
                toast.success("AI generation completed!");
                
                // Update initial values to new ones
                initialVideoRef.current = {
                    title: video.title,
                    description: video.description,
                    thumbnailUrl: video.thumbnailUrl
                };
            }
        } else if (pollingType !== 'ai') {
            // Update initial values when not polling for AI (manual updates or status polling)
            initialVideoRef.current = {
                title: video.title,
                description: video.description,
                thumbnailUrl: video.thumbnailUrl
            };
        }
    }, [video.title, video.description, video.thumbnailUrl, pollingType]);

    const [ThumbnailModalOpen, setThumbnailModalOpen] = useState(false);

    const [ThumbnailGenerateModalOpen, setThumbnailGenerateModalOpen] = useState(false);

    const update = trpc.videos.update.useMutation({
        onSuccess: () => {
            utils.studio.getMany.invalidate();
            utils.studio.getOne.invalidate({id: videoId});
            toast.success("Video updated successfully");
        },
        onError: () => {
            toast.error("Something went wrong. Please try again.");
        }
    });

    const remove = trpc.videos.remove.useMutation({
        onSuccess: () => {
            utils.studio.getMany.invalidate();
            toast.success("Video removed successfully");
            router.push("/studio");
        },
        onError: () => {
            toast.error("Something went wrong. Please try again.");
        }
    });

    const revalidate = trpc.videos.revalidate.useMutation({
        onSuccess: () => {
            utils.studio.getMany.invalidate();
            utils.studio.getOne.invalidate({id: videoId});
            toast.success("Video revalidated successfully");
        },
        onError: () => {
            toast.error("Something went wrong. Please try again.");
        }
    });
    const restoreThumbnail = trpc.videos.restoreThumbnail.useMutation({
        onSuccess: () => {
            utils.studio.getMany.invalidate();
            utils.studio.getOne.invalidate({id: videoId});
            toast.success("Video thumbnail restored successfully");
        },
        onError: () => {
            toast.error("Something went wrong. Please try again.");
        }
    });

    const generateTitle = trpc.videos.generateTitle.useMutation({
        onSuccess: () => {
            toast.success("Background task started", {description: "This may take a few minutes"});
            // Start polling for updates
            startPolling();
        },
        onError: () => {
            toast.error("Something went wrong. Please try again.");
        }
    });
    
    const generateDescription = trpc.videos.generateDescription.useMutation({
        onSuccess: () => {
            toast.success("Background task started", {description: "This may take a few minutes"});
            // Start polling for updates
            startPolling();
        },
        onError: () => {
            toast.error("Something went wrong. Please try again.");
        }
    });

    const form = useForm<z.infer<typeof videoUpdateSchema>>({
        resolver: zodResolver(videoUpdateSchema),
        defaultValues: video,

    })

    const onSubmit = async(data: z.infer<typeof videoUpdateSchema>) => {
        await update.mutateAsync(data);
        
    }

    const fullUrl = `${APP_URL}/videos/${videoId}`;

    const [isCopied, setIsCopied] = useState(false);

    const onCopy = async () => {
        await navigator.clipboard.writeText(fullUrl);
        setIsCopied(true);

        setTimeout(() => {
            setIsCopied(false);
        }, 2000);
    }


    return (
        <>
            <ThumbnailGenerateModal
                open={ThumbnailGenerateModalOpen}
                onOpenChange={setThumbnailGenerateModalOpen}
                videoId={videoId}
                onGenerationStart={startPolling}
            />

            <ThumbnailUploadModal 
                open={ThumbnailModalOpen}
                onOpenChange={setThumbnailModalOpen}
                videoId={videoId} 
            />
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-bold">Video details</h1>
                                <p className="text-xs text-muted-foreground">Manage your video details</p>
                            </div>
                            <div className="flex items-center gap-x-2">
                                <Button type="submit" disabled={update.isPending} >
                                    Save
                                </Button>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon"><MoreVerticalIcon /></Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => revalidate.mutate({ id: video.id })}>
                                            <RotateCcwIcon className="size-4 mr-2" />
                                            Revalidate
                                        </DropdownMenuItem>
                                        <DropdownMenuItem 
                                            onClick={() => {
                                                if (window.confirm(`Are you sure you want to delete "${video.title}"? This action cannot be undone.`)) {
                                                    remove.mutate({ id: video.id });
                                                }
                                            }}
                                            className="text-red-600 focus:text-red-600"
                                        >
                                            <TrashIcon className="size-4 mr-2" />
                                            Delete Video
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                            <div className="space-y-8 lg:col-span-3">
                                <FormField
                                    control={form.control}
                                    name="title"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                <div className="flex items-center gap-x-2">
                                                    Title
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        type="button"
                                                        className="rounded-full size-6 [&_svg]:size-3"
                                                        onClick={() => generateTitle.mutate({ id: video.id })}
                                                        disabled={generateTitle.isPending || !video.muxTrackId}
                                                    >
                                                        {generateTitle.isPending
                                                            ? <Loader2Icon className="animate-spin"/>
                                                            : <SparklesIcon />
                                                        }
                                                    </Button>
                                                    {isPolling && (
                                                        <span className="text-xs text-blue-600 animate-pulse flex items-center gap-1">
                                                            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                                                            AI processing...
                                                        </span>
                                                    )}
                                                </div>
                                            </FormLabel>
                                            <FormControl>
                                                <Input 
                                                    {...field} 
                                                    placeholder="Add a title to your video" 
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                <div className="flex items-center gap-x-2">
                                                    Description
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        type="button"
                                                        className="rounded-full size-6 [&_svg]:size-3"
                                                        onClick={() => generateDescription.mutate({ id: video.id })}
                                                        disabled={generateDescription.isPending || !video.muxTrackId}
                                                    >
                                                        {generateDescription.isPending
                                                            ? <Loader2Icon className="animate-spin"/>
                                                            : <SparklesIcon />
                                                        }
                                                    </Button>
                                                </div>
                                            </FormLabel>
                                            <FormControl>
                                                <Textarea 
                                                    {...field} 
                                                    value={field.value ?? ""}
                                                    rows={10}
                                                    className="resize-none pr-10"
                                                    placeholder="Add a description to your video" 
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    name="thumbnailUrl"
                                    control={form.control}
                                    render={() => (
                                        <FormItem>
                                            <FormLabel>Thumbnail</FormLabel>
                                            <FormControl>
                                                <div className="p-0.5 border border-dashed border-neutral-400 relative h-[84px] w-[153px] group">
                                                    <Image
                                                        src={video.thumbnailUrl || "/placeholder.svg"}
                                                        className="object-cover"
                                                        fill
                                                        alt="Video thumbnail"
                                                    />
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button
                                                                type="button"
                                                                size="icon"
                                                                className="bg-black/50 hover:bg-black/60 absolute top-1 right-1 rounded-full opacity-100 md:opacity-0 group-hover:opacity-100 duration-300 size-7"
                                                            >
                                                                <MoreVerticalIcon className="text-white"/>
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="start" side="right">
                                                            <DropdownMenuItem onClick={() => setThumbnailModalOpen(true)}>
                                                                <ImagePlusIcon className="size-4 mr-1"/>
                                                                Change thumbnail
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => setThumbnailGenerateModalOpen(true)}>
                                                                <SparklesIcon className="size-4 mr-1"/>
                                                                AI-generated thumbnail
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => restoreThumbnail.mutate({id: videoId})}>
                                                                <RotateCwIcon className="size-4 mr-1"/>
                                                                Restore
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>

                                                    </DropdownMenu>

                                                </div>
                                            </FormControl>
                                        </FormItem>
                                    )}
                                
                                />
                                <FormField
                                    control={form.control}
                                    name="categoryId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Category</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value ?? undefined}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue 
                                                            placeholder="Select a category" 
                                                        />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {categories.map((category) => (
                                                        <SelectItem key={category.id} value={category.id}>
                                                            {category.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>

                                            </Select>
                                            
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="flex flex-col gap-y-8 lg:col-span-2">
                                    <div className="flex flex-col gap-4 bg-[#F9F9F9] rounded-xl            overflow-hidden h-fit">
                                        <div className="aspect-video overflow-hidden relative">
                                            <VideoPlayer
                                                playbackId={video.muxPlaybackId}
                                                thumbnailUrl={video.thumbnailUrl}
                                            />
                                        </div>
                                        <div className="p-4 flex flex-col gap-y-6">
                                            <div className="flex justify-between items-center gap-x-2">
                                                <div className="flex flex-col gap-y-1">
                                                    <p className="text-xs text-muted-foreground">Video link</p>
                                                    <div className="flex items-center gap-x-2">
                                                        <Link prefetch  href={`/videos/${video.id}`}>
                                                            <p className="line-clamp-1 text-sm text-blue-500    hover:underline cursor-pointer">
                                                                {fullUrl}
                                                            </p>
                                                        </Link>
                                                        <Button type="button" variant="ghost" size="icon" className="shrink-0" onClick={onCopy} disabled={isCopied}>
                                                            {isCopied ? <CopyCheckIcon/> : <CopyIcon />}
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <div className="flex flex-col gap-y-1">
                                                    <p className="text-xs text-muted-foreground">Video status</p>
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-sm">{snakeCaseToTitle(video.muxStatus || "preparing")}</p>
                                                        {video.muxStatus !== "ready" && (
                                                            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <div className="flex flex-col gap-y-1">
                                                    <p className="text-xs text-muted-foreground">Subtitles status</p>
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-sm">{snakeCaseToTitle(video.muxTrackStatus || "preparing")}</p>
                                                        {video.muxTrackStatus !== "ready" && (
                                                            <div className="w-2 h-2 bg-orange-600 rounded-full animate-pulse"></div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="visibility"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Visibility</FormLabel>
                                                <Select
                                                    onValueChange={field.onChange}
                                                    defaultValue={field.value ?? undefined}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue 
                                                                placeholder="Select visibility" 
                                                            />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                            <SelectItem value="public">
                                                                <div className="flex items-center">
                                                                    <Globe2Icon className="size-4 mr-2" />
                                                                    Public
                                                                </div>
                                                            </SelectItem>
                                                            <SelectItem value="private">
                                                                <div className="flex items-center">
                                                                    <LockIcon className="size-4 mr-2" />
                                                                    Private
                                                                </div>
                                                            </SelectItem>
                                                    </SelectContent>

                                                </Select>
                                            
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                            </div>
                        </div>
                    </form>
            </Form> 
        </>
    );
}