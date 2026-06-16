import type {
  ErroresFormularioCultivo,
  ErroresFormularioInvernadero,
  FormularioCultivo,
  FormularioInvernadero
} from "./greenhouse.types";

function isBlank(value: string): boolean {
  return !value.trim();
}

function parseNonNegativeNumber(value: string): number | undefined {
  const parsed = Number(value);
  if (Number.isNaN(parsed) || parsed < 0) return undefined;
  return parsed;
}

export function validateRequired(value: string, fieldLabel: string): string | undefined {
  if (isBlank(value)) return `${fieldLabel} es obligatorio`;
  return undefined;
}

export function validateMinLessThanMax(
  minValue: string,
  maxValue: string,
  metricLabel: string
): string | undefined {
  const min = parseNonNegativeNumber(minValue);
  const max = parseNonNegativeNumber(maxValue);

  if (min === undefined || max === undefined) {
    return `${metricLabel}: ingresa valores numericos mayores o iguales a 0`;
  }

  if (min >= max) {
    return `${metricLabel}: el minimo debe ser menor al maximo`;
  }

  return undefined;
}

export function validateFormularioInvernadero(invernadero: FormularioInvernadero): ErroresFormularioInvernadero {
  return {
    nombre: validateRequired(invernadero.nombre, "Nombre"),
    ubicacion: validateRequired(invernadero.ubicacion, "Ubicacion"),
    estado: validateRequired(invernadero.estado, "Estado")
  };
}

function validateRange(minimo: string, maximo: string, label: string): string | undefined {
  if (isBlank(minimo) || isBlank(maximo)) {
    return `${label}: minimo y maximo son obligatorios`;
  }

  return validateMinLessThanMax(minimo, maximo, label);
}

// Búscalo y modifícalo así:
export function validateFormularioCultivo(cultivo: FormularioCultivo): ErroresFormularioCultivo {
  return {
    nombre: validateRequired(cultivo.nombre, "Nombre de cultivo"),
    temperatura: validateRange(cultivo.temperaturaMinima, cultivo.temperaturaMaxima, "Temperatura"),
    humedad: validateRange(cultivo.humedadMinima, cultivo.humedadMaxima, "Humedad"),
    luz: validateRange(cultivo.luzMinima, cultivo.luzMaxima, "Luz"),
    co2: validateRequired(cultivo.co2Maxima, "CO2 máximo") // <-- NUEVO
  };
}
