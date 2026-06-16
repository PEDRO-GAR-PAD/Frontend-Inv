export interface SesionUsuario {
  idUsuario: string;
  correo: string;
  token?: string;
}

export type EstadoInvernadero = "PRODUCCION" | "INACTIVO";

export interface FormularioInvernadero {
  nombre: string;
  ubicacion: string;
  estado: EstadoInvernadero;
}

export interface ErroresFormularioInvernadero {
  nombre?: string;
  ubicacion?: string;
  estado?: string;
}

export interface FormularioCultivo {
  nombre: string;
  temperaturaMinima: string;
  temperaturaMaxima: string;
  humedadMinima: string;
  humedadMaxima: string;
  luzMinima: string;
  luzMaxima: string;
  co2Maxima: string;
}

export interface ErroresFormularioCultivo {
  nombre?: string;
  temperatura?: string;
  humedad?: string;
  luz?: string;
  co2?: string;
}

export interface ElementoNavegacion {
  label: string;
  path: string;
}
