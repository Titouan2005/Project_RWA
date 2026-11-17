import AdminCharts from "@/components/AdminCharts";
import { listProducts } from "@/lib/products";
import { stockByBrand } from "@/lib/stats";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const products = await listProducts();

  return (
    <section className="page">
      <h1>Admin</h1>
      <AdminCharts stock={stockByBrand(products)} />
    </section>
  );
}
