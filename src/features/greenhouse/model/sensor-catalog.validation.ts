export function validateSensorUnit(unit: string): string | null {
  if (!unit.trim()) {
    return "La unidad es obligatoria";
  }
  return null;
}
