import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AdminPage from "@/app/admin/page";
import NotFound from "@/app/not-found";
import Home from "@/app/page";
import EditProductPage from "@/app/products/[id]/edit/page";
import ProductPage from "@/app/products/[id]/page";
import NewProductPage from "@/app/products/new/page";
import ProductsPage from "@/app/products/page";
import { getHomeContent } from "@/lib/homeContent";
import { getProduct, listProducts } from "@/lib/products";

const nav = vi.hoisted(() => ({
  push: vi.fn(),
  refresh: vi.fn(),
  notFound: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: nav.push, refresh: nav.refresh }),
  notFound: nav.notFound,
}));
vi.mock("@/lib/products", () => ({ listProducts: vi.fn(), getProduct: vi.fn() }));
vi.mock("@/lib/homeContent", () => ({ getHomeContent: vi.fn() }));
vi.mock("@/components/AdminCharts", () => ({
  default: (props: unknown) => <pre data-testid="charts">{JSON.stringify(props)}</pre>,
}));

const dell = { id: "abc", brand: "Dell", model: "XPS 13", price: 1199, description: "Ultraportable", stock: 8 };
const dell2 = { id: "def", brand: "Dell", model: "XPS 15", price: 1799, description: "", stock: 5 };
const acer = { id: "ghi", brand: "Acer", model: "Aspire 5", price: 549, description: "", stock: 18 };
const params = (id: string) => ({ params: Promise.resolve({ id }) });

beforeEach(() => vi.clearAllMocks());

describe("pages", () => {
  it("G1 home: shows the content from Redis", async () => {
    vi.mocked(getHomeContent).mockResolvedValue({
      title: "My title", subtitle: "My subtitle", intro: "Intro",
      features: [{ title: "Catalog", text: "Text" }], footer: "Footer",
    });
    render(await Home());
    expect(screen.getByRole("heading", { level: 1, name: "My title" })).toBeInTheDocument();
    expect(screen.getByText("Catalog")).toBeInTheDocument();
    expect(screen.getByText("Footer")).toBeInTheDocument();
  });

  it("G1 home: message if Redis is unavailable", async () => {
    vi.mocked(getHomeContent).mockResolvedValue(null);
    render(await Home());
    expect(screen.getByText(/Content unavailable/)).toBeInTheDocument();
  });

  it("G1 list: shows each laptop with a link", async () => {
    vi.mocked(listProducts).mockResolvedValue([dell, acer]);
    render(await ProductsPage());
    expect(screen.getByRole("link", { name: /Dell XPS 13/ })).toHaveAttribute("href", "/products/abc");
    expect(screen.getByText(/549 €/)).toBeInTheDocument();
  });

  it("G1 list: works with no product", async () => {
    vi.mocked(listProducts).mockResolvedValue([]);
    render(await ProductsPage());
    expect(screen.getByRole("heading", { name: "Products" })).toBeInTheDocument();
  });

  it("G1 detail: shows the laptop and the edit link", async () => {
    vi.mocked(getProduct).mockResolvedValue(dell);
    render(await ProductPage(params("abc")));
    expect(screen.getByRole("heading", { name: /Dell XPS 13/ })).toBeInTheDocument();
    expect(screen.getByText("Price: 1199 €")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Edit" })).toHaveAttribute("href", "/products/abc/edit");
  });

  it("G1 detail: triggers the 404 page if not found", async () => {
    vi.mocked(getProduct).mockResolvedValue(null);
    await expect(ProductPage(params("zzz"))).rejects.toThrow("NEXT_NOT_FOUND");
  });

  it("G1 edit: pre-fills the form", async () => {
    vi.mocked(getProduct).mockResolvedValue(dell);
    render(await EditProductPage(params("abc")));
    expect(screen.getByRole("heading", { name: "Edit Dell XPS 13" })).toBeInTheDocument();
    expect(screen.getByLabelText(/Brand/)).toHaveValue("Dell");
  });

  it("G1 edit: triggers the 404 page if not found", async () => {
    vi.mocked(getProduct).mockResolvedValue(null);
    await expect(EditProductPage(params("zzz"))).rejects.toThrow("NEXT_NOT_FOUND");
  });

  it("G1 add: shows the empty form", () => {
    render(<NewProductPage />);
    expect(screen.getByRole("heading", { name: "Add a laptop" })).toBeInTheDocument();
  });

  it("G1 admin: passes the statistics to the charts", async () => {
    vi.mocked(listProducts).mockResolvedValue([dell, dell2, acer]);
    render(await AdminPage());
    const props = JSON.parse(screen.getByTestId("charts").textContent ?? "{}");
    expect(props).toEqual({ stock: [{ brand: "Dell", stock: 13 }, { brand: "Acer", stock: 18 }] });
  });

  it("G1 404: shows the message", () => {
    render(<NotFound />);
    expect(screen.getByRole("heading", { name: "Page not found" })).toBeInTheDocument();
  });
});
