import type { CredencialesAcceso } from "../model/auth.types";

const API_BASE_URL =
  (import.meta as ImportMeta & { env?: Record<string, string> }).env?.VITE_API_BASE_URL ??
  "http://localhost:8080";

export interface UsuarioApiRespuesta {
  id_usuario: string;
  correo: string;
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

export async function registerUser(credentials: CredencialesAcceso): Promise<UsuarioApiRespuesta> {
  const response = await fetch(`${API_BASE_URL}/api/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      correo: credentials.correo,
      contrasena: credentials.contrasena
    })
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  return (await response.json()) as UsuarioApiRespuesta;
}

export async function loginUser(credentials: CredencialesAcceso): Promise<UsuarioApiRespuesta> {
  const response = await fetch(`${API_BASE_URL}/api/users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      correo: credentials.correo,
      contrasena: credentials.contrasena
    })
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  return (await response.json()) as UsuarioApiRespuesta;
}
