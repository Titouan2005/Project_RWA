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
  it("C2 does nothing if the user cancels", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(false);
    render(<DeleteButton id="abc" />);
    await userEvent.click(screen.getByRole("button", { name: "Delete" }));
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("C2 deletes then redirects to the list", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    fetchMock.mockResolvedValue({ ok: true });
    render(<DeleteButton id="abc" />);
    await userEvent.click(screen.getByRole("button", { name: "Delete" }));
    await waitFor(() => expect(nav.push).toHaveBeenCalledWith("/products"));
    expect(fetchMock).toHaveBeenCalledWith("/api/products/abc", { method: "DELETE" });
    expect(nav.refresh).toHaveBeenCalled();
  });

  it("C2 shows an alert if the deletion fails", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});
    fetchMock.mockResolvedValue({ ok: false });
    render(<DeleteButton id="abc" />);
    await userEvent.click(screen.getByRole("button", { name: "Delete" }));
    await waitFor(() => expect(alertSpy).toHaveBeenCalledWith("Could not delete the laptop"));
    expect(nav.push).not.toHaveBeenCalled();
  });
});
