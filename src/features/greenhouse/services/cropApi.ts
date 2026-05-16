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

async function parseApiError(response: Response): Promise<string> {
  try {
    const payload = (await response.json()) as ApiErrorPayload;
    return payload.message || "Error inesperado de API";
  } catch {
    return "No fue posible procesar la respuesta del servidor";
  }
}

export async function createCrop(payload: CrearCultivoPayload): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/crops`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }
}

export async function listCropsByUser(idUsuario: string): Promise<CultivoApiRespuesta[]> {
  const response = await fetch(`${API_BASE_URL}/api/crops?userId=${encodeURIComponent(idUsuario)}`, {
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  return (await response.json()) as CultivoApiRespuesta[];
}
