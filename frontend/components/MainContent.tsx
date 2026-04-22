import { Separator } from "@/components/ui/separator"
import { useState } from "react";
import Header from "./Header";
import FileList from "./FileList";

export default function MainContent() {
    const [files, setFiles] = useState<{ name: string, size: string }[]>([]);

    const newFile = { name: "resume.pdf", size: "1mb" };

    function addFile() {
        setFiles((prev) => [...prev, newFile]);
    }

    function deleteFile(index: number) {
        setFiles((prev) => prev.filter((_, i) => i !== index));
    }
    return (
        <div className="relative z-10 w-60 h-100 sm:w-150 sm:h-120 xl:w-200 xl:h-180 rounded-xl flex flex-col shadow-2xl p-2 bg-white">
            <Header addFile={addFile} />
            <Separator />
            <FileList files={files} deleteFile={deleteFile} />
        </div>
    )
}