"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Product } from "@/lib/types";

export default function ProductForm({ product }: { product?: Product }) {
  const router = useRouter();
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrors([]);

    const f = new FormData(e.currentTarget);
    const body = {
      brand: String(f.get("brand")),
      model: String(f.get("model")),
      price: Number(f.get("price")),
      stock: Number(f.get("stock")),
      description: String(f.get("description")),
    };

    const res = await fetch(product ? `/api/products/${product.id}` : "/api/products", {
      method: product ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setErrors(data.errors ?? [data.error ?? "Erreur"]);
      setLoading(false);
      return;
    }

    const saved: Product = await res.json();
    router.push(`/products/${saved.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="card">
      <label>Marque <input name="brand" defaultValue={product?.brand} required /></label>
      <label>Modèle <input name="model" defaultValue={product?.model} required /></label>
      <label>Prix (€) <input name="price" type="number" step="0.01" min="0" defaultValue={product?.price} required /></label>
      <label>Stock <input name="stock" type="number" step="1" min="0" defaultValue={product?.stock ?? 0} required /></label>
      <label>Description <textarea name="description" defaultValue={product?.description} /></label>
      {errors.map((err) => <p key={err} style={{ color: "crimson" }}>{err}</p>)}
      <button type="submit" disabled={loading}>{product ? "Enregistrer" : "Ajouter"}</button>
    </form>
  );
}