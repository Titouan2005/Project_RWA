import { getHomeContent } from "@/lib/homeContent";

export const dynamic = "force-dynamic";

export default async function Home() {
  const content = await getHomeContent();

  if (!content) {
    return (
      <section className="page">
        <p>Content unavailable (Redis is not responding or is empty).</p>
      </section>
    );
  }

  return (
    <section className="page">
      <h1>{content.title}</h1>
      <h2>{content.subtitle}</h2>
      <p>{content.intro}</p>
      {content.features.map((f) => (
        <div className="card" key={f.title}>
          <strong>{f.title}</strong>
          <p>{f.text}</p>
        </div>
      ))}
      <footer>{content.footer}</footer>
    </section>
  );
}
