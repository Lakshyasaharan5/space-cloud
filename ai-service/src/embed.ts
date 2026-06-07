// import { download } from "./download.js";
import * as fs from "fs";
import OpenAI from "openai";
import { QdrantClient } from "@qdrant/js-client-rest";

const openai = new OpenAI();
const client = new QdrantClient({ host: "localhost", port: 6333 });

interface Point {
    id: number;
    vector: number[];
    payload: {
        filename: string;
    };
}

async function main() {
    // await embed();    
    const searchResult = await search();
    console.log(searchResult);
}

async function search() {
    const embedding = await getEmbeddings("my resume file");
    let searchResult = await client.query(
        "files-collections", {
        query: embedding,
        limit: 3,
        with_payload: true
    });

    return searchResult.points;

}

export async function embed() {
    /*              
    const fileId = "72e433e1-f19e-4934-b220-fe9e42091f88";
    const fileName = "123.txt";
    const savedPath = await download(fileId, fileName);
    console.log(`Saved path: ${savedPath}`);
    */

    const files: string[] = fs.readdirSync("data/");
    const points: Point[] = [];
    let index = 0;
    for (const file of files) {
        const content = fs.readFileSync(`data/${file}`, "utf8");
        const embeddings = await getEmbeddings(content);
        points.push({
            id: index,
            vector: embeddings,
            payload: {
                filename: file
            }
        })
        index++;
    }
    const operationInfo = await client.upsert("files-collections", {
        wait: true,
        points: points,
    });

    console.debug(operationInfo);
}

async function getEmbeddings(content: string): Promise<number[]> {
    const embedding = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: content,
        encoding_format: "float",
    });
    return embedding.data[0].embedding;
}

main();