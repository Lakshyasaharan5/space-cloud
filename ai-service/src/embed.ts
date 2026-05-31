import { download } from "./download.js";

export async function embed() {
    console.log("Embedding started.....");
    
    /*
    consume kafka event
    recreate file
    create chunks
    store in vectordb    
    */    
    const fileId = "72e433e1-f19e-4934-b220-fe9e42091f88";
    const fileName = "123.txt";
    const savedPath = await download(fileId, fileName);
    console.log(`Saved path: ${savedPath}`);
    console.log("Embedding done");
}