export async function search(query: string): Promise<string> {
    console.log(query);
    await sleep(2000);
    return query;
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log("Search complete");
      resolve();
    }, ms);
  });
}