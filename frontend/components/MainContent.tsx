import { Separator } from "@/components/ui/separator"
import { useState, useEffect } from "react";
import Header from "./Header";
import FileList from "./FileList";
import { deleteFileApi, getFiles } from "@/lib/api";
import { startDownload } from "@/lib/download";

export type File = {
  fileId: string;
  fileName: string;
  fileSize: number;
};

export default function MainContent() {
    const [files, setFiles] = useState<File[]>([]);

    function refreshFiles() {
        getFiles()
            .then((data) => {
                console.log(data);
                setFiles(data);
            })
            .catch(console.error);
    }

    useEffect(() => {
        refreshFiles();
    }, []);

    async function downloadFile(id: string, name: string) {
    try {
        console.log("Starting download:", id);

        await startDownload(id, name);

        console.log("Download finished:", id);
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

    return (
        <div className="relative z-10 w-60 h-100 sm:w-150 sm:h-120 xl:w-200 xl:h-180 rounded-xl flex flex-col shadow-2xl p-2 bg-white">
            <Header onUploadComplete={refreshFiles} />
            <Separator />
            <FileList files={files} deleteFile={deleteFile} downloadFile={downloadFile} />
        </div>
    )
}