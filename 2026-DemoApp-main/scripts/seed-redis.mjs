import { createClient } from "redis";
import { readFile } from "node:fs/promises";

const content = await readFile(new URL("./home-content.json", import.meta.url), "utf8");

const client = createClient({ url: process.env.REDIS_URL });
await client.connect();
await client.set("home:content", content);
console.log("Home text registered in redis");
await client.quit();