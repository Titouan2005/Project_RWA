import { getRedis } from "./redis";

export type HomeContent = {
  title: string;
  subtitle: string;
  intro: string;
  features: { title: string; text: string }[];
  footer: string;
};

export async function getHomeContent(): Promise<HomeContent | null> {
  try {
    const redis = await getRedis();
    const raw = await redis.get("home:content");
    return raw ? (JSON.parse(raw) as HomeContent) : null;
  } catch {
    return null;
  }
}