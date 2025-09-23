"use client";

import { ResponsiveModal } from "@/components/responsive-modal";
import { Button } from "@/components/ui/button"
import { trpc } from "@/trpc/client";
import { Loader2Icon, PlusIcon } from "lucide-react"
import { toast } from "sonner";
import { StudioUploader } from "./studio-uploader";
import { useRouter } from "next/navigation";
import { useRef } from "react";

export const StudioUploadModal = () => {
    const router = useRouter();
    const utils = trpc.useUtils();
    const uploadStartedRef = useRef(false);
    
    const deleteVideo = trpc.videos.remove.useMutation();
    
    const create = trpc.videos.create.useMutation({
        onSuccess: () => {
            toast.success("Video created successfully");
            utils.studio.getMany.invalidate();
            uploadStartedRef.current = false; // Reset upload started flag
        },
        onError: (error) => {
            console.error("Video creation error:", error);
            
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

    const onSuccess = () => {
        if (!create.data?.video.id) return;
        
        uploadStartedRef.current = true; // Mark that upload actually started
        create.reset();
        router.push(`/studio/videos/${create.data.video.id}`);
    }

    const handleModalClose = () => {
        // If modal is closed and no upload was started, delete the empty video record
        if (create.data?.video.id && !uploadStartedRef.current) {
            deleteVideo.mutate(
                { id: create.data.video.id },
                {
                    onSuccess: () => {
                        utils.studio.getMany.invalidate();
                    },
                    onError: (error) => {
                        console.error("Failed to cleanup empty video:", error);
                    }
                }
            );
        }
        create.reset();
    }

    return(
        <>
            <ResponsiveModal title="Upload Video" open={!!create.data?.url} onOpenChange={handleModalClose}>
                {create.data?.url ? <StudioUploader endpoint={create.data.url} onSuccess={onSuccess}/> : <Loader2Icon/>}

            </ResponsiveModal>
            <Button variant="secondary" onClick={() => create.mutate()} disabled={create.isPending}>
                {create.isPending ? <Loader2Icon className="animate-spin" /> : <PlusIcon />}
                Create
            </Button>
        </>

    )
}