import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { AppRoutes } from "../../../src/app/routes/authRoutes";

describe("SimulationClimateEvents rollback", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    window.localStorage.setItem(
      "frontreact.simulation.session",
      JSON.stringify({ sessionId: "s1", greenhouseId: "g1", cropId: "c1" })
    );
  });

  it("rolls back event toggle when backend fails", async () => {
    const user = userEvent.setup();

    vi.spyOn(global, "fetch").mockImplementation(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("/climate-events") && !url.includes("LLUVIA")) {
        return new Response(
          JSON.stringify([{ eventKey: "LLUVIA", label: "Lluvia", isActive: false, updatedAt: new Date().toISOString() }]),
          { status: 200 }
        );
      }

      return new Response(JSON.stringify({ message: "Error de clima" }), { status: 500 });
    });

    render(
      <MemoryRouter initialEntries={["/simulacion/eventos"]}>
        <AppRoutes />
      </MemoryRouter>
    );

    const button = await screen.findByRole("button", { name: "Lluvia" });
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Lluvia" })).toHaveClass("inactive");
      expect(screen.getByText("Error de clima")).toBeInTheDocument();
    });
  });
});
