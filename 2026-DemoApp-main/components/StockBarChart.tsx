"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export default function StockBarChart({ data }: { data: { brand: string; stock: number }[] }) {
  return (
    <div style={{ width: "100%", height: 300 }}>
      <ResponsiveContainer>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="brand" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="stock" fill="#2563eb" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}