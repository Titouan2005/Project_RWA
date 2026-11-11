import PocketBase from "pocketbase";

export function getPb() {
  const pb = new PocketBase(process.env.PB_URL ?? "http://127.0.0.1:8090");
  pb.autoCancellation(false);
  return pb;
}