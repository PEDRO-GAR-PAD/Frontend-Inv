const API_BASE_URL =
  (import.meta as ImportMeta & { env?: Record<string, string> }).env?.VITE_API_BASE_URL ??
  "http://localhost:8080";

export interface CrearInvernaderoPayload {
  idUsuario: string;
  nombre: string;
  ubicacion: string;
  estado: "PRODUCCION" | "INACTIVO";
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

async function parseApiError(response: Response): Promise<string> {
  try {
    const payload = (await response.json()) as ApiErrorPayload;
    return payload.message || "Error inesperado de API";
  } catch {
    return "No fue posible procesar la respuesta del servidor";
  }
}

export async function createGreenhouse(payload: CrearInvernaderoPayload): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/greenhouses`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }
}

export async function listGreenhousesByUser(idUsuario: string): Promise<InvernaderoApiRespuesta[]> {
  const response = await fetch(`${API_BASE_URL}/api/greenhouses?userId=${encodeURIComponent(idUsuario)}`, {
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  return (await response.json()) as InvernaderoApiRespuesta[];
}

export async function listGreenhousesByUserPaged(
  idUsuario: string,
  page: number,
  size: number
): Promise<RespuestaPaginaInvernaderos> {
  const query = new URLSearchParams({
    userId: idUsuario,
    page: String(page),
    size: String(size)
  });

  const response = await fetch(`${API_BASE_URL}/api/greenhouses?${query.toString()}`, {
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  const items = (await response.json()) as InvernaderoApiRespuesta[];
  const totalHeader = response.headers.get("X-Total-Count");
  const total = totalHeader ? Number(totalHeader) : items.length;

  return {
    items,
    total: Number.isNaN(total) ? items.length : total
  };
}

export async function updateGreenhouse(id: string, payload: ActualizarInvernaderoPayload): Promise<InvernaderoApiRespuesta> {
  const response = await fetch(`${API_BASE_URL}/api/greenhouses/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  return (await response.json()) as InvernaderoApiRespuesta;
}
