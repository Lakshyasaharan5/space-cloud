import OpenAI from "openai";
import { QdrantClient } from "@qdrant/js-client-rest";
import type { EventResponse } from "./consume.js";
import { fetchFile } from "./download.js";

const COLLECTION_NAME = "files-collections";
const VECTOR_SIZE = 1536;

const openai = new OpenAI();

const client = new QdrantClient({
    host: "localhost",
    port: 6333,
});

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

export async function embed(event: EventResponse): Promise<void> {
    await ensureCollectionExists();

    const file = await fetchFile(event);
    const fileText = file.toString("utf8");
    const embeddings = await getEmbeddings(fileText);

    const points: Point[] = [
        {
            id: event.fileId,
            vector: embeddings,
            payload: {
                fileId: event.fileId,
            },
        },
    ];

    const operationInfo = await client.upsert(COLLECTION_NAME, {
        wait: true,
        points,
    });

    console.debug("Qdrant upsert completed:", operationInfo);
}

async function ensureCollectionExists(): Promise<void> {
    const { exists } = await client.collectionExists(COLLECTION_NAME);

    if (exists) {
        return;
    }

    try {
        await client.createCollection(COLLECTION_NAME, {
            vectors: {
                size: VECTOR_SIZE,
                distance: "Cosine",
            },
        });

        console.log(`Created Qdrant collection: ${COLLECTION_NAME}`);
    } catch (error) {
        // Handles two requests trying to create it at the same time.
        const result = await client.collectionExists(COLLECTION_NAME);

        if (!result.exists) {
            throw error;
        }
    }
}

export async function getEmbeddings(content: string): Promise<number[]> {
    const response = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: content,
        encoding_format: "float",
    });

    const embedding = response.data[0]?.embedding;

    if (!embedding) {
        throw new Error("OpenAI returned no embedding");
    }

    return embedding;
}

export async function deleteEmbeddingsByFileId(
    fileId: string
): Promise<void> {
    const { exists } = await client.collectionExists(COLLECTION_NAME);

    if (!exists) {
        return;
    }

    const result = await client.delete(COLLECTION_NAME, {
        wait: true,
        filter: {
            must: [
                {
                    key: "fileId",
                    match: {
                        value: fileId,
                    },
                },
            ],
        },
    });
    console.log(`entry deleted from qdrant and here is the result: ${result}`);
}