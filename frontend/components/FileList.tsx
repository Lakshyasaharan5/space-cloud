import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Download, Trash2 } from "lucide-react";
import type { File } from "./MainContent";

export default function FileList(props: { files: File[], deleteFile: (id: string) => void, downloadFile: (id: string, name: string) => void }) {
    return (
        <ScrollArea className="flex-1 min-h-0">
            <div className="flex flex-col gap-2 text-lg p-4">
                {props.files.map((file) => {
                    return (
                        <div key={file.fileId} className="flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                                {/* left side */}
                                <div className="flex items-center justify-between gap-2">
                                    <div>{file.fileName}</div>
                                    <div className="text-sm text-black/40">{formatSize(file.fileSize)}</div>
                                </div>
                                {/* right side */}
                                <div className="flex items-center justify-between gap-4">
                                    <Button variant="outline" size="icon-sm" onClick={() => props.downloadFile(file.fileId, file.fileName)}>
                                        <Download />
                                    </Button>
                                    <Button variant="destructive" size="icon-sm" onClick={() => props.deleteFile(file.fileId)}>
                                        <Trash2 />
                                    </Button>
                                </div>
                            </div>
                            <Separator />
                        </div>
                    )
                })}
            </div>
        </ScrollArea>
    )
}

function formatSize(bytes: number) {
    if (bytes < 1024) {
        return (bytes) + " B";    
    }
    if (bytes < 1024 * 1024) {
        return (bytes / (1024)).toFixed(2) + " KB";    
    }
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}