import { beforeEach, describe, expect, it, vi } from "vitest";

const fake = vi.hoisted(() => ({ on: vi.fn(), connect: vi.fn().mockResolvedValue(undefined) }));
vi.mock("redis", () => ({ createClient: vi.fn(() => fake) }));

import { createClient } from "redis";
import { getRedis } from "@/lib/redis";

beforeEach(() => {
  vi.clearAllMocks();
  (globalThis as { redisClient?: unknown }).redisClient = undefined;
});

describe("getRedis", () => {
  it("R1 creates and connects a client on the first call", async () => {
    const client = await getRedis();
    expect(client).toBe(fake);
    expect(createClient).toHaveBeenCalledTimes(1);
    expect(fake.connect).toHaveBeenCalledTimes(1);
  });

  it("R1 reuses the same client afterwards", async () => {
    await getRedis();
    await getRedis();
    expect(createClient).toHaveBeenCalledTimes(1);
    expect(fake.connect).toHaveBeenCalledTimes(1);
  });

  it("R1 logs Redis errors", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    await getRedis();
    const handler = fake.on.mock.calls[0][1];
    handler(new Error("boom"));
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});
