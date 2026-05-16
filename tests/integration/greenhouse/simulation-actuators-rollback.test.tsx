import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { AppRoutes } from "../../../src/app/routes/authRoutes";

describe("SimulationActuators rollback", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    window.localStorage.setItem(
      "frontreact.simulation.session",
      JSON.stringify({ sessionId: "s1", greenhouseId: "g1", cropId: "c1" })
    );
  });

  it("rolls back UI state when toggle fails", async () => {
    const user = userEvent.setup();

    vi.spyOn(global, "fetch").mockImplementation(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("/actuators") && !url.includes("RIEGO")) {
        return new Response(
          JSON.stringify([{ actuatorKey: "RIEGO", label: "Riego", isActive: false, updatedAt: new Date().toISOString() }]),
          { status: 200 }
        );
      }

      return new Response(JSON.stringify({ message: "Fallo de backend" }), { status: 500 });
    });

    render(
      <MemoryRouter initialEntries={["/simulacion/actuadores"]}>
        <AppRoutes />
      </MemoryRouter>
    );

    const button = await screen.findByRole("button", { name: "Riego" });
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Riego" })).toHaveClass("inactive");
      expect(screen.getByText("Fallo de backend")).toBeInTheDocument();
    });
  });
});
