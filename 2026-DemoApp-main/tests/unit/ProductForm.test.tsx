import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ProductForm from "@/components/ProductForm";

const nav = vi.hoisted(() => ({ push: vi.fn(), refresh: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => nav }));

const fetchMock = vi.fn();
const product = { id: "abc", brand: "Dell", model: "XPS 13", price: 1199, description: "d", stock: 8 };
const okResponse = (data: unknown) => ({ ok: true, json: async () => data });

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal("fetch", fetchMock);
});

async function fillAndSubmit(brand = "Dell", model = "XPS", price = "1199.99", stock = "8") {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText(/Marque/), brand);
  await user.type(screen.getByLabelText(/Modèle/), model);
  await user.type(screen.getByLabelText(/Prix/), price);
  await user.clear(screen.getByLabelText(/Stock/));
  await user.type(screen.getByLabelText(/Stock/), stock);
  await user.click(screen.getByRole("button"));
}

describe("ProductForm", () => {
  it("C1 affiche un formulaire vide en mode ajout", () => {
    render(<ProductForm />);
    expect(screen.getByRole("button", { name: "Ajouter" })).toBeInTheDocument();
    expect(screen.getByLabelText(/Marque/)).toHaveValue("");
  });

  it("C1 préremplit les champs en mode modification", () => {
    render(<ProductForm product={product} />);
    expect(screen.getByRole("button", { name: "Enregistrer" })).toBeInTheDocument();
    expect(screen.getByLabelText(/Marque/)).toHaveValue("Dell");
    expect(screen.getByLabelText(/Prix/)).toHaveValue(1199);
  });

  it("C1 envoie un POST puis redirige après un ajout", async () => {
    fetchMock.mockResolvedValue(okResponse({ ...product, id: "new1" }));
    render(<ProductForm />);
    await fillAndSubmit();
    await waitFor(() => expect(nav.push).toHaveBeenCalledWith("/products/new1"));
    expect(nav.refresh).toHaveBeenCalled();
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/products");
    expect(options.method).toBe("POST");
    expect(JSON.parse(options.body)).toMatchObject({ brand: "Dell", model: "XPS", price: 1199.99, stock: 8 });
  });

  it("C1 envoie un PUT en mode modification", async () => {
    fetchMock.mockResolvedValue(okResponse(product));
    render(<ProductForm product={product} />);
    await userEvent.click(screen.getByRole("button", { name: "Enregistrer" }));
    await waitFor(() => expect(nav.push).toHaveBeenCalledWith("/products/abc"));
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/products/abc");
    expect(options.method).toBe("PUT");
  });

  it("C1 affiche les erreurs renvoyées par l'API", async () => {
    fetchMock.mockResolvedValue({ ok: false, json: async () => ({ errors: ["brand : trop long"] }) });
    render(<ProductForm />);
    await fillAndSubmit();
    expect(await screen.findByText("brand : trop long")).toBeInTheDocument();
    expect(screen.getByRole("button")).not.toBeDisabled();
    expect(nav.push).not.toHaveBeenCalled();
  });

  it("C1 affiche l'erreur simple de l'API", async () => {
    fetchMock.mockResolvedValue({ ok: false, json: async () => ({ error: "Erreur serveur" }) });
    render(<ProductForm />);
    await fillAndSubmit();
    expect(await screen.findByText("Erreur serveur")).toBeInTheDocument();
  });

  it("C1 affiche Erreur si la réponse n'est pas du JSON", async () => {
    fetchMock.mockResolvedValue({ ok: false, json: async () => { throw new Error("pas json"); } });
    render(<ProductForm />);
    await fillAndSubmit();
    expect(await screen.findByText("Erreur")).toBeInTheDocument();
  });

  it.each(["%", "*", "_", "<script>alert(1)</script>", "😀💻", "' OR 1=1 --", "日本語"])(
    "C1 transmet tel quel le texte étrange %j",
    async (weird) => {
      fetchMock.mockResolvedValue(okResponse(product));
      render(<ProductForm />);
      fireEvent.change(screen.getByLabelText(/Marque/), { target: { value: weird } });
      fireEvent.change(screen.getByLabelText(/Modèle/), { target: { value: weird } });
      fireEvent.change(screen.getByLabelText(/Prix/), { target: { value: "10" } });
      fireEvent.change(screen.getByLabelText(/Stock/), { target: { value: "1" } });
      fireEvent.click(screen.getByRole("button"));
      await waitFor(() => expect(fetchMock).toHaveBeenCalled());
      expect(JSON.parse(fetchMock.mock.calls[0][1].body).brand).toBe(weird);
    }
  );
});