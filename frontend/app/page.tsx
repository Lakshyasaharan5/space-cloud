"use client";

import clsx from "clsx";
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Download, Trash2 } from "lucide-react";

export default function Home() {

  return (
    <div className={clsx(
      "h-screen",
      "flex",
      "justify-center",
      "items-center"
    )}>
      <div className="w-60 h-100 sm:w-150 sm:h-120 xl:w-200 xl:h-180 rounded-xl flex flex-col shadow-2xl p-2">
        <div className="h-16 bg-gray-50 flex items-center justify-between rounded-t-xl px-4">
          <h1 className="text-lg sm:text-2xl font-semibold tracking-tight">
            Space<span className="text-violet-800">Cloud</span>
          </h1>
          <Button variant="outline" size="lg">Upload</Button>
        </div>
        <ScrollArea className="flex-1 min-h-0">
          <div className="flex flex-col gap-2 text-lg p-4">
            <div className="flex items-center justify-between">
              {/* left side */}
              <div className="flex items-center justify-between gap-2">
                <div>resume.pdf</div>
                <div className="text-muted-foreground italic">2 MB</div>
              </div>
              {/* right side */}
              <div className="flex items-center justify-between gap-4">
                <Button variant="outline" size="icon-sm">
                  <Download />
                </Button>
                <Button variant="destructive" size="icon-sm">
                  <Trash2 />
                </Button>
              </div>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              {/* left side */}
              <div className="flex items-center justify-between gap-2">
                <div>image.png</div>
                <div className="text-muted-foreground italic">5 MB</div>
              </div>
              {/* right side */}
              <div className="flex items-center justify-between gap-4">
                <Button variant="outline" size="icon-sm">
                  <Download />
                </Button>
                <Button variant="destructive" size="icon-sm">
                  <Trash2 />
                </Button>
              </div>
            </div>
            <Separator />
          </div>
        </ScrollArea>

      </div>
    </div>
  );
}

