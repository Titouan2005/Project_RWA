import { afterEach, describe, expect, it } from "vitest";
import { getPb } from "@/lib/pocketbase";

const original = process.env.PB_URL;
afterEach(() => {
  if (original === undefined) delete process.env.PB_URL;
  else process.env.PB_URL = original;
});

describe("getPb", () => {
  it("B1 uses the default URL without an environment variable", () => {
    delete process.env.PB_URL;
    expect(getPb().baseURL).toBe("http://127.0.0.1:8090");
  });
  it("B1 uses PB_URL when it is set", () => {
    process.env.PB_URL = "http://pb.test:1234";
    expect(getPb().baseURL).toBe("http://pb.test:1234");
  });
});
