import { describe, expect, it } from "vitest";
import {
  validateCropForm,
  validateMinLessThanMax
} from "../../../src/features/greenhouse/model/greenhouse.validation";

describe("crop range validation", () => {
  it("rejects min greater than max", () => {
    const error = validateMinLessThanMax("50", "20", "Temperatura");
    expect(error).toContain("minimo");
  });

  it("rejects non numeric values", () => {
    const error = validateMinLessThanMax("a", "20", "Luz");
    expect(error).toContain("numericos");
  });

  it("validates a full crop payload", () => {
    const errors = validateCropForm({
      name: "Tomate",
      temperature: { min: "14", max: "24" },
      humidity: { min: "50", max: "70" },
      light: { min: "1000", max: "2000" }
    });

    expect(errors.name).toBeUndefined();
    expect(errors.temperature).toBeUndefined();
    expect(errors.humidity).toBeUndefined();
    expect(errors.light).toBeUndefined();
  });
});
