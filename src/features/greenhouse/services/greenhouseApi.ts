const API_BASE_URL =
  (import.meta as ImportMeta & { env?: Record<string, string> }).env?.VITE_API_BASE_URL ??
  "http://localhost:8080";

import { getUserSession } from "../model/session.store";

export interface CrearInvernaderoPayload {
  idUsuario: string;
  nombre: string;
  ubicacion: string;
  estado: "PRODUCCION" | "INACTIVO";
  sensores?: string[];
  actuadores?: string[];
}

export interface InvernaderoApiRespuesta {
  idInvernadero: string;
  idUsuario: string;
  nombre: string;
  ubicacion: string | null;
  estado: "PRODUCCION" | "INACTIVO";
  nombresSensor: string[];
  nombresActuador: string[];
}

export interface RespuestaPaginaInvernaderos {
  items: InvernaderoApiRespuesta[];
  total: number;
}

export interface ActualizarInvernaderoPayload {
  idUsuario: string;
  nombre: string;
  ubicacion: string;
  estado: "PRODUCCION" | "INACTIVO";
}

interface ApiErrorPayload {
  message?: string;
}

interface BackendUsuarioRef {
  idUsuario?: number | string;
  correo?: string;
}

interface BackendInvernadero {
  idInvernadero?: number | string;
  usuario?: BackendUsuarioRef | null;
  idUsuario?: number | string;
  nombre?: string;
  ubicacion?: string | null;
  estado?: string | null;
  nombresSensor?: string[];
  nombresActuador?: string[];
}

interface BackendCatalogRef {
  nombre?: string;
}

interface BackendInvernaderoSensor {
  sensor?: BackendCatalogRef | null;
}

interface BackendInvernaderoActuador {
  actuador?: BackendCatalogRef | null;
}

interface BackendUsuarioListado {
  idUsuario?: number | string;
  correo?: string;
}

function buildAuthHeaders(): Record<string, string> {
  const session = getUserSession();
  return session.token ? { Authorization: `Bearer ${session.token}` } : {};
}

function toUsuarioIdValue(idUsuario: string): number | string {
  const numericId = Number(idUsuario);
  return Number.isNaN(numericId) ? idUsuario : numericId;
}

function mapBackendInvernadero(invernadero: BackendInvernadero): InvernaderoApiRespuesta {
  const idUsuario = invernadero.usuario?.idUsuario ?? invernadero.idUsuario ?? "";
  return {
    idInvernadero: String(invernadero.idInvernadero ?? ""),
    idUsuario: String(idUsuario),
    nombre: invernadero.nombre ?? "",
    ubicacion: invernadero.ubicacion ?? null,
    estado: invernadero.estado === "PRODUCCION" ? "PRODUCCION" : "INACTIVO",
    nombresSensor: Array.isArray(invernadero.nombresSensor) ? invernadero.nombresSensor : [],
    nombresActuador: Array.isArray(invernadero.nombresActuador) ? invernadero.nombresActuador : []
  };
}

export async function resolveCurrentUserId(correo: string, token: string): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/api/usuarios`, {
    headers: {
      Authorization: `Bearer ${token}`
    },
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  const usuarios = (await response.json()) as BackendUsuarioListado[];
  const match = usuarios.find((usuario) => usuario.correo === correo);

  if (!match || match.idUsuario === undefined || match.idUsuario === null) {
    throw new Error("No se pudo identificar el usuario autenticado");
  }

  return String(match.idUsuario);
}

async function parseApiError(response: Response): Promise<string> {
  try {
    const payload = (await response.json()) as ApiErrorPayload;
    return payload.message || "Error inesperado de API";
  } catch {
    return "No fue posible procesar la respuesta del servidor";
  }
}

export async function createGreenhouse(payload: CrearInvernaderoPayload): Promise<InvernaderoApiRespuesta> {
  const response = await fetch(`${API_BASE_URL}/api/invernaderos`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...buildAuthHeaders() },
    body: JSON.stringify({
      usuario: { idUsuario: toUsuarioIdValue(payload.idUsuario) },
      nombre: payload.nombre,
      ubicacion: payload.ubicacion,
      estado: payload.estado
    })
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  const created = (await response.json()) as BackendInvernadero;
  const mapped = mapBackendInvernadero(created);

  // If sensors/actuators were provided, POST them to the backend endpoints to persist
  const invId = String(created.idInvernadero ?? mapped.idInvernadero);
  if (payload.sensores && payload.sensores.length > 0) {
    await fetch(`${API_BASE_URL}/api/invernaderos/${encodeURIComponent(invId)}/sensores`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...buildAuthHeaders() },
      body: JSON.stringify({ sensores: payload.sensores })
    });
  }

  if (payload.actuadores && payload.actuadores.length > 0) {
    await fetch(`${API_BASE_URL}/api/invernaderos/${encodeURIComponent(invId)}/actuadores`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...buildAuthHeaders() },
      body: JSON.stringify({ actuadores: payload.actuadores })
    });
  }

  return mapped;
}

export async function listGreenhousesByUser(idUsuario: string): Promise<InvernaderoApiRespuesta[]> {
  const response = await fetch(`${API_BASE_URL}/api/invernaderos?userId=${encodeURIComponent(idUsuario)}`, {
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  const items = (await response.json()) as BackendInvernadero[];
  return items.map(mapBackendInvernadero);
}

export async function listGreenhousesByUserPaged(
  idUsuario: string,
  page: number,
  size: number
): Promise<RespuestaPaginaInvernaderos> {
  const response = await fetch(`${API_BASE_URL}/api/invernaderos?userId=${encodeURIComponent(idUsuario)}`, {
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  const items = (await response.json()) as BackendInvernadero[];
  const mappedItems = items.map(mapBackendInvernadero);
  const start = Math.max(0, page) * Math.max(1, size);
  const pagedItems = mappedItems.slice(start, start + Math.max(1, size));

  return {
    items: pagedItems,
    total: mappedItems.length
  };
}

export async function listAllGreenhousesPaged(page: number, size: number): Promise<RespuestaPaginaInvernaderos> {
  const response = await fetch(`${API_BASE_URL}/api/invernaderos`, {
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  const items = (await response.json()) as BackendInvernadero[];
  const mappedItems = items.map(mapBackendInvernadero);
  const start = Math.max(0, page) * Math.max(1, size);
  const pagedItems = mappedItems.slice(start, start + Math.max(1, size));

  return {
    items: pagedItems,
    total: mappedItems.length
  };
}

export async function updateGreenhouse(id: string, payload: ActualizarInvernaderoPayload): Promise<InvernaderoApiRespuesta> {
  const response = await fetch(`${API_BASE_URL}/api/invernaderos/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...buildAuthHeaders() },
    body: JSON.stringify({
      usuario: { idUsuario: toUsuarioIdValue(payload.idUsuario) },
      nombre: payload.nombre,
      ubicacion: payload.ubicacion,
      estado: payload.estado
    })
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  return mapBackendInvernadero((await response.json()) as BackendInvernadero);
}

export async function listGreenhouseSensorsById(idInvernadero: string): Promise<string[]> {
  const response = await fetch(`${API_BASE_URL}/api/sensores/invernadero/${encodeURIComponent(idInvernadero)}`, {
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  const items = (await response.json()) as BackendInvernaderoSensor[];
  return items.map((item) => item.sensor?.nombre ?? "").filter(Boolean);
}

export async function listGreenhouseActuatorsById(idInvernadero: string): Promise<string[]> {
  const response = await fetch(`${API_BASE_URL}/api/actuadores/invernadero/${encodeURIComponent(idInvernadero)}`, {
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  const items = (await response.json()) as BackendInvernaderoActuador[];
  return items.map((item) => item.actuador?.nombre ?? "").filter(Boolean);
}
