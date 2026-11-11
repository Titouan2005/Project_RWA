import { NextResponse } from "next/server";
import { createProduct, listProducts } from "@/lib/products";
import { validateProduct } from "@/lib/validation";

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
    return NextResponse.json(await createProduct(result.data), { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}