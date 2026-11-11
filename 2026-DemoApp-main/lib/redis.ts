import { createClient } from "redis";

const globalForRedis = globalThis as unknown as {
  redisClient?: ReturnType<typeof createClient>;
};

export async function getRedis() {
  if (!globalForRedis.redisClient) {
    const client = createClient({ url: process.env.REDIS_URL });
    client.on("error", (err) => console.error("Redis error", err));
    await client.connect();
    globalForRedis.redisClient = client;
  }
  return globalForRedis.redisClient;
}