import type {
  EstadoActuadorSimulacion,
  EstadoEventoClimaticoSimulacion,
  OpcionCultivoSeleccionable,
  ReferenciaSesionSimulacion,
  RespuestaEntradaSimulacion
} from "../model/simulation.types";
import { getUserSession } from "../model/session.store";

const API_BASE_URL =
  (import.meta as ImportMeta & { env?: Record<string, string> }).env?.VITE_API_BASE_URL ??
  "http://localhost:8080";

interface ApiErrorPayload {
  message?: string;
}

function buildAuthHeaders(): Record<string, string> {
  const session = getUserSession();
  const headers: Record<string, string> = {};

  if (session.idUsuario) {
    headers["X-User-Id"] = session.idUsuario;
  }

  if (session.token) {
    headers.Authorization = `Bearer ${session.token}`;
  }

  return headers;
}

export async function parseSimulationApiError(response: Response): Promise<string> {
  try {
    const payload = (await response.json()) as ApiErrorPayload;
    return payload.message || "Error inesperado en simulacion";
  } catch {
    return "No fue posible procesar la respuesta del servidor de simulacion";
  }
}

export async function getSimulationEntry(greenhouseId?: string): Promise<RespuestaEntradaSimulacion> {
  const query = greenhouseId ? `?greenhouseId=${encodeURIComponent(greenhouseId)}` : "";
  const response = await fetch(`${API_BASE_URL}/api/simulation/entry${query}`, {
    headers: buildAuthHeaders(),
    credentials: "include"
  });

  if (!response.ok) {
    throw new Error(await parseSimulationApiError(response));
  }

  return (await response.json()) as RespuestaEntradaSimulacion;
}

export async function getSimulationCrops(): Promise<OpcionCultivoSeleccionable[]> {
  const response = await fetch(`${API_BASE_URL}/api/simulation/crops`, {
    headers: buildAuthHeaders(),
    credentials: "include"
  });

  if (!response.ok) {
    throw new Error(await parseSimulationApiError(response));
  }

  return (await response.json()) as OpcionCultivoSeleccionable[];
}

export async function startSimulationSession(payload: {
  idInvernadero: string;
  idCultivo: string;
}): Promise<ReferenciaSesionSimulacion> {
  const response = await fetch(`${API_BASE_URL}/api/simulation/sessions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...buildAuthHeaders() },
    credentials: "include",
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(await parseSimulationApiError(response));
  }

  return (await response.json()) as ReferenciaSesionSimulacion;
}

export async function listSimulationActuators(sessionId: string): Promise<EstadoActuadorSimulacion[]> {
  const response = await fetch(`${API_BASE_URL}/api/simulation/${encodeURIComponent(sessionId)}/actuators`, {
    headers: buildAuthHeaders(),
    credentials: "include"
  });

  if (!response.ok) {
    throw new Error(await parseSimulationApiError(response));
  }

  return (await response.json()) as EstadoActuadorSimulacion[];
}

export async function toggleSimulationActuator(
  sessionId: string,
  actuatorKey: string,
  isActive: boolean
): Promise<EstadoActuadorSimulacion> {
  const response = await fetch(
    `${API_BASE_URL}/api/simulation/${encodeURIComponent(sessionId)}/actuators/${encodeURIComponent(actuatorKey)}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...buildAuthHeaders() },
      credentials: "include",
      body: JSON.stringify({ isActive })
    }
  );

  if (!response.ok) {
    throw new Error(await parseSimulationApiError(response));
  }

  return (await response.json()) as EstadoActuadorSimulacion;
}

export async function listSimulationClimateEvents(sessionId: string): Promise<EstadoEventoClimaticoSimulacion[]> {
  const response = await fetch(`${API_BASE_URL}/api/simulation/${encodeURIComponent(sessionId)}/climate-events`, {
    headers: buildAuthHeaders(),
    credentials: "include"
  });

  if (!response.ok) {
    throw new Error(await parseSimulationApiError(response));
  }

  return (await response.json()) as EstadoEventoClimaticoSimulacion[];
}

export async function toggleSimulationClimateEvent(
  sessionId: string,
  eventKey: string,
  isActive: boolean
): Promise<EstadoEventoClimaticoSimulacion> {
  const response = await fetch(
    `${API_BASE_URL}/api/simulation/${encodeURIComponent(sessionId)}/climate-events/${encodeURIComponent(eventKey)}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...buildAuthHeaders() },
      credentials: "include",
      body: JSON.stringify({ isActive })
    }
  );

  if (!response.ok) {
    throw new Error(await parseSimulationApiError(response));
  }

  return (await response.json()) as EstadoEventoClimaticoSimulacion;
}

export interface SimulationDashboardSummary {
  sessionId: string;
  activeActuatorCount: number;
  activeClimateEventCount: number;
  greenhouseName: string;
  selectedCropName: string;
  lastUpdatedAt: string;
}

export async function getSimulationDashboard(sessionId: string): Promise<SimulationDashboardSummary> {
  const response = await fetch(`${API_BASE_URL}/api/simulation/${encodeURIComponent(sessionId)}/dashboard`, {
    headers: buildAuthHeaders(),
    credentials: "include"
  });

  if (!response.ok) {
    throw new Error(await parseSimulationApiError(response));
  }

  return (await response.json()) as SimulationDashboardSummary;
}

export async function exitSimulationSession(sessionId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/simulation/${encodeURIComponent(sessionId)}/exit`, {
    method: "POST",
    headers: buildAuthHeaders(),
    credentials: "include"
  });

  if (!response.ok) {
    throw new Error(await parseSimulationApiError(response));
  }
}
