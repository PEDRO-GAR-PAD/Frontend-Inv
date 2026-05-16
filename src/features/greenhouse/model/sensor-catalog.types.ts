export interface CatalogoSensorItem {
  idSensor: string;
  nombre: string;
  unidad: string;
}

export interface ActualizarUnidadSensorInput {
  unidad: string;
}

export interface EstadoConflictoCatalogoSensor {
  codigo: 409;
  message: string;
}
