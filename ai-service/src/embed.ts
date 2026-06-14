import OpenAI from "openai";
import { QdrantClient } from "@qdrant/js-client-rest";
import type { EventResponse } from "./consume.js";
import { fetchFile } from "./download.js";

const openai = new OpenAI();
const client = new QdrantClient({ host: "localhost", port: 6333 });

interface Point {
    id: string;
    vector: number[];
    payload: {
        fileId: string;
    };
}

export function getQdrantClient(): QdrantClient {
    return client;
}

export async function embed(event: EventResponse) {
    const file = await fetchFile(event);
    const fileText = file.toString("utf8");
    const embeddings = await getEmbeddings(fileText);
    const points: Point[] = [];
    points.push({
        id: event.fileId,
        vector: embeddings,
        payload: {
            fileId: event.fileId
        }
    })
    const operationInfo = await client.upsert("files-collections", {
        wait: true,
        points: points,
    });

    console.debug(operationInfo);
}

export async function getEmbeddings(content: string): Promise<number[]> {
    const embedding = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: content,
        encoding_format: "float",
    });
    return embedding.data[0].embedding;
}

