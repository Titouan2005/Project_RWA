import Link from "next/link";
import { notFound } from "next/navigation";
import DeleteButton from "@/components/DeleteButton";
import { getProduct } from "@/lib/products";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();

  return (
    <section className="page">
      <h1>{product.brand} {product.model}</h1>
      <div className="card">
        <p>Price: {product.price} €</p>
        <p>Stock: {product.stock}</p>
        <p>{product.description}</p>
      </div>
      <Link href={`/products/${product.id}/edit`}>Edit</Link>{" "}
      <DeleteButton id={product.id} />
    </section>
  );
}
