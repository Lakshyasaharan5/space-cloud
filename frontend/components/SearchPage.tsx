import { Separator } from "@/components/ui/separator"
import { useState, useEffect, Dispatch, SetStateAction } from "react";
import FileList from "./FileList";
import { deleteFileApi, getFiles, searchApi } from "@/lib/api";
import { startDownload } from "@/lib/download";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Input } from "./ui/input";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "./ui/empty";

export type File = {
    fileId: string;
    fileName: string;
    fileSize: number;
};

export default function SearchPage({ setShowSearchPage }: { setShowSearchPage: Dispatch<SetStateAction<boolean>> }) {
    const [files, setFiles] = useState<File[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [noFileFound, setNoFileFound] = useState(false);

    useEffect(() => {
        setFiles([]);
    }, []);

    async function downloadFile(id: string, name: string) {
        try {
            await startDownload(id, name);
        } catch (err) {
            console.error("Download failed:", err);
            alert("Download failed. Check console.");
        }
    }

    async function deleteFile(id: string) {
        console.log(id);
        const res = await deleteFileApi(id);
        console.log(res);
        setFiles((prev) => prev.filter((file) => file.fileId !== id));
    }

    async function handleSearch() {
        const resultFiles = await searchApi(searchQuery);        
        setFiles(resultFiles)
        setNoFileFound(resultFiles.length === 0);
        console.log(searchQuery);
    }

    return (
        <div className="relative z-10 w-60 h-100 sm:w-150 sm:h-120 xl:w-200 xl:h-180 rounded-xl flex flex-col shadow-2xl p-2 bg-amber-50">
            <div className="h-16 flex items-center justify-between rounded-t-xl px-4">
                <h1 className="text-lg text-black sm:text-2xl font-semibold tracking-tight">
                    Space<span className="text-indigo-600">Cloud</span>
                </h1>

                <div className="flex items-center gap-2">
                    <Input placeholder="Enter your query" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value) }} />
                    <Button variant="outline" size="lg" onClick={handleSearch}>
                        Search
                    </Button>
                    <Button variant="outline" size="lg" onClick={() => { setShowSearchPage(false) }}>
                        Cancel
                    </Button>
                </div>
            </div>
            <Separator />
            {noFileFound ?
                <EmptyComponent /> :
                <FileList files={files} deleteFile={deleteFile} downloadFile={downloadFile} />
            }
        </div>
    )
}

function EmptyComponent() {
    return <Empty>
        <EmptyHeader>
            <EmptyTitle>No file found</EmptyTitle>
            <EmptyDescription>Please try different query</EmptyDescription>
        </EmptyHeader>
    </Empty>
}