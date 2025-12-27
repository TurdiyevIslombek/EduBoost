import { cn } from "@/lib/utils";
import { ChevronUpIcon, ChevronDownIcon } from "lucide-react";
import { useState, useMemo } from "react";

interface VideoDescriptionProps {
    compactViews: string;
    expandedViews: string;
    compactDate: string; 
    expandedDate: string;
    description?: string | null;
}

const linkify = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    
    return parts.map((part, index) => {
        if (part.match(urlRegex)) {
            return (
                <a
                    key={index}
                    href={part}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-emerald-600 hover:text-emerald-700 hover:underline"
                >
                    {part}
                </a>
            );
        }
        return part;
    });
};

export const VideoDescription = ({
    compactViews,
    expandedViews,
    compactDate,
    expandedDate,
    description,
}: VideoDescriptionProps) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const formattedDescription = useMemo(() => {
        if (!description) return "No description";
        return linkify(description);
    }, [description]);

    return (
        <div 
            onClick={() => setIsExpanded((current) => !current )}
            className="bg-secondary/50 rounded-xl p-3 cursor-pointer hover:bg-secondary/70 transition"
        >
            <div className="flex gap-2 text-sm mb-2 ">
                <span className="font-medium">
                    {isExpanded ? expandedViews : compactViews} views;
                </span>
                <span className="font-medium">
                    {isExpanded ? expandedDate : compactDate};
                </span>
            </div>
            <div className="relative">
                <p
                    className={cn(
                        "text-sm whitespace-pre-wrap",
                        !isExpanded && "line-clamp-2"

                    )}
                >
                    {formattedDescription}
                </p>
                <div className="flex items-center gap-1 mt-4 text-sm font-medium">
                    {isExpanded ? (
                        <>
                            Show less <ChevronUpIcon className="size-4"/>
                        </>
                    ):(
                        <>
                            Show more <ChevronDownIcon className="size-4"/>
                        </>
                    )}
                </div>
            </div>

        </div>
    )
}


