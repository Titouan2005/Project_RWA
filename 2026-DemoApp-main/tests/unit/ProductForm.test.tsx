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
  await user.type(screen.getByLabelText(/Brand/), brand);
  await user.type(screen.getByLabelText(/Model/), model);
  await user.type(screen.getByLabelText(/Price/), price);
  await user.clear(screen.getByLabelText(/Stock/));
  await user.type(screen.getByLabelText(/Stock/), stock);
  await user.click(screen.getByRole("button"));
}

describe("ProductForm", () => {
  it("C1 shows an empty form in add mode", () => {
    render(<ProductForm />);
    expect(screen.getByRole("button", { name: "Add" })).toBeInTheDocument();
    expect(screen.getByLabelText(/Brand/)).toHaveValue("");
  });

  it("C1 pre-fills the fields in edit mode", () => {
    render(<ProductForm product={product} />);
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
    expect(screen.getByLabelText(/Brand/)).toHaveValue("Dell");
    expect(screen.getByLabelText(/Price/)).toHaveValue(1199);
  });

  it("C1 sends a POST then redirects after adding", async () => {
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

  it("C1 sends a PUT in edit mode", async () => {
    fetchMock.mockResolvedValue(okResponse(product));
    render(<ProductForm product={product} />);
    await userEvent.click(screen.getByRole("button", { name: "Save" }));
    await waitFor(() => expect(nav.push).toHaveBeenCalledWith("/products/abc"));
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/products/abc");
    expect(options.method).toBe("PUT");
  });

  it("C1 shows the errors returned by the API", async () => {
    fetchMock.mockResolvedValue({ ok: false, json: async () => ({ errors: ["brand: too long"] }) });
    render(<ProductForm />);
    await fillAndSubmit();
    expect(await screen.findByText("brand: too long")).toBeInTheDocument();
    expect(screen.getByRole("button")).not.toBeDisabled();
    expect(nav.push).not.toHaveBeenCalled();
  });

  it("C1 shows the single error from the API", async () => {
    fetchMock.mockResolvedValue({ ok: false, json: async () => ({ error: "Server error" }) });
    render(<ProductForm />);
    await fillAndSubmit();
    expect(await screen.findByText("Server error")).toBeInTheDocument();
  });

  it("C1 shows Error if the response is not JSON", async () => {
    fetchMock.mockResolvedValue({ ok: false, json: async () => { throw new Error("not json"); } });
    render(<ProductForm />);
    await fillAndSubmit();
    expect(await screen.findByText("Error")).toBeInTheDocument();
  });

  it.each(["%", "*", "_", "<script>alert(1)</script>", "😀💻", "' OR 1=1 --", "日本語"])(
    "C1 sends the strange text %j unchanged",
    async (weird) => {
      fetchMock.mockResolvedValue(okResponse(product));
      render(<ProductForm />);
      fireEvent.change(screen.getByLabelText(/Brand/), { target: { value: weird } });
      fireEvent.change(screen.getByLabelText(/Model/), { target: { value: weird } });
      fireEvent.change(screen.getByLabelText(/Price/), { target: { value: "10" } });
      fireEvent.change(screen.getByLabelText(/Stock/), { target: { value: "1" } });
      fireEvent.click(screen.getByRole("button"));
      await waitFor(() => expect(fetchMock).toHaveBeenCalled());
      expect(JSON.parse(fetchMock.mock.calls[0][1].body).brand).toBe(weird);
    }
  );
});
