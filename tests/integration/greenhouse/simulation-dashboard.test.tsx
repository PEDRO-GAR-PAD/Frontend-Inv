import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AppRoutes } from "../../../src/app/routes/authRoutes";

describe("SimulationDashboardPage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    window.localStorage.setItem(
      "frontreact.simulation.session",
      JSON.stringify({ sessionId: "s1", greenhouseId: "g1", cropId: "c1" })
    );
  });

  it("renders simulation summary", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          sessionId: "s1",
          activeActuatorCount: 2,
          activeClimateEventCount: 1,
          greenhouseName: "Invernadero Uno",
          selectedCropName: "Lechuga",
          lastUpdatedAt: new Date().toISOString()
        }),
        { status: 200 }
      )
    );

    render(
      <MemoryRouter initialEntries={["/simulacion/dashboard"]}>
        <AppRoutes />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Invernadero Uno/)).toBeInTheDocument();
      expect(screen.getByText(/Actuadores activos:/)).toBeInTheDocument();
      expect(screen.getByText(/Eventos activos:/)).toBeInTheDocument();
    });
  });
});
