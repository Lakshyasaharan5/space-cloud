import { Separator } from "@/components/ui/separator"
import { useState, useEffect } from "react";
import Header from "./Header";
import FileList from "./FileList";
import { getFiles } from "@/lib/api";

export type File = {
  fileId: string;
  fileName: string;
  fileSize: number;
};

export default function MainContent() {
    const [files, setFiles] = useState<File[]>([]);

    useEffect(() => {
        getFiles()
            .then((data) => {
                console.log(data);  
                setFiles((prev) => [...prev, ...data]);              
            })
            .catch(console.error);
    }, []);

    function downloadFile(id: string) {
        console.log(id);
        // TODO: Call API to download file
    }
    
    function deleteFile(id: string) {
        console.log(id);
        // TODO: Call API to delete file
        setFiles((prev) => prev.filter((file) => file.fileId !== id));
    }

    return (
        <div className="relative z-10 w-60 h-100 sm:w-150 sm:h-120 xl:w-200 xl:h-180 rounded-xl flex flex-col shadow-2xl p-2 bg-white">
            <Header />
            <Separator />
            <FileList files={files} deleteFile={deleteFile} downloadFile={downloadFile} />
        </div>
    )
}