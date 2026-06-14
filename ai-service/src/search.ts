import { getEmbeddings, getQdrantClient } from "./embed.js";

export type SearchResult = {
    score: number;
    fileId: string
}

export async function search(query: string): Promise<SearchResult[]> {
    console.log(query)
    const embedding = await getEmbeddings(query);
    let res = await getQdrantClient().query(
        "files-collections", {
        query: embedding,
        limit: 3,
        with_payload: true
    });

    return res.points
        .filter(
            (point) =>
                typeof point.payload?.fileId === "string"
        )
        .map((point) => ({
            fileId: point.payload!.fileId as string,
            score: point.score,
        }));
}