import { describe, expect, it } from "vitest";
import { validateGreenhouseForm } from "../../../src/features/greenhouse/model/greenhouse.validation";

describe("greenhouse form validation", () => {
  it("returns errors when required values are missing", () => {
    const errors = validateGreenhouseForm({
      name: "",
      location: "",
      sensors: [],
      actuators: []
    });

    expect(errors.name).toContain("Nombre");
    expect(errors.location).toContain("Ubicacion");
    expect(errors.sensors).toContain("sensor");
    expect(errors.actuators).toContain("actuador");
  });

  it("returns no errors for a valid greenhouse", () => {
    const errors = validateGreenhouseForm({
      name: "Invernadero Norte",
      location: "Zona 3",
      sensors: ["Humedad"],
      actuators: ["Riego"]
    });

    expect(errors.name).toBeUndefined();
    expect(errors.location).toBeUndefined();
    expect(errors.sensors).toBeUndefined();
    expect(errors.actuators).toBeUndefined();
  });
});
