import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Download, Trash2 } from "lucide-react";

export default function FileList(props: { files: { name: string, size: string }[], deleteFile: (index: number) => void }) {
    return (
        <ScrollArea className="flex-1 min-h-0">
            <div className="flex flex-col gap-2 text-lg p-4">
                {props.files.map((file, index) => {
                    return (
                        <div key={index} className="flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                                {/* left side */}
                                <div className="flex items-center justify-between gap-2">
                                    <div>{file.name}</div>
                                    <div className="text-sm text-black/40">{file.size}</div>
                                </div>
                                {/* right side */}
                                <div className="flex items-center justify-between gap-4">
                                    <Button variant="outline" size="icon-sm">
                                        <Download />
                                    </Button>
                                    <Button variant="destructive" size="icon-sm" onClick={() => props.deleteFile(index)}>
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