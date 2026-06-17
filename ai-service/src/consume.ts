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

    // Keep KafkaJS's retries small because startup retries are handled below.
    retry: {
        initialRetryTime: 1_000,
        retries: 3,
        factor: 0.2,
        multiplier: 2,
        maxRetryTime: 5_000,
        restartOnFailure: async () => false,
    },
});

const consumer = kafka.consumer({
    groupId: "hello-consumer-group",
});

const MAX_START_ATTEMPTS = 10;
const START_RETRY_DELAY_MS = 3_000;

let stopped = false;
let connected = false;

function sleep(milliseconds: number): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(resolve, milliseconds);
    });
}

export async function consume(): Promise<void> {
    for (
        let attempt = 1;
        attempt <= MAX_START_ATTEMPTS && !stopped;
        attempt++
    ) {
        try {
            console.log(
                `Connecting to Kafka (${attempt}/${MAX_START_ATTEMPTS})...`
            );

            await consumer.connect();
            connected = true;

            await consumer.subscribe({
                topic: "ai-embedding-topic",
                fromBeginning: true,
            });

            console.log("Connected. Waiting for Kafka events...");

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
                            `Processed file ${event.fileId} at ` +
                            `${topic}[${partition}] offset ${message.offset}`
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
                    }
                },
            });

            // Consumer successfully started.
            return;
        } catch (error) {
            console.error(
                `Kafka startup attempt ${attempt}/${MAX_START_ATTEMPTS} failed:`,
                error instanceof Error ? error.message : String(error)
            );

            if (connected) {
                await disconnectSafely();
                connected = false;
            }

            if (attempt === MAX_START_ATTEMPTS) {
                stopped = true;

                console.error(
                    `Kafka consumer stopped after ${MAX_START_ATTEMPTS} startup attempts.`
                );

                return;
            }

            await sleep(START_RETRY_DELAY_MS);
        }
    }
}

async function disconnectSafely(): Promise<void> {
    try {
        await consumer.disconnect();
    } catch {
        // Ignore disconnect failures.
    }
}

async function shutdown(): Promise<void> {
    if (stopped) {
        return;
    }

    stopped = true;
    console.log("Disconnecting Kafka consumer...");

    await disconnectSafely();
    connected = false;
}

process.once("SIGINT", () => {
    void shutdown();
});

process.once("SIGTERM", () => {
    void shutdown();
});