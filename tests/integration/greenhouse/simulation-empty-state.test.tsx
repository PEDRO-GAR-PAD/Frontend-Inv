import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AppRoutes } from "../../../src/app/routes/authRoutes";

describe("Simulation empty state", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("shows empty state when no greenhouse is available", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ entryScreen: "EMPTY", greenhouse: null }), { status: 200 })
    );

    render(
      <MemoryRouter initialEntries={["/simulacion/inicio"]}>
        <AppRoutes />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "No hay invernaderos disponibles" })).toBeInTheDocument();
    });
  });
});
