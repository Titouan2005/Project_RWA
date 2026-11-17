import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import StockBarChart from "@/components/StockBarChart";
import StockLineChart from "@/components/StockLineChart";

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

const data = [{ brand: "Dell", stock: 38 }, { brand: "Lenovo", stock: 45 }, { brand: "Acer", stock: 27 }];

describe("charts", () => {
  it("C3 StockBarChart passes the stock per brand to Recharts", () => {
    render(<StockBarChart data={data} />);
    expect(JSON.parse(screen.getByTestId("bar").getAttribute("data-json") ?? "[]")).toEqual(data);
  });

  it("C3 StockLineChart passes brands as labels and stock as values to Chart.js", () => {
    render(<StockLineChart data={data} />);
    const chartData = JSON.parse(screen.getByTestId("line").textContent ?? "{}");
    expect(chartData.labels).toEqual(["Dell", "Lenovo", "Acer"]);
    expect(chartData.datasets[0].data).toEqual([38, 45, 27]);
    expect(chartData.datasets[0].label).toBe("Stock");
  });

  it("C3 both charts work with an empty list", () => {
    render(<StockLineChart data={[]} />);
    const chartData = JSON.parse(screen.getByTestId("line").textContent ?? "{}");
    expect(chartData.labels).toEqual([]);
    render(<StockBarChart data={[]} />);
    expect(screen.getByTestId("bar").getAttribute("data-json")).toBe("[]");
  });
});
