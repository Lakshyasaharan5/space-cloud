"use client";

import clsx from "clsx";
import { JSX } from "react";

export default function Home() {  

  function rows(): JSX.Element[] {
    const rowArray = [];
    for (let i = 0; i < 5; i++) {
      rowArray.push(
        <div key={i} className="w-full h-10 border-2 border-purple-300"></div>
      );
    }
    return rowArray;
  }

  return (
    <div className={clsx(
      "h-screen",
      "border-5",
      "border-red-500",
      "flex flex-col",
      "gap-5"
    )}>
      <div className="w-full h-20 sm:h-40 border-5 border-blue-500 flex justify-center items-center">
        <button>Upload</button>
      </div>
      <div className="w-full h-full border-5 border-blue-500 flex flex-col gap-6">
        {rows()}
      </div>
    </div>
  );
}

