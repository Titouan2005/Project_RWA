import { notFound } from "next/navigation";
import ProductForm from "@/components/ProductForm";
import { getProduct } from "@/lib/products";

export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();

  return (
    <section className="page">
      <h1>Edit {product.brand} {product.model}</h1>
      <ProductForm product={product} />
    </section>
  );
}
