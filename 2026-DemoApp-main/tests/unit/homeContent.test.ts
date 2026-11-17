import { beforeEach, describe, expect, it, vi } from "vitest";
import { getHomeContent } from "@/lib/homeContent";
import { getRedis } from "@/lib/redis";

vi.mock("@/lib/redis", () => ({ getRedis: vi.fn() }));

const content = { title: "T", subtitle: "S", intro: "I", features: [{ title: "a", text: "b" }], footer: "F" };
const redisWith = (value: string | null) => ({ get: vi.fn().mockResolvedValue(value) });

beforeEach(() => vi.clearAllMocks());

describe("getHomeContent", () => {
  it("H1 returns the content stored in Redis", async () => {
    const redis = redisWith(JSON.stringify(content));
    vi.mocked(getRedis).mockResolvedValue(redis as never);
    expect(await getHomeContent()).toEqual(content);
    expect(redis.get).toHaveBeenCalledWith("home:content");
  });
  it("H1 returns null if the key does not exist", async () => {
    vi.mocked(getRedis).mockResolvedValue(redisWith(null) as never);
    expect(await getHomeContent()).toBeNull();
  });
  it("H1 returns null if the JSON is invalid", async () => {
    vi.mocked(getRedis).mockResolvedValue(redisWith("{not json") as never);
    expect(await getHomeContent()).toBeNull();
  });
  it("H1 returns null if Redis is down", async () => {
    vi.mocked(getRedis).mockRejectedValue(new Error("down"));
    expect(await getHomeContent()).toBeNull();
  });
});
