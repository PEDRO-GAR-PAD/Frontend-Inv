import type {
  CargaUtilPlantacionApi,
  FiltroEstadoPlantacion,
  RespuestaPlantacionApi
} from "../model/planting.types";
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

async function parseApiError(response: Response): Promise<string> {
  try {
    const payload = (await response.json()) as ApiErrorPayload;
    return payload.message || "Error inesperado de API";
  } catch {
    return "No fue posible procesar la respuesta del servidor";
  }
}

export async function listPlantingsByUser(
  idUsuario: string,
  estado: FiltroEstadoPlantacion = "ACTIVA"
): Promise<RespuestaPlantacionApi[]> {
  const query = new URLSearchParams({ userId: idUsuario, status: estado === "TODAS" ? "" : estado });
  const response = await fetch(`${API_BASE_URL}/api/plantings?${query.toString()}`, {
    headers: buildAuthHeaders(),
    cache: "no-store",
    credentials: "include"
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  return (await response.json()) as RespuestaPlantacionApi[];
}

export async function createPlanting(payload: CargaUtilPlantacionApi): Promise<RespuestaPlantacionApi> {
  const response = await fetch(`${API_BASE_URL}/api/plantings`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...buildAuthHeaders() },
    credentials: "include",
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  return (await response.json()) as RespuestaPlantacionApi;
}

export async function updatePlanting(id: string, payload: CargaUtilPlantacionApi): Promise<RespuestaPlantacionApi> {
  const response = await fetch(`${API_BASE_URL}/api/plantings/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...buildAuthHeaders() },
    credentials: "include",
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  return (await response.json()) as RespuestaPlantacionApi;
}

export async function deletePlanting(id: string): Promise<RespuestaPlantacionApi> {
  const response = await fetch(`${API_BASE_URL}/api/plantings/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: buildAuthHeaders(),
    credentials: "include"
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  return (await response.json()) as RespuestaPlantacionApi;
}

export async function getActivePlantingByGreenhouse(idInvernadero: string): Promise<RespuestaPlantacionApi> {
  const response = await fetch(`${API_BASE_URL}/api/plantings/active/${encodeURIComponent(idInvernadero)}`, {
    headers: buildAuthHeaders(),
    cache: "no-store",
    credentials: "include"
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  return (await response.json()) as RespuestaPlantacionApi;
}

export interface FinalizarPlantacionPayload {
  idUsuario: string;
  idInvernadero: string;
}

export async function listActivePlantingsByUser(idUsuario: string): Promise<RespuestaPlantacionApi[]> {
  return listPlantingsByUser(idUsuario, "ACTIVA");
}

export async function finalizePlanting(payload: FinalizarPlantacionPayload): Promise<RespuestaPlantacionApi> {
  const response = await fetch(`${API_BASE_URL}/api/plantings/finalize`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...buildAuthHeaders() },
    credentials: "include",
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  return (await response.json()) as RespuestaPlantacionApi;
}
