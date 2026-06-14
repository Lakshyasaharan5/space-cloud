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

function createDownloadTasks(res: DownloadResponse): DownloadTask[] {
    return res.chunks
        .map((chunk) => ({
            chunkIndex: chunk.chunkIndex,
            chunkSize: chunk.chunkSize,
            url: res.datanodes[chunk.primary],
            fileId: res.fileId,
        }))
        .sort((a, b) => a.chunkIndex - b.chunkIndex);
}

async function downloadChunk(task: DownloadTask): Promise<Buffer> {

    const response = await fetch(
        `${task.url}/chunks/${task.fileId}/${task.chunkIndex}`
    );

    if (!response.ok) {
        throw new Error(
            `Failed to download chunk ${task.chunkIndex}: ${response.status}`
        );
    }

    const arrayBuffer = await response.arrayBuffer();
    const chunk = Buffer.from(arrayBuffer);

    if (chunk.byteLength !== task.chunkSize) {
        throw new Error(
            `Chunk ${task.chunkIndex} size mismatch. ` +
            `Expected ${task.chunkSize}, got ${chunk.byteLength}`
        );
    }

    return chunk;
}

export async function fetchFile(downloadResponse: DownloadResponse): Promise<Buffer> {

    const tasks = createDownloadTasks(downloadResponse);

    // Downloads all chunks concurrently.
    const chunks = await Promise.all(
        tasks.map((task) => downloadChunk(task))
    );

    // Tasks were sorted by chunkIndex, so this recreates the original file.
    return Buffer.concat(chunks);
}