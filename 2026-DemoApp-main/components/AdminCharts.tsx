"use client";

import dynamic from "next/dynamic";

const StockBarChart = dynamic(() => import("./StockBarChart"), {
  ssr: false,
  loading: () => <p>Loading chart…</p>,
});
const StockLineChart = dynamic(() => import("./StockLineChart"), {
  ssr: false,
  loading: () => <p>Loading chart…</p>,
});

type Props = {
  stock: { brand: string; stock: number }[];
};

export default function AdminCharts({ stock }: Props) {
  return (
    <>
      <div className="card">
        <h2>Stock by brand: bar chart (Recharts)</h2>
        <StockBarChart data={stock} />
      </div>
      <div className="card">
        <h2>Stock by brand: line chart (Chart.js)</h2>
        <StockLineChart data={stock} />
      </div>
    </>
  );
}
