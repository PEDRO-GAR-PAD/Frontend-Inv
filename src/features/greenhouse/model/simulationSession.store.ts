import type { ReferenciaSesionSimulacion } from "./simulation.types";

const SIMULATION_SESSION_KEY = "frontreact.simulation.session";
// TTL for a saved session on the client before it's considered expired (ms)
const SESSION_TTL_MS = 5 * 60 * 1000; // 5 minutes

function nowIso(): string {
  return new Date().toISOString();
}

export function getSimulationSession(): ReferenciaSesionSimulacion | null {
  if (typeof window === "undefined") return null;
  const rawValue = window.localStorage.getItem(SIMULATION_SESSION_KEY);
  if (!rawValue) return null;

  try {
    const parsed = JSON.parse(rawValue) as Partial<ReferenciaSesionSimulacion>;
    if (!parsed.idSesion || !parsed.idInvernadero || !parsed.idCultivo) {
      return null;
    }

    // If session has no guardadoEn (older client versions) treat it as stale and remove it
    if (!parsed.guardadoEn) {
      try {
        window.localStorage.removeItem(SIMULATION_SESSION_KEY);
      } catch {
        // ignore
      }
      return null;
    }

    // Expire stale client sessions so a crashed/closed tab doesn't block navigation forever
    const saved = Date.parse(parsed.guardadoEn);
    if (!Number.isFinite(saved) || Date.now() - saved > SESSION_TTL_MS) {
      try {
        window.localStorage.removeItem(SIMULATION_SESSION_KEY);
      } catch {
        // ignore
      }
      return null;
    }

    return {
      idSesion: parsed.idSesion,
      idInvernadero: parsed.idInvernadero,
      idCultivo: parsed.idCultivo,
      greenhouseName: parsed.greenhouseName,
      cropName: parsed.cropName,
      nombresSensor: Array.isArray(parsed.nombresSensor) ? parsed.nombresSensor : undefined,
      nombresActuador: Array.isArray(parsed.nombresActuador) ? parsed.nombresActuador : undefined,
      guardadoEn: parsed.guardadoEn
    };
  } catch {
    return null;
  }
}

export function saveSimulationSession(session: ReferenciaSesionSimulacion): void {
  if (typeof window === "undefined") return;
  const toSave: ReferenciaSesionSimulacion = { ...session, guardadoEn: nowIso() };
  window.localStorage.setItem(SIMULATION_SESSION_KEY, JSON.stringify(toSave));
}

export function clearSimulationSession(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SIMULATION_SESSION_KEY);
}
