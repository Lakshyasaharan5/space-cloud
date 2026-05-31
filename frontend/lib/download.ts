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

    const res = await fetch(
        `${task.url}/chunks/${task.fileId}/${task.chunkIndex}`
    );

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

async function runDownloadWorkers(
    tasks: DownloadTask[],
    workerCount: number,
    writable: FileSystemWritableFileStream
) {
    let nextTaskIndex = 0;
    let nextToWrite = 0;

    const totalChunks = tasks.length;
    const buffer = new Map<number, Uint8Array>();

    const MAX_BUFFER = workerCount * 2;

    // This prevents multiple workers from writing at the same time.
    let writerChain = Promise.resolve();

    function toExactArrayBuffer(chunk: Uint8Array): ArrayBuffer {
        return chunk.buffer.slice(
            chunk.byteOffset,
            chunk.byteOffset + chunk.byteLength
        ) as ArrayBuffer;
    }

    async function writeAvailableChunks() {
        while (nextToWrite < totalChunks && buffer.has(nextToWrite)) {
            const chunk = buffer.get(nextToWrite)!;
            const task = tasks[nextToWrite];

            const offset = task.chunkIndex * BASE_CHUNK_SIZE;

            await writable.write({
                type: "write",
                position: offset,
                data: toExactArrayBuffer(chunk),
            });

            buffer.delete(nextToWrite);

            console.log(`Wrote chunk ${nextToWrite}`);

            nextToWrite++;
        }
    }

    function scheduleWrite() {
        writerChain = writerChain.then(writeAvailableChunks);
        return writerChain;
    }

    async function waitForBufferSpace() {
        while (buffer.size >= MAX_BUFFER) {
            await scheduleWrite();
            await new Promise((r) => setTimeout(r, 10));
        }
    }

    async function worker(id: number) {
        while (true) {
            await waitForBufferSpace();

            if (nextTaskIndex >= tasks.length) break;

            const task = tasks[nextTaskIndex++];

            console.log(`Worker ${id} picked chunk ${task.chunkIndex}`);

            const data = await downloadChunk(task);

            buffer.set(task.chunkIndex, data);

            await scheduleWrite();
        }
    }

    try {
        const workers = Array.from({ length: workerCount }, (_, i) =>
            worker(i)
        );

        await Promise.all(workers);

        await writerChain;

        if (nextToWrite !== totalChunks) {
            throw new Error(
                `Download incomplete. Wrote ${nextToWrite}/${totalChunks} chunks`
            );
        }

        await writable.close();
    } catch (err) {
        await writable.abort();
        throw err;
    }
}

export async function startDownload(
    fileId: string,
    fileName: string,
    workerCount: number = 1
) {
    const res = await fetch(`http://localhost:8080/download/${fileId}`);

    if (!res.ok) {
        throw new Error("Failed to fetch download metadata");
    }

    const data: DownloadResponse = await res.json();

    console.log("DOWNLOAD RESPONSE:", data);

    const tasks = createDownloadTasks(data);

    const handle = await (window as any).showSaveFilePicker({
        suggestedName: fileName,
    });

    const writable = await handle.createWritable();

    // START TIMER
    const startTime = performance.now();

    await runDownloadWorkers(tasks, workerCount, writable);

    // END TIMER
    const endTime = performance.now();

    const durationMs = endTime - startTime;
    const durationSec = durationMs / 1000;

    // file size (MB)
    const totalBytes = data.chunks.reduce(
        (sum, c) => sum + c.chunkSize,
        0
    );
    const totalMB = totalBytes / (1024 * 1024);

    const speedMBps = totalMB / durationSec;

    console.log("Download complete");
    // uncomment for benchmark
    // console.log(`Workers: ${workerCount}`);
    // console.log(`Time: ${durationSec.toFixed(2)} sec`);
    // console.log(`Size: ${totalMB.toFixed(2)} MB`);
    // console.log(`Speed: ${speedMBps.toFixed(2)} MB/s`);
}