import { createClient } from "redis";

function makeClient() {
  return createClient({ url: process.env.REDIS_URL });
}

const globalForRedis = globalThis as unknown as {
  redisClient?: ReturnType<typeof makeClient>;
};

export async function getRedis() {
  if (!globalForRedis.redisClient) {
    const client = makeClient();
    client.on("error", (err) => console.error("Redis error", err));
    await client.connect();
    globalForRedis.redisClient = client;
  }
  return globalForRedis.redisClient;
}