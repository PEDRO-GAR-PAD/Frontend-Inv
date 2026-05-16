import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { AppRoutes } from "../../../src/app/routes/authRoutes";

describe("Simulation menu navigation", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    window.localStorage.setItem(
      "frontreact.simulation.session",
      JSON.stringify({ sessionId: "s1", greenhouseId: "g1", cropId: "c1" })
    );

    vi.spyOn(global, "fetch").mockImplementation(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("/dashboard")) {
        return new Response(
          JSON.stringify({
            sessionId: "s1",
            activeActuatorCount: 0,
            activeClimateEventCount: 0,
            greenhouseName: "Invernadero Uno",
            selectedCropName: "Lechuga",
            lastUpdatedAt: new Date().toISOString()
          }),
          { status: 200 }
        );
      }
      if (url.includes("/actuators")) {
        return new Response(JSON.stringify([]), { status: 200 });
      }
      return new Response(JSON.stringify([]), { status: 200 });
    });
  });

  it("navigates from dashboard menu to actuators and events", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={["/simulacion/dashboard"]}>
        <AppRoutes />
      </MemoryRouter>
    );

    await user.click(await screen.findByRole("button", { name: "Ir a actuadores" }));
    expect(await screen.findByRole("heading", { name: "Simulacion - Actuadores" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Ir a eventos climaticos" }));
    expect(await screen.findByRole("heading", { name: "Simulacion - Eventos climaticos" })).toBeInTheDocument();
  });
});
