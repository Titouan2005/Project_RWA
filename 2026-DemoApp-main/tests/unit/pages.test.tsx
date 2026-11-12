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
  it("G1 accueil : affiche le contenu venant de Redis", async () => {
    vi.mocked(getHomeContent).mockResolvedValue({
      title: "Mon titre", subtitle: "Mon sous-titre", intro: "Intro",
      features: [{ title: "Catalogue", text: "Texte" }], footer: "Pied",
    });
    render(await Home());
    expect(screen.getByRole("heading", { level: 1, name: "Mon titre" })).toBeInTheDocument();
    expect(screen.getByText("Catalogue")).toBeInTheDocument();
    expect(screen.getByText("Pied")).toBeInTheDocument();
  });

  it("G1 accueil : message si Redis est indisponible", async () => {
    vi.mocked(getHomeContent).mockResolvedValue(null);
    render(await Home());
    expect(screen.getByText(/Contenu indisponible/)).toBeInTheDocument();
  });

  it("G1 liste : affiche chaque laptop avec un lien", async () => {
    vi.mocked(listProducts).mockResolvedValue([dell, acer]);
    render(await ProductsPage());
    expect(screen.getByRole("link", { name: /Dell XPS 13/ })).toHaveAttribute("href", "/products/abc");
    expect(screen.getByText(/549 €/)).toBeInTheDocument();
  });

  it("G1 liste : fonctionne sans produit", async () => {
    vi.mocked(listProducts).mockResolvedValue([]);
    render(await ProductsPage());
    expect(screen.getByRole("heading", { name: "Produits" })).toBeInTheDocument();
  });

  it("G1 détail : affiche le laptop et le lien de modification", async () => {
    vi.mocked(getProduct).mockResolvedValue(dell);
    render(await ProductPage(params("abc")));
    expect(screen.getByRole("heading", { name: /Dell XPS 13/ })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Modifier" })).toHaveAttribute("href", "/products/abc/edit");
  });

  it("G1 détail : déclenche la page 404 si introuvable", async () => {
    vi.mocked(getProduct).mockResolvedValue(null);
    await expect(ProductPage(params("zzz"))).rejects.toThrow("NEXT_NOT_FOUND");
  });

  it("G1 modification : préremplit le formulaire", async () => {
    vi.mocked(getProduct).mockResolvedValue(dell);
    render(await EditProductPage(params("abc")));
    expect(screen.getByLabelText(/Marque/)).toHaveValue("Dell");
  });

  it("G1 modification : déclenche la page 404 si introuvable", async () => {
    vi.mocked(getProduct).mockResolvedValue(null);
    await expect(EditProductPage(params("zzz"))).rejects.toThrow("NEXT_NOT_FOUND");
  });

  it("G1 ajout : affiche le formulaire vide", () => {
    render(<NewProductPage />);
    expect(screen.getByRole("heading", { name: "Ajouter un laptop" })).toBeInTheDocument();
  });

  it("G1 admin : transmet les statistiques aux graphiques", async () => {
    vi.mocked(listProducts).mockResolvedValue([dell, dell2, acer]);
    render(await AdminPage());
    const props = JSON.parse(screen.getByTestId("charts").textContent ?? "{}");
    expect(props.stock).toEqual([{ brand: "Dell", stock: 13 }, { brand: "Acer", stock: 18 }]);
    expect(props.prices[0]).toEqual({ label: "Acer Aspire 5", price: 549 });
  });

  it("G1 404 : affiche le message", () => {
    render(<NotFound />);
    expect(screen.getByRole("heading", { name: "Page introuvable" })).toBeInTheDocument();
  });
});