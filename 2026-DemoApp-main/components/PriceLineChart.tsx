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

export default function PriceLineChart({ data }: { data: { label: string; price: number }[] }) {
  return (
    <Line
      data={{
        labels: data.map((d) => d.label),
        datasets: [
          {
            label: "Prix (€)",
            data: data.map((d) => d.price),
            borderColor: "#dc2626",
            tension: 0.2,
          },
        ],
      }}
      options={{ responsive: true }}
    />
  );
}