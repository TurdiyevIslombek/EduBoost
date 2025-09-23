"use client";

import { Badge } from "@/components/ui/badge";
import { Carousel, CarouselApi, CarouselItem, CarouselContent, CarouselNext, CarouselPrevious } from "./ui/carousel"; 
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Skeleton } from "./ui/skeleton";


interface FilterCarouselProps {
    value?: string | null;
    isLoading?: boolean;
    onSelect: (value: string | null) => void;
    data: {
        value: string;
        label: string;
    }[]
}


export const FilterCarousel = ({ value, isLoading, onSelect, data }: FilterCarouselProps) => {

    const [api, setApi] = useState<CarouselApi>()
    const [current, setCurrent] = useState(0)
    const [count, setCount] = useState(0)

    useEffect(() => {
        if (!api){
            return;
        }
        setCount(api.scrollSnapList.length)
        setCurrent(api.selectedScrollSnap()+1)

        api.on("select", () => {
            setCurrent(api.selectedScrollSnap()+1)
        })
    }, [api]);


    return (
        <div className="relative w-full bg-white/60 backdrop-blur-md rounded-xl p-3 shadow-sm border-0">
            <div
            className={cn(
                "absolute left-10 top-0 bottom-0 w-10 z-10 bg-gradient-to-r from-white/60 to-transparent pointer-events-none",
                current === 1 && "hidden"
                )}
            />
            <Carousel
              setApi={setApi}
              opts={{
                align: "start",
                dragFree: true,
            }} className="w-full px-10">
                <CarouselContent className="-ml-3">
                    {!isLoading && (
                    <CarouselItem className="pl-3 basis-auto" onClick={() => onSelect(null)}>
                        <Badge
                        variant={!value ? "default" : "secondary"}
                        className="cursor-pointer rounded-full px-4 py-1.5 whitespace-nowrap text-sm font-medium hover:scale-[1.02] transition-all duration-200 shadow-sm border-0"
                        >
                        All
                        </Badge>
                    </CarouselItem>
                    )}
                    {isLoading &&
                    Array.from({ length: 11 }).map((_, index) => (
                        <CarouselItem key={index} className="pl-3 basis-auto">
                            <Skeleton className="rounded-full h-8 w-20 bg-gray-200/80">
                                &nbsp;
                            </Skeleton>
                        </CarouselItem>
                        ))
                    }

                    {!isLoading && data.map((item) => (
                        <CarouselItem key={item.value} className="pl-3 basis-auto" onClick={() => onSelect(item.value)}>
                            <Badge 
                                variant={value === item.value ? "default" : "secondary"}
                                className="cursor-pointer rounded-full px-4 py-1.5 whitespace-nowrap text-sm font-medium hover:scale-[1.02] transition-all duration-200 shadow-sm border-0"
                            >
                                {item.label}
                            </Badge>
                        </CarouselItem>

                    ))}
                </CarouselContent>
                <CarouselNext className="right-0 z-20"/>
                <CarouselPrevious className="left-0 z-20"/>

            </Carousel>
            <div
            className={cn(
                "absolute right-10 top-0 bottom-0 w-10 z-10 bg-gradient-to-l from-white/60 to-transparent pointer-events-none",
                current === count && "hidden"
                )}
            />
        </div>
    );
}