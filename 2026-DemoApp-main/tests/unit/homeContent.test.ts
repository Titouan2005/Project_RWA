import { beforeEach, describe, expect, it, vi } from "vitest";
import { getHomeContent } from "@/lib/homeContent";
import { getRedis } from "@/lib/redis";

vi.mock("@/lib/redis", () => ({ getRedis: vi.fn() }));

const content = { title: "T", subtitle: "S", intro: "I", features: [{ title: "a", text: "b" }], footer: "F" };
const redisWith = (value: string | null) => ({ get: vi.fn().mockResolvedValue(value) });

beforeEach(() => vi.clearAllMocks());

describe("getHomeContent", () => {
  it("H1 renvoie le contenu stocké dans Redis", async () => {
    const redis = redisWith(JSON.stringify(content));
    vi.mocked(getRedis).mockResolvedValue(redis as never);
    expect(await getHomeContent()).toEqual(content);
    expect(redis.get).toHaveBeenCalledWith("home:content");
  });
  it("H1 renvoie null si la clé n'existe pas", async () => {
    vi.mocked(getRedis).mockResolvedValue(redisWith(null) as never);
    expect(await getHomeContent()).toBeNull();
  });
  it("H1 renvoie null si le JSON est invalide", async () => {
    vi.mocked(getRedis).mockResolvedValue(redisWith("{pas du json") as never);
    expect(await getHomeContent()).toBeNull();
  });
  it("H1 renvoie null si Redis est en panne", async () => {
    vi.mocked(getRedis).mockRejectedValue(new Error("down"));
    expect(await getHomeContent()).toBeNull();
  });
});