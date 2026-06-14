import { Kafka } from "kafkajs";
import { fetchFile } from "./download.js";
import { embed } from "./embed.js";

type Chunk = {
    chunkIndex: number;
    chunkSize: number;
    primary: number;
    replicas: number[];
};

export type EventResponse = {
    chunks: Chunk[];
    datanodes: string[];
    fileId: string;
    totalChunks: number;
};

const kafka = new Kafka({
    clientId: "typescript-consumer",
    brokers: ["localhost:9095"],
});

const consumer = kafka.consumer({
    groupId: "hello-consumer-group",
});

export async function consume(): Promise<void> {
    await consumer.connect();

    await consumer.subscribe({
        topic: "ai-embedding-topic",
        fromBeginning: true,
    });

    console.log("Waiting for Kafka events...");

    await consumer.run({
        eachMessage: async ({ message }) => {
            if (!message.value) {
                console.warn("Received Kafka message with no value");
                return;
            }

            const event = JSON.parse(
                message.value.toString("utf8")
            ) as EventResponse;

            await embed(event);
        },
    });
}

async function shutdown(): Promise<void> {
    console.log("Disconnecting consumer...");
    await consumer.disconnect();
    process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
