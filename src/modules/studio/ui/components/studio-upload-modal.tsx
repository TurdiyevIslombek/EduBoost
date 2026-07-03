"use client";

import { ResponsiveModal } from "@/components/responsive-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/trpc/client";
import { Loader2Icon, PlusIcon, UploadIcon, YoutubeIcon } from "lucide-react";
import { toast } from "sonner";
import { StudioUploader } from "./studio-uploader";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

export const StudioUploadModal = () => {
    const router = useRouter();
    const utils = trpc.useUtils();
    const [open, setOpen] = useState(false);
    const [youtubeUrl, setYoutubeUrl] = useState("");
    const uploadStartedRef = useRef(false);

    const deleteVideo = trpc.videos.remove.useMutation();

    const create = trpc.videos.create.useMutation({
        onSuccess: () => {
            utils.studio.getMany.invalidate();
        },
        onError: (error) => {
            // Handle Mux free plan limit error specifically
            if (error.message.includes("Free plan is limited to 10 assets")) {
                toast.error("Upload limit reached", {
                    description: "You've reached the free plan limit of 10 videos. Delete some old videos to upload new ones, or consider upgrading your plan.",
                    duration: 8000,
                });
            } else if (error.message.includes("exceeding this limit")) {
                toast.error("Storage limit exceeded", {
                    description: "Please delete some videos to free up space, then try uploading again.",
                    duration: 6000,
                });
            } else {
                toast.error(`Error creating video: ${error.message}`);
            }
        }
    });

    const createFromYoutube = trpc.videos.createFromYoutube.useMutation({
        onSuccess: ({ video }) => {
            toast.success("YouTube video added");
            utils.studio.getMany.invalidate();
            setYoutubeUrl("");
            setOpen(false);
            router.push(`/studio/videos/${video.id}`);
        },
        onError: (error) => toast.error(error.message),
    });

    const onUploadSuccess = () => {
        if (!create.data?.video.id) return;
        uploadStartedRef.current = true; // Mark that upload actually started
        const id = create.data.video.id;
        create.reset();
        setOpen(false);
        router.push(`/studio/videos/${id}`);
    };

    const handleOpenChange = (next: boolean) => {
        if (!next) {
            // If a Mux upload was started but the file never uploaded, clean up
            // the empty video record so it doesn't count against the plan limit.
            if (create.data?.video.id && !uploadStartedRef.current) {
                deleteVideo.mutate(
                    { id: create.data.video.id },
                    { onSuccess: () => utils.studio.getMany.invalidate() }
                );
            }
            create.reset();
            setYoutubeUrl("");
            uploadStartedRef.current = false;
        }
        setOpen(next);
    };

    const submitYoutube = (e: React.FormEvent) => {
        e.preventDefault();
        const url = youtubeUrl.trim();
        if (url) createFromYoutube.mutate({ url });
    };

    return (
        <>
            <ResponsiveModal title="Add Video" open={open} onOpenChange={handleOpenChange}>
                <Tabs defaultValue="upload" className="w-full px-4 pb-4 md:px-0 md:pb-0">
                    <TabsList className="grid grid-cols-2 w-full mb-4">
                        <TabsTrigger value="upload" className="gap-1.5">
                            <UploadIcon className="size-4" />
                            Upload file
                        </TabsTrigger>
                        <TabsTrigger value="youtube" className="gap-1.5">
                            <YoutubeIcon className="size-4" />
                            YouTube link
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="upload">
                        {create.data?.url ? (
                            <StudioUploader endpoint={create.data.url} onSuccess={onUploadSuccess} />
                        ) : (
                            <div className="flex flex-col items-center justify-center gap-4 py-8 text-center">
                                <div className="flex items-center justify-center size-14 rounded-2xl bg-emerald-50 text-emerald-600">
                                    <UploadIcon className="size-7" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-medium">Upload a video file</p>
                                    <p className="text-xs text-muted-foreground">
                                        MP4, MOV or WebM. We&apos;ll transcode and host it for you.
                                    </p>
                                </div>
                                <Button
                                    onClick={() => create.mutate()}
                                    disabled={create.isPending}
                                    className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                                >
                                    {create.isPending ? (
                                        <Loader2Icon className="size-4 mr-2 animate-spin" />
                                    ) : (
                                        <UploadIcon className="size-4 mr-2" />
                                    )}
                                    Choose file
                                </Button>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="youtube">
                        <form onSubmit={submitYoutube} className="space-y-4 py-2">
                            <div className="space-y-2">
                                <Label htmlFor="yt-url">YouTube video URL</Label>
                                <Input
                                    id="yt-url"
                                    autoFocus
                                    value={youtubeUrl}
                                    onChange={(e) => setYoutubeUrl(e.target.value)}
                                    placeholder="https://www.youtube.com/watch?v=…"
                                />
                                <p className="text-xs text-muted-foreground">
                                    The original YouTube video is embedded — nothing is re-uploaded. Title and
                                    thumbnail are filled in automatically; you can edit them next.
                                </p>
                            </div>
                            <Button
                                type="submit"
                                disabled={createFromYoutube.isPending || !youtubeUrl.trim()}
                                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                            >
                                {createFromYoutube.isPending ? (
                                    <Loader2Icon className="size-4 mr-2 animate-spin" />
                                ) : (
                                    <YoutubeIcon className="size-4 mr-2" />
                                )}
                                Add video
                            </Button>
                        </form>
                    </TabsContent>
                </Tabs>
            </ResponsiveModal>

            <Button variant="secondary" onClick={() => setOpen(true)}>
                <PlusIcon />
                Create
            </Button>
        </>
    );
};
