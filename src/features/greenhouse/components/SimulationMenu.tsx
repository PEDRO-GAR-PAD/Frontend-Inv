import { useNavigate } from "react-router-dom";
import { clearSimulationSession, getSimulationSession } from "../model/simulationSession.store";

export function SimulationMenu() {
  const navigate = useNavigate();

  async function handleExit() {
    const session = getSimulationSession();
    // Only clear local view lock; do not finalize backend simulation here
    if (session) {
      try {
        // no backend call here
      } catch {
        // ignore
      }
    }

    clearSimulationSession();
    navigate("/inicio");
  }

  return (
    <nav className="simulation-menu" aria-label="Menu de simulacion">
      <button type="button" aria-label="Ir a actuadores" onClick={() => navigate("/simulacion/actuadores")}>Actuadores</button>
      <button type="button" aria-label="Ir a eventos climaticos" onClick={() => navigate("/simulacion/eventos")}>Eventos climaticos</button>
      <button type="button" aria-label="Ir a dashboard" onClick={() => navigate("/simulacion/dashboard")}>Dashboard</button>
      <button type="button" aria-label="Salir del invernadero" className="exit-button" onClick={() => void handleExit()}>
        Salir del invernadero
      </button>
    </nav>
  );
}
