import { mkdir, open } from "node:fs/promises";
import path from "node:path";

type Chunk = {
    chunkIndex: number;
    chunkSize: number;
    primary: number;
    replicas: number[];
};

type DownloadResponse = {
    chunks: Chunk[];
    datanodes: string[];
    fileId: string;
    totalChunks: number;
};

type DownloadTask = {
    chunkIndex: number;
    chunkSize: number;
    url: string;
    fileId: string;
};

const BASE_CHUNK_SIZE = 1024 * 1024; // 1MB

function createDownloadTasks(res: DownloadResponse): DownloadTask[] {
    return res.chunks
        .map((c) => ({
            chunkIndex: c.chunkIndex,
            chunkSize: c.chunkSize,
            url: res.datanodes[c.primary],
            fileId: res.fileId,
        }))
        .sort((a, b) => a.chunkIndex - b.chunkIndex);
}

async function downloadChunk(task: DownloadTask): Promise<Uint8Array> {
    console.log(`Downloading chunk ${task.chunkIndex}`);

    const res = await fetch(`${task.url}/chunks/${task.fileId}/${task.chunkIndex}`);

    if (!res.ok) {
        throw new Error(`Failed chunk ${task.chunkIndex}`);
    }

    const arrayBuffer = await res.arrayBuffer();

    if (arrayBuffer.byteLength !== task.chunkSize) {
        throw new Error(
            `Chunk ${task.chunkIndex} size mismatch. Expected ${task.chunkSize}, got ${arrayBuffer.byteLength}`
        );
    }

    console.log(`Finished chunk ${task.chunkIndex}`);

    return new Uint8Array(arrayBuffer);
}

function sanitizeFileName(name: string): string {
    return name.replace(/[<>:"/\\|?*\x00-\x1F]/g, "_");
}

export async function download(fileId: string, name: string): Promise<string> {
    const metadataRes = await fetch(`http://localhost:8080/download/${fileId}`);

    if (!metadataRes.ok) {
        throw new Error("Failed to fetch download metadata");
    }

    const data: DownloadResponse = await metadataRes.json();

    const tasks = createDownloadTasks(data);

    const dataDir = path.resolve(process.cwd(), "data");
    await mkdir(dataDir, { recursive: true });

    const safeName = sanitizeFileName(name);
    const filePath = path.join(dataDir, safeName);

    const fileHandle = await open(filePath, "w");

    try {
        for (const task of tasks) {
            const chunk = await downloadChunk(task);

            const offset = task.chunkIndex * BASE_CHUNK_SIZE;

            await fileHandle.write(
                chunk,
                0,
                chunk.byteLength,
                offset
            );

            console.log(`Wrote chunk ${task.chunkIndex}`);
        }

        console.log(`Download complete: ${filePath}`);

        return filePath;
    } finally {
        await fileHandle.close();
    }
}