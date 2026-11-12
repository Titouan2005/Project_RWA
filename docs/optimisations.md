Optimisation 1 : le cache de données Next.js avec invalidation à la demande. La liste des produits est mise en cache, donc PocketBase n’est plus appelé à chaque visite. Dès qu’on ajoute, modifie ou supprime un laptop, on vide ce cache.

Dans lib/products.ts, remplace uniquement la fonction listProducts par :

ts
export async function listProducts(): Promise<Product[]> {
  const base = process.env.PB_URL ?? "http://127.0.0.1:8090";
  const res = await fetch(
    `${base}/api/collections/laptops/records?perPage=500&sort=brand,model`,
    { next: { tags: ["products"], revalidate: 300 } }
  );
  if (!res.ok) throw new Error("PocketBase error");
  const data = await res.json();
  return (data.items as RecordModel[]).map(toProduct);
}

Puis dans app/api/products/route.ts, ajoute en haut import { revalidateTag } from "next/cache"; et, dans le POST, juste avant le return de réussite :
ts
const created = await createProduct(result.data);
revalidateTag("products", { expire: 0 });
return NextResponse.json(created, { status: 201 });

Fais la même chose dans app/api/products/[id]/route.ts : ajoute l’import, puis appelle revalidateTag("products", { expire: 0 }); après un updateProduct réussi (juste avant return NextResponse.json(updated)) et après un deleteProduct réussi (avant return new Response(null, { status: 204 })).

Si Next te dit que revalidateTag n’accepte pas ce deuxième argument, envoie-moi l’erreur exacte et j’adapte.

Pour le prouver : regarde le terminal de PocketBase. Recharge /products plusieurs fois, la première fois une requête apparaît dans les logs, ensuite aucune. Ajoute un laptop et la liste se met à jour tout de suite, avec une nouvelle requête. Fais une capture de ça pour le PDF.

Optimisation 2 : le chargement différé (lazy loading) des librairies de graphiques. C’est déjà fait avec next/dynamic dans AdminCharts.tsx. Recharts et Chart.js sont lourds, donc ils ne sont chargés que si on ouvre /admin, pas sur les autres pages. Pour le prouver avec des chiffres :

Ouvre les outils de développement de Chrome, onglet “Network”, coche “Disable cache”, puis recharge /products et note le total de JavaScript transféré.
Fais pareil sur /admin, tu verras plus de JavaScript, seulement là.
Pour la comparaison “sans” l’optimisation, remplace temporairement les dynamic(...) par des import normaux en haut de AdminCharts.tsx, et refais la mesure sur /products. Le JavaScript de /products augmente.

Écris ensuite docs/OPTIMISATIONS.md avec pour chaque optimisation : le problème, la solution, comment tu as mesuré, les chiffres avant et après, et pourquoi ce choix.

Pense à commit et synchroniser.