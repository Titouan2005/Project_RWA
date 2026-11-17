// Seeds the "laptops" collection.
// Safe to run several times: a laptop that already exists (same brand + model)
// is updated, a missing one is created. Record ids are kept.
const PB_URL = process.env.PB_URL ?? "http://127.0.0.1:8090";
const RECORDS = `${PB_URL}/api/collections/laptops/records`;

const laptops = [
  { brand: "Dell", model: "XPS 13", price: 1199, stock: 8, description: "Premium 13-inch ultraportable with an InfinityEdge display." },
  { brand: "Dell", model: "XPS 15", price: 1799, stock: 5, description: "15-inch laptop built for creative work and performance." },
  { brand: "Dell", model: "Inspiron 15", price: 649, stock: 15, description: "Versatile laptop for work and study." },
  { brand: "Dell", model: "Latitude 5440", price: 999, stock: 10, description: "Rugged business laptop designed for companies." },
  { brand: "Lenovo", model: "ThinkPad X1 Carbon", price: 1699, stock: 6, description: "Lightweight carbon-fibre ultraportable with a renowned keyboard." },
  { brand: "Lenovo", model: "ThinkPad T14", price: 1099, stock: 12, description: "Reliable and secure 14-inch business laptop." },
  { brand: "Lenovo", model: "IdeaPad 5", price: 599, stock: 20, description: "Affordable laptop for everyday use." },
  { brand: "Lenovo", model: "Legion 5", price: 1299, stock: 7, description: "Gaming laptop with a dedicated graphics card." },
  { brand: "Acer", model: "Aspire 5", price: 549, stock: 18, description: "Entry-level laptop with good value for money." },
  { brand: "Acer", model: "Swift Go 14", price: 799, stock: 9, description: "14-inch ultraportable with an OLED screen." },
];

const list = await fetch(`${RECORDS}?perPage=500`);
if (!list.ok) {
  console.error("Cannot read the collection:", await list.text());
  process.exit(1);
}
const { items } = await list.json();

let created = 0;
let updated = 0;
for (const laptop of laptops) {
  const existing = items.find((r) => r.brand === laptop.brand && r.model === laptop.model);
  const res = await fetch(existing ? `${RECORDS}/${existing.id}` : RECORDS, {
    method: existing ? "PATCH" : "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(laptop),
  });
  if (!res.ok) {
    console.error(`Failed for ${laptop.brand} ${laptop.model}:`, await res.text());
    process.exit(1);
  }
  if (existing) updated++;
  else created++;
  console.log(`${existing ? "Updated" : "Created"}: ${laptop.brand} ${laptop.model}`);
}
console.log(`Done: ${created} created, ${updated} updated.`);
