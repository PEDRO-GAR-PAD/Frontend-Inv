import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AppRoutes } from "../../../src/app/routes/authRoutes";
import { saveSimulationSession } from "../../../src/features/greenhouse/model/simulationSession.store";
import { saveUserSession } from "../../../src/features/greenhouse/model/session.store";

describe("SimulationDashboardPage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    window.localStorage.clear();
    saveUserSession({ idUsuario: "u1", correo: "usuario@invernadero.local" });
    saveSimulationSession({
      idSesion: "s1",
      idInvernadero: "g1",
      idCultivo: "c1",
      greenhouseName: "Invernadero Uno",
      cropName: "Lechuga",
      nombresSensor: ["CO2"],
      nombresActuador: []
    });
  });

  it("renders simulation summary", async () => {
    vi.spyOn(global, "fetch").mockImplementation((input) => {
      const url = String(input);

      if (url.includes("/api/simulation/s1/dashboard")) {
        return Promise.resolve(
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
      }

      if (url.includes("/api/simulation/realtime/1")) {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              temperatura: 24.5,
              humedad: 61.2,
              luminosidad: 430,
              co2: 512,
              ventilador: true,
              bomba: false,
              extractor: false,
              luz: true,
              malla: false,
              cultivo: "Lechuga",
              invernadero: "Invernadero Uno"
            }),
            { status: 200 }
          )
        );
      }

      if (url.includes("/api/lecturas")) {
        return Promise.resolve(
          new Response(
            JSON.stringify([
              {
                idLectura: 1,
                valor: 498,
                fechaHora: "2026-06-01T10:00:00",
                invernaderoSensor: { idInvSensor: 3 }
              },
              {
                idLectura: 2,
                valor: 504,
                fechaHora: "2026-06-01T10:00:02",
                invernaderoSensor: { idInvSensor: 3 }
              },
              {
                idLectura: 3,
                valor: 512,
                fechaHora: "2026-06-01T10:00:04",
                invernaderoSensor: { idInvSensor: 3 }
              }
            ]),
            { status: 200 }
          )
        );
      }

      return Promise.reject(new Error(`Unexpected fetch: ${url}`));
    });

    render(
      <MemoryRouter initialEntries={["/simulacion/dashboard"]}>
        <AppRoutes />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Invernadero Uno/)).toBeInTheDocument();
      expect(screen.getByText(/Actuadores activos:/)).toBeInTheDocument();
      expect(screen.getByText(/Eventos activos:/)).toBeInTheDocument();
      expect(screen.getByText(/Historial CO2 en tiempo real/)).toBeInTheDocument();
    });
  });
});
