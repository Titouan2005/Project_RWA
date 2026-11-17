import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import PriceLineChart from "@/components/PriceLineChart";
import StockBarChart from "@/components/StockBarChart";

vi.mock("react-chartjs-2", () => ({
  Line: (props: { data: unknown }) => <pre data-testid="line">{JSON.stringify(props.data)}</pre>,
}));
vi.mock("chart.js", () => ({
  Chart: { register: vi.fn() },
  CategoryScale: {}, LinearScale: {}, PointElement: {}, LineElement: {}, Tooltip: {}, Legend: {},
}));
vi.mock("recharts", () => {
  const Pass = ({ children }: { children?: React.ReactNode }) => <div>{children}</div>;
  return {
    ResponsiveContainer: Pass, XAxis: Pass, YAxis: Pass, CartesianGrid: Pass, Tooltip: Pass, Bar: Pass,
    BarChart: ({ data, children }: { data: unknown; children?: React.ReactNode }) => (
      <div data-testid="bar" data-json={JSON.stringify(data)}>{children}</div>
    ),
  };
});

describe("charts", () => {
  it("C3 PriceLineChart passes labels and prices to Chart.js", () => {
    render(<PriceLineChart data={[{ label: "Acer Aspire", price: 549 }, { label: "Dell XPS", price: 1199 }]} />);
    const chartData = JSON.parse(screen.getByTestId("line").textContent ?? "{}");
    expect(chartData.labels).toEqual(["Acer Aspire", "Dell XPS"]);
    expect(chartData.datasets[0].data).toEqual([549, 1199]);
    expect(chartData.datasets[0].label).toBe("Price (€)");
  });

  it("C3 StockBarChart passes the data to Recharts", () => {
    const data = [{ brand: "Dell", stock: 13 }];
    render(<StockBarChart data={data} />);
    expect(JSON.parse(screen.getByTestId("bar").getAttribute("data-json") ?? "[]")).toEqual(data);
  });
});
