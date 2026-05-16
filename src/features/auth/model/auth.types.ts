export interface CredencialesAcceso {
  correo: string;
  contrasena: string;
}

export interface ErroresFormularioAcceso {
  correo?: string;
  contrasena?: string;
}

export interface EstadoFormularioAcceso {
  valores: CredencialesAcceso;
  errores: ErroresFormularioAcceso;
  enviando: boolean;
  envioHabilitado: boolean;
}
