"use client";

import { Dispatch, SetStateAction, useRef } from "react";
import { Button } from "@/components/ui/button";
import { startUpload } from "@/lib/upload";
import { Search } from "lucide-react";


export default function Header({ onUploadComplete, setShowSearchPage }: { onUploadComplete: () => void, setShowSearchPage: Dispatch<SetStateAction<boolean>>  }) {
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        await startUpload(file);
        onUploadComplete();
    };

    return (
        <div className="h-16 flex items-center justify-between rounded-t-xl px-4">
            <h1 className="text-lg text-black sm:text-2xl font-semibold tracking-tight">
                Space<span className="text-indigo-600">Cloud</span>
            </h1>

            {/* Hidden file input */}
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
            />

            <div className="flex items-center gap-2">
                <Button variant="outline" size="lg" onClick={() => setShowSearchPage(true)}>
                    <Search />
                </Button>

                <Button variant="outline" size="lg" onClick={handleClick}>
                    Upload
                </Button>
            </div>
        </div>
    );
}