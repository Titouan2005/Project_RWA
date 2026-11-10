const PB_URL = process.env.PB_URL ?? "http://127.0.0.1:8090";

const laptops = [
  { brand: "Dell", model: "XPS 13", price: 1199, stock: 8, description: "Ultraportable premium de 13 pouces, écran InfinityEdge." },
  { brand: "Dell", model: "XPS 15", price: 1799, stock: 5, description: "Portable de 15 pouces pour la création et la puissance." },
  { brand: "Dell", model: "Inspiron 15", price: 649, stock: 15, description: "Portable polyvalent pour le travail et les études." },
  { brand: "Dell", model: "Latitude 5440", price: 999, stock: 10, description: "Portable professionnel robuste, orienté entreprise." },
  { brand: "Lenovo", model: "ThinkPad X1 Carbon", price: 1699, stock: 6, description: "Ultraportable léger en fibre de carbone, clavier réputé." },
  { brand: "Lenovo", model: "ThinkPad T14", price: 1099, stock: 12, description: "Portable professionnel de 14 pouces, fiable et sécurisé." },
  { brand: "Lenovo", model: "IdeaPad 5", price: 599, stock: 20, description: "Portable abordable pour un usage quotidien." },
  { brand: "Lenovo", model: "Legion 5", price: 1299, stock: 7, description: "Portable gaming avec carte graphique dédiée." },
  { brand: "Acer", model: "Aspire 5", price: 549, stock: 18, description: "Portable d'entrée de gamme au bon rapport qualité-prix." },
  { brand: "Acer", model: "Swift Go 14", price: 799, stock: 9, description: "Ultraportable de 14 pouces avec écran OLED." },
];

const check = await fetch(`${PB_URL}/api/collections/laptops/records?perPage=1`);
if (!check.ok) {
  console.error("Impossible de lire la collection :", await check.text());
  process.exit(1);
}
const { totalItems } = await check.json();
if (totalItems > 0) {
  console.log(`La collection contient déjà ${totalItems} laptops. Rien à faire.`);
  process.exit(0);
}

for (const laptop of laptops) {
  const res = await fetch(`${PB_URL}/api/collections/laptops/records`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(laptop),
  });
  if (!res.ok) {
    console.error(`Échec pour ${laptop.model} :`, await res.text());
    process.exit(1);
  }
  console.log(`Ajouté : ${laptop.brand} ${laptop.model}`);
}
console.log("Terminé : 10 laptops créés.");