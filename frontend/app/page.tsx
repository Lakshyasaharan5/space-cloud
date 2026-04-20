"use client";

import clsx from "clsx";
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

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
            Space<span className="text-gray-400">Cloud</span>
          </h1>
          <Button variant="outline" size="lg">Upload</Button>
        </div>
        <ScrollArea className="flex-1 min-h-0">
          <div className="h-80 bg-blue-100 rounded-b-xl"></div>
          <div className="h-80 bg-green-100 rounded-b-xl"></div>
          <div className="h-80 bg-blue-100 rounded-b-xl"></div>
          <div className="h-80 bg-green-100 rounded-b-xl"></div>
        </ScrollArea>
      
      </div>
    </div>
  );
}

