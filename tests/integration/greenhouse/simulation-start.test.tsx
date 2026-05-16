import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { AppRoutes } from "../../../src/app/routes/authRoutes";
import { saveUserSession } from "../../../src/features/greenhouse/model/session.store";

describe("SimulationStartPage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    window.localStorage.clear();
    saveUserSession({ id: "u1", email: "usuario@invernadero.local" });
  });

  it("loads start screen and allows selecting inactive crops", async () => {
    const user = userEvent.setup();

    vi.spyOn(global, "fetch").mockImplementation(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      const method = init?.method ?? "GET";

      if (url.includes("/api/simulation/entry")) {
        return new Response(
          JSON.stringify({
            entryScreen: "START_SIMULATOR",
            greenhouse: {
              greenhouseId: "g1",
              name: "Invernadero Uno",
              location: "Sector 1",
              greenhouseStatus: "AVAILABLE",
              sensors: [],
              actuators: []
            }
          }),
          { status: 200 }
        );
      }

      if (url.includes("/api/simulation/crops")) {
        return new Response(JSON.stringify({ message: "Unavailable" }), { status: 500 });
      }

      if (url.includes("/api/crops?")) {
        return new Response(
          JSON.stringify([
            {
              id: "c1",
              userId: "u1",
              name: "Lechuga",
              minTemperature: 0,
              maxTemperature: 0,
              minHumidity: 0,
              maxHumidity: 0,
              minSoilMoisture: 0,
              maxSoilMoisture: 0,
              createdAt: "2026-05-04T10:00:00Z",
              updatedAt: "2026-05-04T10:00:00Z"
            },
            {
              id: "c2",
              userId: "u1",
              name: "Tomate",
              minTemperature: 0,
              maxTemperature: 0,
              minHumidity: 0,
              maxHumidity: 0,
              minSoilMoisture: 0,
              maxSoilMoisture: 0,
              createdAt: "2026-05-04T10:00:00Z",
              updatedAt: "2026-05-04T10:00:00Z"
            }
          ]),
          { status: 200 }
        );
      }

      if (url.includes("/api/plantings?") && url.includes("status=ALL")) {
        return new Response(
          JSON.stringify([
            {
              id: "p1",
              userId: "u1",
              greenhouseId: "g1",
              greenhouseName: "Invernadero Uno",
              cropId: "c2",
              cropName: "Tomate",
              plantedAt: "2026-05-04T10:00:00Z",
              finishedAt: null,
              status: "ACTIVE",
              createdAt: "2026-05-04T10:00:00Z",
              updatedAt: "2026-05-04T10:00:00Z"
            }
          ]),
          { status: 200 }
        );
      }

      if (url.includes("/api/plantings?") && url.includes("status=ACTIVE")) {
        return new Response(
          JSON.stringify([
            {
              id: "p1",
              userId: "u1",
              greenhouseId: "g1",
              greenhouseName: "Invernadero Uno",
              cropId: "c2",
              cropName: "Tomate",
              plantedAt: "2026-05-04T10:00:00Z",
              finishedAt: null,
              status: "ACTIVE",
              createdAt: "2026-05-04T10:00:00Z",
              updatedAt: "2026-05-04T10:00:00Z"
            }
          ]),
          { status: 200 }
        );
      }

      if (url.includes("/api/greenhouses/g1") && method === "PUT") {
        return new Response(
          JSON.stringify({
            id: "g1",
            userId: "u1",
            name: "Invernadero Uno",
            location: "Sector 1",
            status: "PRODUCTION",
            sensorIds: [],
            sensorNames: [],
            actuatorIds: [],
            actuatorNames: [],
            createdAt: "2026-05-04T10:00:00Z",
            updatedAt: "2026-05-04T10:00:00Z"
          }),
          { status: 200 }
        );
      }

      if (url.endsWith("/api/plantings") && method === "POST") {
        return new Response(
          JSON.stringify({
            id: "p2",
            userId: "u1",
            greenhouseId: "g1",
            greenhouseName: "Invernadero Uno",
            cropId: "c1",
            cropName: "Lechuga",
            plantedAt: "2026-05-04T10:00:00Z",
            finishedAt: null,
            status: "ACTIVE",
            createdAt: "2026-05-04T10:00:00Z",
            updatedAt: "2026-05-04T10:00:00Z"
          }),
          { status: 201 }
        );
      }

      if (url.includes("/api/simulation/sessions")) {
        return new Response(JSON.stringify({ sessionId: "s1", greenhouseId: "g1", cropId: "c1" }), {
          status: 201
        });
      }

      if (url.includes("/api/simulation/s1/actuators")) {
        return new Response(
          JSON.stringify([
            { actuatorKey: "VENTILADOR", label: "Ventilador", isActive: false, updatedAt: "2026-05-04T10:00:00Z" },
            { actuatorKey: "RIEGO", label: "Riego", isActive: false, updatedAt: "2026-05-04T10:00:00Z" }
          ]),
          { status: 200 }
        );
      }

      return new Response(JSON.stringify({ message: "Not found" }), { status: 404 });
    });

    render(
      <MemoryRouter initialEntries={["/simulacion/inicio?greenhouseId=g1&greenhouseName=Invernadero%20Uno&greenhouseLocation=Sector%201"]}>
        <AppRoutes />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Iniciar simulacion" })).toBeInTheDocument();
    });

    expect(screen.getByText(/Invernadero Uno/)).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: "Tomate" })).not.toBeInTheDocument();

    const cropSelect = screen.getByLabelText("Cosecha (solo inactivas)");
    await user.selectOptions(cropSelect, "c1");
    await user.click(screen.getByRole("button", { name: "Comenzar simulacion" }));

    await waitFor(() => {
      expect(screen.getByLabelText("Simulacion - Actuadores")).toBeInTheDocument();
    });
  });
});
