"use client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {SearchIcon, XIcon} from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react"

export const SearchInput = () => {
    return (
        <Suspense fallback={<Skeleton className="h-10 w-full"/>}>
            <SearchInputSuspense />
        </Suspense>
    )
}


export const SearchInputSuspense = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const query = searchParams.get("query") || "";
    const categoryId = searchParams.get("categoryId") || "";
    const [value, setValue] = useState(query);

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const newQuery = value.trim();
        
        const params = new URLSearchParams();
        
        if (newQuery) {
            params.set("query", newQuery);
        }

        if (categoryId) {
            params.set("categoryId", categoryId);
        }

        setValue(newQuery);
        
        const queryString = params.toString();
        router.push(queryString ? `/search?${queryString}` : "/search");
    }


    return(
        <form className="flex w-full max-w-[600px] shadow-lg rounded-xl overflow-hidden border border-slate-200/60" onSubmit={handleSearch}>
            {/* Search input */}
            <div className="relative w-full">
                <input 
                value={value}
                onChange={(e) => setValue(e.target.value)}
                type="text"
                placeholder="Search courses..."
                className="w-full p-4 py-3 pr-12 bg-white border-0 focus:outline-none focus:ring-2 focus:ring-emerald-400 placeholder-slate-400 font-medium text-slate-700"
                
                />
                {value && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setValue("")}
                        className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full hover:bg-slate-100"
                    >
                        <XIcon className="text-slate-500"/>
                    </Button>
                )}
            </div>

            {/* Button */}

            <button
                disabled={!value.trim()}
                type="submit"
                className="px-5 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold"
            >
                <SearchIcon className="size-5"/>

            </button>


        </form>
    )
}
