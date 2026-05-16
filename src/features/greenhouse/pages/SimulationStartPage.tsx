import { FormEvent, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import type { OpcionCultivoSeleccionable, RespuestaEntradaSimulacion } from "../model/simulation.types";
import { getUserSession } from "../model/session.store";
import { clearSimulationSession, getSimulationSession, saveSimulationSession } from "../model/simulationSession.store";
import { listCropsByUser } from "../services/cropApi";
import {
  listGreenhouseActuatorsById,
  listGreenhouseSensorsById,
  listGreenhousesByUser,
  updateGreenhouse
} from "../services/greenhouseApi";
import { startSimulationSession } from "../services/simulationApi";
import "../styles/simulation.css";

function toLocalDateTimeApiValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}

async function loadSelectableCrops(idUsuario: string): Promise<OpcionCultivoSeleccionable[]> {
  const cropData = await listCropsByUser(idUsuario);

  return cropData.map((item) => ({
    idCultivo: item.idCultivo,
    name: item.nombre,
    estadoCultivo: "INACTIVO" as const
  }));
}

function readSessionFromEntry(entryData: RespuestaEntradaSimulacion): { idSesion: string; idInvernadero: string; idCultivo: string } | null {
  const candidate = entryData as unknown as {
    idSesion?: string;
    idInvernadero?: string;
    idCultivo?: string;
    sesion?: { idSesion?: string; idInvernadero?: string; idCultivo?: string };
  };

  const nested = candidate.sesion;
  const idSesion = nested?.idSesion ?? candidate.idSesion;
  const idInvernadero = nested?.idInvernadero ?? candidate.idInvernadero;
  const idCultivo = nested?.idCultivo ?? candidate.idCultivo;

  if (!idSesion || !idInvernadero || !idCultivo) {
    return null;
  }

  return { idSesion, idInvernadero, idCultivo };
}

export function SimulationStartPage() {
  const navigate = useNavigate();
  const session = getUserSession();
  const [searchParams] = useSearchParams();
  const [entry, setEntry] = useState<RespuestaEntradaSimulacion | null>(null);
  const [crops, setCrops] = useState<OpcionCultivoSeleccionable[]>([]);
  const [selectedCropId, setSelectedCropId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEntry() {
      setLoading(true);
      setError("");
      const greenhouseId = searchParams.get("greenhouseId") ?? "";
      const sensorNamesFromQuery = (searchParams.get("sensorNames") ?? "")
        .split(",")
        .map((sensor) => sensor.trim())
        .filter(Boolean);
      const actuatorNamesFromQuery = (searchParams.get("actuatorNames") ?? "")
        .split(",")
        .map((actuator) => actuator.trim())
        .filter(Boolean);

      setEntry({
        pantallaEntrada: "START_SIMULATOR",
        invernadero: {
          idInvernadero: greenhouseId,
          name: searchParams.get("greenhouseName") ?? "Invernadero",
          location: searchParams.get("greenhouseLocation") ?? "Sin ubicacion",
          estadoInvernadero: "INACTIVO",
          sensores: sensorNamesFromQuery,
          actuadores: actuatorNamesFromQuery
        }
      });

      if (!greenhouseId) {
        navigate("/inicio", { replace: true });
        return;
      }

      try {
        const [dbSensors, dbActuators] = await Promise.all([
          listGreenhouseSensorsById(greenhouseId),
          listGreenhouseActuatorsById(greenhouseId)
        ]);

        setEntry((current) =>
          current
            ? {
                ...current,
                invernadero: current.invernadero
                  ? {
                      ...current.invernadero,
                      sensores: dbSensors.length > 0 ? dbSensors : current.invernadero.sensores,
                      actuadores: dbActuators.length > 0 ? dbActuators : current.invernadero.actuadores
                    }
                  : current.invernadero
              }
            : current
        );

        if (!session.idUsuario) {
          setError("Debes iniciar sesion para cargar cosechas.");
          setCrops([]);
          return;
        }

        setCrops(await loadSelectableCrops(session.idUsuario));
      } catch {
        setCrops([]);
        setError("No se pudo cargar la lista de cultivos.");
      } finally {
        setLoading(false);
      }
    }

    void loadEntry();
  }, [navigate, searchParams, session.idUsuario]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedCropId || !entry?.invernadero?.idInvernadero || !entry?.invernadero?.name) {
      setError("Selecciona una cosecha valida antes de iniciar.");
      return;
    }

    if (!session.idUsuario) {
      setError("Debes iniciar sesion para actualizar el estado del invernadero.");
      return;
    }

    const activeSession = getSimulationSession();
    if (activeSession && activeSession.idInvernadero !== entry.invernadero.idInvernadero) {
      try {
        const userGreenhouses = await listGreenhousesByUser(session.idUsuario);
        const sessionGreenhouseExists = userGreenhouses.some((item) => item.idInvernadero === activeSession.idInvernadero);

        if (!sessionGreenhouseExists) {
          // Session points to a deleted/old greenhouse (e.g., after DB cleanup).
          clearSimulationSession();
        } else {
          setError("Ya hay una simulacion activa en otro invernadero. Finalizala antes de iniciar una nueva.");
          return;
        }
      } catch {
        setError("No se pudo validar la simulacion activa. Intenta de nuevo.");
        return;
      }
    }

    try {
      setError("");
      await updateGreenhouse(entry.invernadero.idInvernadero, {
        idUsuario: session.idUsuario,
        nombre: entry.invernadero.name,
        ubicacion: entry.invernadero.location,
        estado: "PRODUCCION"
      });
    } catch (statusError) {
      setError(statusError instanceof Error ? statusError.message : "No se pudo actualizar el estado del invernadero");
      return;
    }

    try {
      const nextSession = await startSimulationSession({
        idInvernadero: entry.invernadero.idInvernadero,
        idCultivo: selectedCropId
      });
      saveSimulationSession({
        ...nextSession,
        nombresSensor: entry.invernadero.sensores,
        nombresActuador: entry.invernadero.actuadores
      });
      navigate("/simulacion/actuadores", { replace: true });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "No se pudo iniciar la simulacion");
    }
  }

  if (loading) {
    return (
      <div className="management-shell" aria-label="Simulacion cargando">
        <header className="management-topbar simulation-topbar">
          <button className="simulation-topbar-back" type="button" onClick={() => navigate("/inicio")}>Retroceder</button>
          <p className="session-email simulation-topbar-email" aria-label="Correo de usuario autenticado">{session.correo}</p>
        </header>

        <main className="management-content">
          <section className="management-page">
            <div className="management-card simulation-card">
              <p>Cargando simulacion...</p>
            </div>
          </section>
        </main>
      </div>
    );
  }

  const canStart = Boolean(selectedCropId && entry?.invernadero?.idInvernadero);

  return (
    <div className="management-shell" aria-label="Simulacion inicio">
      <header className="management-topbar simulation-topbar">
        <button className="simulation-topbar-back" type="button" onClick={() => navigate("/inicio")}>Retroceder</button>
        <p className="session-email simulation-topbar-email" aria-label="Correo de usuario autenticado">{session.correo}</p>
      </header>

      <main className="management-content">
        <section className="management-page">
          <form
            id="simulation-start-form"
            className="management-card simulation-card"
            onSubmit={(event) => void handleSubmit(event)}
          >
            <h1>Iniciar simulacion</h1>
            <p><strong>Invernadero:</strong> {entry?.invernadero?.name ?? "-"}</p>
            <p><strong>Ubicacion:</strong> {entry?.invernadero?.location ?? "-"}</p>
            <p><strong>Estado:</strong> {entry?.invernadero?.estadoInvernadero ?? "INACTIVO"}</p>

            <p><strong>Sensores:</strong> {entry?.invernadero?.sensores.join(", ") || "Sin sensores registrados"}</p>
            <p><strong>Actuadores:</strong> {entry?.invernadero?.actuadores.join(", ") || "Sin actuadores registrados"}</p>

            <label htmlFor="simulation-crop">Cosecha (solo inactivas)</label>
            <select
              id="simulation-crop"
              value={selectedCropId}
              onChange={(event) => setSelectedCropId(event.target.value)}
            >
              <option value="">Selecciona una cosecha</option>
              {crops.map((item) => (
                <option key={item.idCultivo} value={item.idCultivo}>
                  {item.name}
                </option>
              ))}
            </select>
            {crops.length === 0 ? <p className="field-error">No hay cosechas registradas para este usuario.</p> : null}

            <div className="simulation-actions simulation-actions-end">
              <button className="simulation-btn simulation-btn-start" type="submit" disabled={!canStart}>
                Comenzar simulacion
              </button>
            </div>

            {error ? <p className="field-error">{error}</p> : null}
          </form>
        </section>
      </main>
    </div>
  );
}
