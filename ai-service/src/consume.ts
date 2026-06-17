import { Kafka, logLevel } from "kafkajs";
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
    logLevel: logLevel.WARN,
    retry: {
        retries: 0,
        restartOnFailure: async () => false,
    },
});

const consumer = kafka.consumer({
    groupId: "hello-consumer-group",
});

let stopped = false;

export async function consume(): Promise<void> {
    if (stopped) {
        return;
    }

    try {
        await consumer.connect();

        await consumer.subscribe({
            topic: "ai-embedding-topic",
            fromBeginning: true,
        });

        console.log("Waiting for Kafka events...");

        await consumer.run({
            eachMessage: async ({ topic, partition, message }) => {
                if (!message.value) {
                    console.warn("Received Kafka message with no value");
                    return;
                }

                try {
                    const event = JSON.parse(
                        message.value.toString("utf8")
                    ) as EventResponse;

                    await embed(event);

                    console.log(
                        `Processed file ${event.fileId} at ${topic}[${partition}] offset ${message.offset}`
                    );
                } catch (error) {
                    console.error("Skipping failed Kafka message", {
                        topic,
                        partition,
                        offset: message.offset,
                        error:
                            error instanceof Error
                                ? error.message
                                : String(error),
                    });

                    // Do not throw.
                    // Returning normally allows KafkaJS to continue
                    // and commit the offset for this failed message.
                    return;
                }
            },
        });
    } catch (error) {
        stopped = true;

        console.error(
            "Kafka consumer failed and will not restart:",
            error instanceof Error ? error.message : String(error)
        );

        await disconnectSafely();
    }
}

async function disconnectSafely(): Promise<void> {
    try {
        await consumer.disconnect();
    } catch {
        // Ignore disconnect errors when the consumer never connected.
    }
}

async function shutdown(): Promise<void> {
    if (stopped) {
        return;
    }

    stopped = true;
    console.log("Disconnecting Kafka consumer...");

    await disconnectSafely();
}

process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);