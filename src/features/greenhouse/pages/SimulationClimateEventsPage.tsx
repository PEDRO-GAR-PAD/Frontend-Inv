import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { EstadoEventoClimaticoSimulacion } from "../model/simulation.types";
import { clearSimulationSession, getSimulationSession } from "../model/simulationSession.store";
import { listSimulationClimateEvents, toggleSimulationClimateEvent } from "../services/simulationApi";
import "../styles/simulation.css";

const LOCAL_EVENTS: EstadoEventoClimaticoSimulacion[] = [
  { IdEvento: "VIAJES_SOLARES", label: "Viajes Solares", activo: false, actualizadoEn: "" },
  { IdEvento: "SEQUIA", label: "Sequia", activo: false, actualizadoEn: "" },
  { IdEvento: "LLUVIA", label: "Lluvia", activo: false, actualizadoEn: "" },
  { IdEvento: "VIENTO", label: "Viento", activo: false, actualizadoEn: "" },
  { IdEvento: "PLAGAS", label: "Plagas", activo: false, actualizadoEn: "" }
];

export function SimulationClimateEventsPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<EstadoEventoClimaticoSimulacion[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      const session = getSimulationSession();
      if (!session) {
        navigate("/simulacion/inicio", { replace: true });
        return;
      }

      try {
        setError("");
        if (session.idSesion.startsWith("local-")) {
          setItems(LOCAL_EVENTS);
          return;
        }

        const data = await listSimulationClimateEvents(session.idSesion);
        setItems(data);
      } catch (loadError) {
        setItems(LOCAL_EVENTS);
        setError(loadError instanceof Error ? loadError.message : "No se pudo cargar eventos climaticos");
      }
    }

    void load();
  }, [navigate]);

  async function handleToggle(item: EstadoEventoClimaticoSimulacion) {
    const session = getSimulationSession();
    if (!session) {
      clearSimulationSession();
      navigate("/simulacion/inicio", { replace: true });
      return;
    }

    if (session.idSesion.startsWith("local-")) {
      setItems((current) =>
        current.map((state) =>
          state.IdEvento === item.IdEvento ? { ...state, activo: !state.activo } : state
        )
      );
      setError("");
      return;
    }

    const previous = [...items];
    const optimistic = items.map((state) =>
      state.IdEvento === item.IdEvento ? { ...state, activo: !state.activo } : state
    );
    setItems(optimistic);

    try {
      const updated = await toggleSimulationClimateEvent(session.idSesion, item.IdEvento, !item.activo);
      setItems((current) =>
        current.map((state) => (state.IdEvento === updated.IdEvento ? updated : state))
      );
      setError("");
    } catch (toggleError) {
      setItems(previous);
      setError(toggleError instanceof Error ? toggleError.message : "No se pudo actualizar el evento");
    }
  }

  return (
    <section className="management-page" aria-label="Simulacion - Eventos climaticos">
      <div className="management-card simulation-card">
        <h1>Simulacion - Eventos climaticos</h1>
        <p>Activa o desactiva eventos climaticos de forma individual.</p>

        <div className="simulation-toggle-list">
          {items.map((item) => (
            <button
              key={item.IdEvento}
              type="button"
              className={item.activo ? "sim-toggle active" : "sim-toggle inactive"}
              onClick={() => void handleToggle(item)}
            >
              {item.label}
            </button>
          ))}
        </div>

        {error ? <p className="field-error">{error}</p> : null}
      </div>
    </section>
  );
}
