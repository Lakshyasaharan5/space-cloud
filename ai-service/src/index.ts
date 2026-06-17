import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { search } from "./search.js";
import { consume } from "./consume.js";
import { deleteEmbeddingsByFileId } from "./embed.js";

const app = new Hono();

app.get("/health", (c) => {
    return c.text("AI Service is up!");
});

app.get("/search", async (c) => {
    const query = c.req.query("q");

    if (!query) {
        return c.json([]);
    }

    try {
        const result = await search(query);
        return c.json(result);
    } catch (error) {
        console.error("Search failed:", error);

        return c.json(
            {
                error: "Search failed",
            },
            500
        );
    }
});

app.delete("/embeddings/:fileId", async (c) => {
    const fileId = c.req.param("fileId");

    if (!fileId.trim()) {
        return c.json(
            {
                error: "fileId is required",
            },
            400
        );
    }

    try {
        await deleteEmbeddingsByFileId(fileId);

        return c.json({
            message: "Embeddings deleted",
            fileId,
        });
    } catch (error) {
        console.error(
            `Failed to delete embeddings for fileId ${fileId}:`,
            error
        );

        return c.json(
            {
                error: "Failed to delete embeddings",
                fileId,
            },
            500
        );
    }
});

serve(
    {
        fetch: app.fetch,
        port: 3001,
    },
    (info) => {
        console.log(
            `Server is running on http://localhost:${info.port}`
        );
    }
);

consume().catch((error) => {
    console.error(
        "Kafka consumer failed:",
        error instanceof Error ? error.message : String(error)
    );
});