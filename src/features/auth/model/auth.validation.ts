import type { ErroresFormularioAcceso } from "./auth.types";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export function validateCorreo(correo: string): string | undefined {
  if (!correo.trim()) return "El correo es obligatorio";
  if (!EMAIL_REGEX.test(correo)) return "Ingresa un correo valido";
  return undefined;
}

export function validateContrasena(contrasena: string): string | undefined {
  if (!contrasena.trim()) return "La contrasena es obligatoria";
  if (!PASSWORD_REGEX.test(contrasena)) {
    return "Minimo 8 caracteres, un numero y un simbolo";
  }
  return undefined;
}

export function validateFormularioAcceso(correo: string, contrasena: string): ErroresFormularioAcceso {
  return {
    correo: validateCorreo(correo),
    contrasena: validateContrasena(contrasena)
  };
}
