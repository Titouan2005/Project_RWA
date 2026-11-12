"use client";

import dynamic from "next/dynamic";

const StockBarChart = dynamic(() => import("./StockBarChart"), {
  ssr: false,
  loading: () => <p>Chargement du graphique…</p>,
});
const PriceLineChart = dynamic(() => import("./PriceLineChart"), {
  ssr: false,
  loading: () => <p>Chargement du graphique…</p>,
});

type Props = {
  stock: { brand: string; stock: number }[];
  prices: { label: string; price: number }[];
};

export default function AdminCharts({ stock, prices }: Props) {
  return (
    <>
      <div className="card">
        <h2>Stock par marque (Recharts)</h2>
        <StockBarChart data={stock} />
      </div>
      <div className="card">
        <h2>Prix par modèle (Chart.js)</h2>
        <PriceLineChart data={prices} />
      </div>
    </>
  );
}