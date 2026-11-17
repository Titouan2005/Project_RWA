"use client";

import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

export default function StockLineChart({ data }: { data: { brand: string; stock: number }[] }) {
  return (
    <Line
      data={{
        labels: data.map((d) => d.brand),
        datasets: [
          {
            label: "Stock",
            data: data.map((d) => d.stock),
            borderColor: "#dc2626",
            backgroundColor: "#dc2626",
            tension: 0.2,
          },
        ],
      }}
      options={{
        responsive: true,
        scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
      }}
    />
  );
}
