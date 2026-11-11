import Link from "next/link";
import { listProducts } from "@/lib/products";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const products = await listProducts();

  return (
    <section className="page">
      <h1>Produits</h1>
      <Link href="/products/new">+ Ajouter un laptop</Link>
      {products.map((p) => (
        <div className="card" key={p.id}>
          <Link href={`/products/${p.id}`}>
            <strong>{p.brand} {p.model}</strong>
          </Link>
          <p>{p.price} € — stock : {p.stock}</p>
        </div>
      ))}
    </section>
  );
}