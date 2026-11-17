"use client";

import { useRouter } from "next/navigation";

export default function DeleteButton({ id }: { id: string }) {
  const router = useRouter();

  async function onClick() {
    if (!confirm("Delete this laptop?")) return;
    const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/products");
      router.refresh();
    } else {
      alert("Could not delete the laptop");
    }
  }

  return <button onClick={onClick}>Delete</button>;
}
