"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";

type Chunk = {
    chunkIndex: number;
    chunkSize: number;
    primary: number;
    replicas: number[]
};

type UploadResponse = {
    chunks: Chunk[];
    datanodes: string[];
    fileId: string;
    totalChunks: number;
};

const BASE_CHUNK_SIZE = 1024 * 1024; // 1MB

function createTasks(res: UploadResponse) {
    console.log("FULL RESPONSE:", res);
    return res.chunks.map((c) => {
        const start = c.chunkIndex * BASE_CHUNK_SIZE;
        const end = start + c.chunkSize;

        return {
            chunkIndex: c.chunkIndex,
            start,
            end,
            url: res.datanodes[c.primary],
            fileId: res.fileId
        };
    });
}

async function uploadChunk(
    file: File,
    task: {
        start: number;
        end: number;
        url: string;
        chunkIndex: number;
        fileId: string;
    }
) {
    const blob = file.slice(task.start, task.end);

    console.log(`Uploading chunk ${task.chunkIndex}`);

    await fetch(
        `${task.url}/chunks/${task.fileId}/${task.chunkIndex}`,
        {
            method: "PUT",
            body: blob,
            headers: {
                "Content-Type": "application/octet-stream",
            },
        }
    );

    console.log(`Finished chunk ${task.chunkIndex}`);
}

async function runWorkers(
    file: File,
    tasks: any[],
    workerCount: number
) {
    let index = 0;

    async function worker(id: number) {
        while (true) {
            if (index >= tasks.length) break;

            const current = index++;
            const task = tasks[current];

            console.log(`Worker ${id} picked chunk ${task.chunkIndex}`);

            await uploadChunk(file, task);
        }
    }

    const workers = Array.from({ length: workerCount }, (_, i) =>
        worker(i)
    );

    await Promise.all(workers);
}

async function startUpload(file: File) {
    // get chunk mapping from master node
    const res = await fetch("http://localhost:8080/upload/init", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            fileName: file.name,
            fileSize: file.size,
        }),
    });

    const data: UploadResponse = await res.json();

    // create task
    const tasks = createTasks(data);

    // run workers
    await runWorkers(file, tasks, 4);

    console.log("Upload complete");
}

export default function Header() {
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        await startUpload(file);
    };

    return (
        <div className="h-16 flex items-center justify-between rounded-t-xl px-4">
            <h1 className="text-lg text-black sm:text-2xl font-semibold tracking-tight">
                Space<span className="text-indigo-600">Cloud</span>
            </h1>

            {/* Hidden file input */}
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
            />

            <Button variant="outline" size="lg" onClick={handleClick}>
                Upload
            </Button>
        </div>
    );
}