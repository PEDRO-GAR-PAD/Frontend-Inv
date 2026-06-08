import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { EstadoActuadorSimulacion, SimulationRealtimeDTO } from "../model/simulation.types";
import { clearSimulationSession, getSimulationSession } from "../model/simulationSession.store";
import { listSimulationActuators, toggleSimulationActuator } from "../services/simulationApi";
import { getRealtimeSimulation } from "../services/simulationApi";
import { connectWebSocket } from "../services/websocket";
import "../styles/simulation.css";

const LOCAL_ACTUADORES: EstadoActuadorSimulacion[] = [
  { IdActuador: 1 , label: "VENTILADOR", activo: false, actualizadoEn: "" },
  { IdActuador: 2 , label: "RIEGO", activo: false, actualizadoEn: "" },
  { IdActuador: 3 , label: "LUZ", activo: false, actualizadoEn: "" },
  { IdActuador: 4 , label: "EXTRACTORES DE AIRE", activo: false, actualizadoEn: "" },
  { IdActuador: 5 , label: "MALLA", activo: false, actualizadoEn: "" }
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

function getRealtimeActuatorState(item: EstadoActuadorSimulacion, realtime: Partial<SimulationRealtimeDTO>): boolean {
  const key = `${item.IdActuador} ${item.label}`.toLowerCase();

  if (key.includes("VENTILADOR")) {
    return Boolean(realtime.ventilador);
  }

  if (key.includes("RIEGO") || key.includes("BOMBA")) {
    return Boolean(realtime.bomba);
  }

  if (key.includes("LUZ")) {
    return Boolean(realtime.luz);
  }

  if (key.includes("EXTRACTORES DE AIRE")) {
    return Boolean(realtime.extractor);
  }

  if (key.includes("MALLA")) {
    return Boolean(realtime.malla);
  }

  return item.activo;
}

function applyRealtimeActuatorState(
  items: EstadoActuadorSimulacion[],
  realtime: Partial<SimulationRealtimeDTO>
): EstadoActuadorSimulacion[] {
  const actualizadoEn = new Date().toISOString();

  return items.map((item) => ({
    ...item,
    activo: getRealtimeActuatorState(item, realtime),
    actualizadoEn
  }));
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

  useEffect(() => {
    const session = getSimulationSession();
    if (!session || session.idSesion.startsWith("local-")) {
      return undefined;
    }

    const greenhouseId = session.idInvernadero;

    const disconnect = connectWebSocket(
  greenhouseId,
  (payload) => {

    console.log(
      "WEBSOCKET PAYLOAD",
      payload
    );

    setItems((current) =>
      applyRealtimeActuatorState(current, payload)
    );
  }
);

    async function actualizarEstados() {
      try {
        const realtime = await getRealtimeSimulation(greenhouseId);
        console.log("REALTIME", realtime);
        setItems((current) => applyRealtimeActuatorState(current, realtime));
      } catch (realtimeError) {
        console.error("Error actualizando actuadores", realtimeError);
      }
    }

    void actualizarEstados();
    const interval = setInterval(actualizarEstados, 2000);

    return () => {
      clearInterval(interval);
      disconnect();
    };
  }, []);
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
                aria-label={item.label}
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
