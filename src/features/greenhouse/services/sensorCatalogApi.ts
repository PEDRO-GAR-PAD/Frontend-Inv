import type { ActualizarUnidadSensorInput, CatalogoSensorItem } from "../model/sensor-catalog.types";
import { getUserSession } from "../model/session.store";

const API_BASE_URL =
  (import.meta as ImportMeta & { env?: Record<string, string> }).env?.VITE_API_BASE_URL ??
  "http://localhost:8080";

interface ApiErrorPayload {
  message?: string;
}

function buildAuthHeaders(): Record<string, string> {
  const session = getUserSession();
  return session.token ? { Authorization: `Bearer ${session.token}` } : {};
}

export class ErrorCatalogoSensor extends Error {
  codigo: number;

  constructor(codigo: number, message: string) {
    super(message);
    this.codigo = codigo;
  }
}

async function parseApiError(response: Response): Promise<string> {
  try {
    const payload = (await response.json()) as ApiErrorPayload;
    return payload.message || "Error inesperado de API";
  } catch {
    return "No fue posible procesar la respuesta del servidor";
  }
}

export async function listSensorCatalog(): Promise<CatalogoSensorItem[]> {
  const response = await fetch(`${API_BASE_URL}/api/sensors/catalog`, {
    headers: buildAuthHeaders(),
    cache: "no-store"
  });

  if (!response.ok) {
    throw new ErrorCatalogoSensor(response.status, await parseApiError(response));
  }

  return (await response.json()) as CatalogoSensorItem[];
}

export async function updateSensorUnit(
  id: string,
  payload: ActualizarUnidadSensorInput,
  userRole: string
): Promise<CatalogoSensorItem> {
  const response = await fetch(`${API_BASE_URL}/api/sensors/catalog/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...buildAuthHeaders(),
      "X-User-Role": userRole
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new ErrorCatalogoSensor(response.status, await parseApiError(response));
  }

  return (await response.json()) as CatalogoSensorItem;
}
