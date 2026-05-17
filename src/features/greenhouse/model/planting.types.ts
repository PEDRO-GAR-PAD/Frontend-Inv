export type EstadoPlantacion = "ACTIVA" | "INACTIVA" | "FINALIZADA";
export type FiltroEstadoPlantacion = "ACTIVA" | "INACTIVA" | "FINALIZADA" | "TODAS";

export interface FormularioPlantacion {
  idInvernadero: string;
  idCultivo: string;
  fechaPlantado: string;
  fechaFinalizacion: string;
  estado: EstadoPlantacion;
}

export interface ErroresFormularioPlantacion {
  idInvernadero?: string;
  idCultivo?: string;
  fechaPlantado?: string;
  fechaFinalizacion?: string;
  estado?: string;
}

export interface CargaUtilPlantacionApi {
  idUsuario: string;
  idInvernadero: string;
  idCultivo: string;
  fechaPlantado: string;
  fechaFinalizacion: string | null;
  estado: EstadoPlantacion;
}

export interface RespuestaPlantacionApi {
  idPlantacion: string;
  idUsuario: string;
  idInvernadero: string;
  nombreInvernadero: string;
  idCultivo: string;
  nombreCultivo: string;
  fechaPlantado: string;
  fechaFinalizacion: string | null;
  estado: EstadoPlantacion;
}
