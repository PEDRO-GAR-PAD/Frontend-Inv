import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { AppRoutes } from "../../../src/app/routes/authRoutes";

describe("RegisterPage", () => {
  it("shows password policy error on invalid password", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={["/crear-usuario"]}>
        <AppRoutes />
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText(/Correo:/i), "user@example.com");
    await user.type(screen.getByLabelText(/Contrasena:/i), "short");
    await user.click(screen.getByRole("button", { name: "Crear usuario" }));

    expect(screen.getByText("Minimo 8 caracteres, un numero y un simbolo")).toBeInTheDocument();
  });

  it("redirects to inicio when register submit is valid", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={["/crear-usuario"]}>
        <AppRoutes />
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText(/Correo:/i), "new@example.com");
    await user.type(screen.getByLabelText(/Contrasena:/i), "Clave2026!");
    await user.click(screen.getByRole("button", { name: "Crear usuario" }));

    expect(screen.getByRole("heading", { name: "Inicio" })).toBeInTheDocument();
  });
});
