import { NextResponse } from "next/server";
import { createProduct, listProducts } from "@/lib/products";
import { validateProduct } from "@/lib/validation";
import { revalidateTag } from "next/cache";

export async function GET() {
  try {
    return NextResponse.json(await listProducts());
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ errors: ["JSON invalide"] }, { status: 400 });
  }

  const result = validateProduct(body);
  if (!result.ok) {
    return NextResponse.json({ errors: result.errors }, { status: 400 });
  }

  try {
    const created = await createProduct(result.data);
    revalidateTag("products", { expire: 0 });
    return NextResponse.json(created, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}