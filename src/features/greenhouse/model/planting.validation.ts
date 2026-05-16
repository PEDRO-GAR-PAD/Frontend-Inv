import type { ErroresFormularioPlantacion, FormularioPlantacion } from "./planting.types";

function isBlank(value: string): boolean {
  return !value.trim();
}

function isInvalidDateTime(value: string): boolean {
  if (isBlank(value)) return true;
  return Number.isNaN(new Date(value).getTime());
}

export function validateFormularioPlantacion(formulario: FormularioPlantacion): ErroresFormularioPlantacion {
  const errors: ErroresFormularioPlantacion = {};

  if (isBlank(formulario.idInvernadero)) {
    errors.idInvernadero = "Selecciona un invernadero";
  }

  if (isBlank(formulario.idCultivo)) {
    errors.idCultivo = "Selecciona un cultivo";
  }

  if (isInvalidDateTime(formulario.fechaPlantado)) {
    errors.fechaPlantado = "Fecha de plantado invalida";
  }

  if (formulario.estado === "INACTIVA" && isBlank(formulario.fechaFinalizacion)) {
    errors.fechaFinalizacion = "Fecha finalizada es obligatoria cuando estado es Inactiva";
  }

  if (!isBlank(formulario.fechaFinalizacion) && isInvalidDateTime(formulario.fechaFinalizacion)) {
    errors.fechaFinalizacion = "Fecha finalizada invalida";
  }

  if (!isBlank(formulario.fechaPlantado) && !isBlank(formulario.fechaFinalizacion)) {
    const fechaPlantado = new Date(formulario.fechaPlantado).getTime();
    const fechaFinalizacion = new Date(formulario.fechaFinalizacion).getTime();
    if (!Number.isNaN(fechaPlantado) && !Number.isNaN(fechaFinalizacion) && fechaFinalizacion < fechaPlantado) {
      errors.fechaFinalizacion = "Fecha finalizada debe ser mayor o igual a fecha de plantado";
    }
  }

  return errors;
}
