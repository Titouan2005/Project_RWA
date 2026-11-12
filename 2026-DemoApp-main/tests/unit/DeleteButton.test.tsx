import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import DeleteButton from "@/components/DeleteButton";

const nav = vi.hoisted(() => ({ push: vi.fn(), refresh: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => nav }));

const fetchMock = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal("fetch", fetchMock);
});

describe("DeleteButton", () => {
  it("C2 ne fait rien si l'utilisateur annule", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(false);
    render(<DeleteButton id="abc" />);
    await userEvent.click(screen.getByRole("button", { name: "Supprimer" }));
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("C2 supprime puis redirige vers la liste", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    fetchMock.mockResolvedValue({ ok: true });
    render(<DeleteButton id="abc" />);
    await userEvent.click(screen.getByRole("button", { name: "Supprimer" }));
    await waitFor(() => expect(nav.push).toHaveBeenCalledWith("/products"));
    expect(fetchMock).toHaveBeenCalledWith("/api/products/abc", { method: "DELETE" });
    expect(nav.refresh).toHaveBeenCalled();
  });

  it("C2 affiche une alerte si la suppression échoue", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});
    fetchMock.mockResolvedValue({ ok: false });
    render(<DeleteButton id="abc" />);
    await userEvent.click(screen.getByRole("button", { name: "Supprimer" }));
    await waitFor(() => expect(alertSpy).toHaveBeenCalledWith("Suppression impossible"));
    expect(nav.push).not.toHaveBeenCalled();
  });
});