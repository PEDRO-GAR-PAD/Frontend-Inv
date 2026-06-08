export type PantallaEntradaSimulacion = "START_SIMULATOR" | "ACTUATORS" | "EMPTY";

export interface VistaInvernaderoSimulacion {
  idInvernadero: string;
  name: string;
  location: string;
  estadoInvernadero: "PRODUCCION" | "INACTIVO";
  sensores: string[];
  actuadores: string[];
}

export interface OpcionCultivoSeleccionable {
  idCultivo: string;
  name: string;
  estadoCultivo: "ACTIVO" | "INACTIVO";
}

export interface RespuestaEntradaSimulacion {
  pantallaEntrada: PantallaEntradaSimulacion;
  invernadero: VistaInvernaderoSimulacion | null;
}

export interface ReferenciaSesionSimulacion {
  idSesion: string;
  idInvernadero: string;
  idCultivo: string;
  greenhouseName?: string;
  cropName?: string;
  nombresSensor?: string[];
  nombresActuador?: string[];
  guardadoEn?: string;
}

export interface EstadoActuadorSimulacion {
  IdActuador: number;
  label: string;
  activo: boolean;
  actualizadoEn: string;
}

export interface EstadoEventoClimaticoSimulacion {
  IdEvento: string;
  label: string;
  activo: boolean;
  actualizadoEn: string;
}

export interface SimulationRealtimeDTO {
  temperatura: number;
  humedad: number;
  luminosidad: number;
  co2: number;

  ventilador: boolean;
  bomba: boolean;
  extractor: boolean;
  luz: boolean;
  malla: boolean;

  cultivo: string;
  invernadero: string;
}
