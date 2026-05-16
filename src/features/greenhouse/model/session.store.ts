import type { SesionUsuario } from "./greenhouse.types";

const SESSION_CORREO_KEY = "frontreact.session.email";
const SESSION_ID_USUARIO_KEY = "frontreact.session.userId";
const SESSION_TOKEN_KEY = "frontreact.session.token";
const SESSION_ROL_USUARIO_KEY = "frontreact.session.role";
const DEFAULT_CORREO = "usuario@invernadero.local";
const DEFAULT_ID_USUARIO = "";
const DEFAULT_ROL_USUARIO = "USER";

export function saveUserSession(usuario: { idUsuario: string; correo: string; token?: string }): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SESSION_ID_USUARIO_KEY, usuario.idUsuario.trim());
  window.localStorage.setItem(SESSION_CORREO_KEY, usuario.correo.trim());
  if (usuario.token) {
    window.localStorage.setItem(SESSION_TOKEN_KEY, usuario.token.trim());
  } else {
    window.localStorage.removeItem(SESSION_TOKEN_KEY);
  }
}

export function saveSessionCorreo(correo: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SESSION_CORREO_KEY, correo.trim());
}

export function clearSessionCorreo(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SESSION_ID_USUARIO_KEY);
  window.localStorage.removeItem(SESSION_CORREO_KEY);
  window.localStorage.removeItem(SESSION_TOKEN_KEY);
  window.localStorage.removeItem(SESSION_ROL_USUARIO_KEY);
}

export function getUserSession(): SesionUsuario {
  if (typeof window === "undefined") {
    return { idUsuario: DEFAULT_ID_USUARIO, correo: DEFAULT_CORREO };
  }

  const idUsuario = window.localStorage.getItem(SESSION_ID_USUARIO_KEY)?.trim();
  const correo = window.localStorage.getItem(SESSION_CORREO_KEY)?.trim();
  return {
    idUsuario: idUsuario || DEFAULT_ID_USUARIO,
    correo: correo || DEFAULT_CORREO,
    token: window.localStorage.getItem(SESSION_TOKEN_KEY)?.trim() || ""
  };
}

export function getSessionRole(): string {
  if (typeof window === "undefined") {
    return DEFAULT_ROL_USUARIO;
  }
  return window.localStorage.getItem(SESSION_ROL_USUARIO_KEY)?.trim() || DEFAULT_ROL_USUARIO;
}
