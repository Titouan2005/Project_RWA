import { afterEach, describe, expect, it } from "vitest";
import { getPb } from "@/lib/pocketbase";

const original = process.env.PB_URL;
afterEach(() => {
  if (original === undefined) delete process.env.PB_URL;
  else process.env.PB_URL = original;
});

describe("getPb", () => {
  it("utilise l'URL par défaut sans variable d'environnement", () => {
    delete process.env.PB_URL;
    expect(getPb().baseURL).toBe("http://127.0.0.1:8090");
  });
  it("utilise PB_URL quand elle est définie", () => {
    process.env.PB_URL = "http://pb.test:1234";
    expect(getPb().baseURL).toBe("http://pb.test:1234");
  });
});