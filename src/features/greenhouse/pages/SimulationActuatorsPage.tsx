import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { EstadoActuadorSimulacion } from "../model/simulation.types";
import { clearSimulationSession, getSimulationSession } from "../model/simulationSession.store";
import { listSimulationActuators, toggleSimulationActuator } from "../services/simulationApi";
import "../styles/simulation.css";

const LOCAL_ACTUADORES: EstadoActuadorSimulacion[] = [
  { IdActuador: "VENTILADOR", label: "Ventilador", activo: false, actualizadoEn: "" },
  { IdActuador: "RIEGO", label: "Riego", activo: false, actualizadoEn: "" },
  { IdActuador: "LUZ", label: "Luz", activo: false, actualizadoEn: "" },
  { IdActuador: "EXTRACTORES", label: "Extractores de Aire", activo: false, actualizadoEn: "" },
  { IdActuador: "MALLA", label: "Malla", activo: false, actualizadoEn: "" }
];

function normalizeActuatorLabel(value: string): string {
  return value.trim().toLowerCase();
}

function filterAssignedActuators(items: EstadoActuadorSimulacion[], assignedNames?: string[]): EstadoActuadorSimulacion[] {
  if (!assignedNames || assignedNames.length === 0) {
    return items;
  }

  const assigned = new Set(assignedNames.map(normalizeActuatorLabel));
  return items.filter((item) => assigned.has(normalizeActuatorLabel(item.label)));
}

export function SimulationActuatorsPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<EstadoActuadorSimulacion[]>([]);
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
        const assignedActuadores = session.nombresActuador;
        if (session.idSesion.startsWith("local-")) {
          setItems(filterAssignedActuators(LOCAL_ACTUADORES, assignedActuadores));
          return;
        }

        const data = await listSimulationActuators(session.idSesion);
        setItems(filterAssignedActuators(data, assignedActuadores));
      } catch (loadError) {
        setItems(filterAssignedActuators(LOCAL_ACTUADORES, session.nombresActuador));
        setError(loadError instanceof Error ? loadError.message : "No se pudo cargar actuadores");
      }
    }

    void load();
  }, [navigate]);

  async function handleToggle(item: EstadoActuadorSimulacion) {
    const session = getSimulationSession();
    if (!session) {
      clearSimulationSession();
      navigate("/simulacion/inicio", { replace: true });
      return;
    }

    if (session.idSesion.startsWith("local-")) {
      setItems((current) =>
        current.map((state) =>
          state.IdActuador === item.IdActuador ? { ...state, activo: !state.activo } : state
        )
      );
      setError("");
      return;
    }

    const previous = [...items];
    const optimistic = items.map((state) =>
      state.IdActuador === item.IdActuador ? { ...state, activo: !state.activo } : state
    );
    setItems(optimistic);

    try {
      const updated = await toggleSimulationActuator(session.idSesion, item.IdActuador, !item.activo);
      setItems((current) =>
        current.map((state) => (state.IdActuador === updated.IdActuador ? updated : state))
      );
      setError("");
    } catch (toggleError) {
      setItems(previous);
      setError(toggleError instanceof Error ? toggleError.message : "No se pudo actualizar el actuador");
    }
  }

  return (
    <section className="management-page simulation-actuators-page" aria-label="Simulacion - Actuadores">
      <div className="management-card simulation-card actuators-card">
        <h1>Sistema Modular</h1>

        <div className="actuator-grid">
          {items.map((item) => (
            <div key={item.IdActuador} className="actuator-item">
              <button
                type="button"
                className={item.activo ? "actuator-circle active" : "actuator-circle inactive"}
                onClick={() => void handleToggle(item)}
                aria-label={`Alternar ${item.label}`}
              >
                <span className="actuator-inner-icon" aria-hidden="true" />
              </button>
              <p className="actuator-label">{item.label}</p>
            </div>
          ))}
        </div>

        {error ? <p className="field-error">{error}</p> : null}
      </div>
    </section>
  );
}
