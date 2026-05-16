import { describe, expect, it } from "vitest";
import { validateEmail, validatePassword } from "../../../src/features/auth/model/auth.validation";

describe("auth validation", () => {
  it("accepts a valid email", () => {
    expect(validateEmail("user@example.com")).toBeUndefined();
  });

  it("rejects invalid email", () => {
    expect(validateEmail("invalid-mail")).toContain("correo valido");
  });

  it("accepts valid password with number and symbol", () => {
    expect(validatePassword("Clave2026!")).toBeUndefined();
  });

  it("rejects password without symbol", () => {
    expect(validatePassword("Clave2026")).toContain("Minimo 8 caracteres");
  });
});
