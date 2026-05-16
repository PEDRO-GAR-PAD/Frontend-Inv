import type { CredencialesAcceso } from "../model/auth.types";

const API_BASE_URL =
  (import.meta as ImportMeta & { env?: Record<string, string> }).env?.VITE_API_BASE_URL ??
  "http://localhost:8080";

// 1. Ampliamos la interfaz para aceptar el token de JWT y el id nativo de Java
export interface UsuarioApiRespuesta {
  id?: number;          // Java devuelve 'id' por defecto
  idUsuario?: string;
  id_usuario?: string;  // Lo mantenemos para no romper tu lógica actual
  correo?: string;
  token?: string;       // Añadido para recibir el JWT del login
}

interface UsuarioBackend {
  idUsuario: number;
  correo: string;
  contrasena?: string;
}

interface ApiErrorPayload {
  message?: string;
}

// 2. Modificamos el manejo de errores para soportar el texto plano del backend
async function parseApiError(response: Response): Promise<string> {
  try {
    const text = await response.text(); // Leemos como texto primero
    try {
      const payload = JSON.parse(text) as ApiErrorPayload; // Intentamos convertir a JSON
      return payload.message || "Error inesperado de API";
    } catch {
      return text; // Si falla el JSON, es porque el backend mandó texto plano. Lo devolvemos.
    }
  } catch {
    return "No fue posible procesar la respuesta del servidor";
  }
}

async function resolveUsuarioIdByCorreo(token: string, correo: string): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/api/usuarios`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  const usuarios = (await response.json()) as UsuarioBackend[];
  const match = usuarios.find((usuario) => usuario.correo === correo);

  if (!match) {
    throw new Error("No se pudo identificar el usuario autenticado");
  }

  return String(match.idUsuario);
}

export async function registerUser(credentials: CredencialesAcceso): Promise<UsuarioApiRespuesta> {
  // 3. Actualizamos la ruta al endpoint de registro
  const response = await fetch(`${API_BASE_URL}/api/usuarios/registro`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    // Nota sobre CORS: Si el backend tiene @CrossOrigin("*"), 'include' fallará en el navegador. 
    // Si da error, cambia 'include' a 'omit' o configura el dominio exacto en el backend.
    credentials: "omit", 
    body: JSON.stringify({
      correo: credentials.correo,
      contrasena: credentials.contrasena
    })
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  const data = await response.json();
  
  const idUsuario = String(data.idUsuario ?? data.id ?? "");

  return { 
    ...data, 
    idUsuario,
    id_usuario: idUsuario 
  } as UsuarioApiRespuesta;
}

export async function loginUser(credentials: CredencialesAcceso): Promise<UsuarioApiRespuesta> {
  // 5. Actualizamos la ruta al endpoint de AuthController
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "omit", 
    body: JSON.stringify({
      correo: credentials.correo,
      contrasena: credentials.contrasena
    })
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  const data = await response.json(); // Esto devolverá { token: "..." }

  const token = String(data.token ?? "");
  const idUsuario = await resolveUsuarioIdByCorreo(token, credentials.correo);
  
  return { 
    ...data, 
    correo: credentials.correo,
    token,
    idUsuario,
    id_usuario: idUsuario
  } as UsuarioApiRespuesta;
}