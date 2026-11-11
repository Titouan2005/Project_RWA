import { NextResponse } from "next/server";
import { deleteProduct, getProduct, updateProduct } from "@/lib/products";
import { validateProduct } from "@/lib/validation";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  const { id } = await params;
  try {
    const product = await getProduct(id);
    if (!product) return NextResponse.json({ error: "Introuvable" }, { status: 404 });
    return NextResponse.json(product);
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: Ctx) {
  const { id } = await params;

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
    const updated = await updateProduct(id, result.data);
    if (!updated) return NextResponse.json({ error: "Introuvable" }, { status: 404 });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const { id } = await params;
  try {
    const ok = await deleteProduct(id);
    if (!ok) return NextResponse.json({ error: "Introuvable" }, { status: 404 });
    return new Response(null, { status: 204 });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}