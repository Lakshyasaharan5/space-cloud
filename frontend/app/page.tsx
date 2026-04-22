"use client";

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Download, Trash2 } from "lucide-react";
import Stars from "@/components/Stars";
import { useState } from "react";


export default function Home() {
  const [files, setFiles] = useState<{ name: string, size: string }[]>([]);

  const newFile = { name: "resume.pdf", size: "1mb" };
  
  function addFile() {
    setFiles((prev) => [...prev, newFile]);
  }

  function deleteFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <div className="min-h-screen flex justify-center items-center">
      <Stars />
      <div className="relative z-10 w-60 h-100 sm:w-150 sm:h-120 xl:w-200 xl:h-180 rounded-xl flex flex-col shadow-2xl p-2 bg-white">
        <div className="h-16  flex items-center justify-between rounded-t-xl px-4">
          <h1 className="text-lg text-black sm:text-2xl font-semibold tracking-tight">
            Space<span className="text-indigo-600">Cloud</span>
          </h1>
          <Button variant="outline" size="lg" onClick={addFile}>Upload</Button>
        </div>
        <Separator />
        <ScrollArea className="flex-1 min-h-0">
          <div className="flex flex-col gap-2 text-lg p-4">
            {files.map((file, index) => {
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
                      <Button variant="destructive" size="icon-sm" onClick={() => deleteFile(index)}>
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

      </div>
    </div>
  );
}



