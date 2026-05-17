import { getUserSession } from "../model/session.store";

const API_BASE_URL =
  (import.meta as ImportMeta & { env?: Record<string, string> }).env?.VITE_API_BASE_URL ??
  "http://localhost:8080";

export interface CrearCultivoPayload {
  idUsuario: string;
  nombre: string;
  temperaturaMinima: number;
  temperaturaMaxima: number;
  humedadMinima: number;
  humedadMaxima: number;
  luzMinima: number;
  luzMaxima: number;
}

export interface CultivoApiRespuesta {
  idCultivo: string;
  idUsuario: string;
  nombre: string;
  temperaturaMinima: number;
  temperaturaMaxima: number;
  humedadMinima: number;
  humedadMaxima: number;
  luzMinima: number;
  luzMaxima: number;
}

interface ApiErrorPayload {
  message?: string;
}

interface BackendUsuarioRef {
  idUsuario?: number | string;
  correo?: string;
}

interface BackendCultivo {
  idCultivo?: number | string;
  idUsuario?: number | string;
  usuario?: BackendUsuarioRef | null;
  nombre?: string;
  temperaturaMin?: number | null;
  temperaturaMax?: number | null;
  humedadMin?: number | null;
  humedadMax?: number | null;
  luzMin?: number | null;
  luzMax?: number | null;
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

function toUsuarioIdValue(idUsuario: string): number | string {
  const numericId = Number(idUsuario);
  return Number.isNaN(numericId) ? idUsuario : numericId;
}

function mapBackendCultivo(cultivo: BackendCultivo): CultivoApiRespuesta {
  const idUsuario = cultivo.idUsuario ?? cultivo.usuario?.idUsuario ?? "";

  return {
    idCultivo: String(cultivo.idCultivo ?? ""),
    idUsuario: String(idUsuario),
    nombre: cultivo.nombre ?? "",
    temperaturaMinima: Number(cultivo.temperaturaMin ?? 0),
    temperaturaMaxima: Number(cultivo.temperaturaMax ?? 0),
    humedadMinima: Number(cultivo.humedadMin ?? 0),
    humedadMaxima: Number(cultivo.humedadMax ?? 0),
    luzMinima: Number(cultivo.luzMin ?? 0),
    luzMaxima: Number(cultivo.luzMax ?? 0)
  };
}

async function parseApiError(response: Response): Promise<string> {
  try {
    const payload = (await response.json()) as ApiErrorPayload;
    return payload.message || "Error inesperado de API";
  } catch {
    return "No fue posible procesar la respuesta del servidor";
  }
}

export async function createCrop(payload: CrearCultivoPayload): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/cultivos`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...buildAuthHeaders() },
    credentials: "include",
    body: JSON.stringify({
      usuario: { idUsuario: toUsuarioIdValue(payload.idUsuario) },
      nombre: payload.nombre,
      temperaturaMin: payload.temperaturaMinima,
      temperaturaMax: payload.temperaturaMaxima,
      humedadMin: payload.humedadMinima,
      humedadMax: payload.humedadMaxima,
      luzMin: payload.luzMinima,
      luzMax: payload.luzMaxima
    })
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }
}

export async function listCropsByUser(idUsuario: string): Promise<CultivoApiRespuesta[]> {
  const sessionUserId = getUserSession().idUsuario.trim();
  const effectiveUserId = idUsuario.trim() || sessionUserId;

  if (!effectiveUserId) {
    return [];
  }

  const response = await fetch(`${API_BASE_URL}/api/cultivos?userId=${encodeURIComponent(effectiveUserId)}`, {
    headers: buildAuthHeaders(),
    cache: "no-store",
    credentials: "include"
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  const items = (await response.json()) as BackendCultivo[];
  return items.map(mapBackendCultivo).filter((item) => item.idUsuario === effectiveUserId);
}
