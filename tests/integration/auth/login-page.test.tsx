import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { AppRoutes } from "../../../src/app/routes/authRoutes";

describe("LoginPage", () => {
  it("shows validation errors on invalid submit", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={["/login"]}>
        <AppRoutes />
      </MemoryRouter>
    );

    await user.click(screen.getByRole("button", { name: "Iniciar Sesion" }));

    expect(screen.getByText("El correo es obligatorio")).toBeInTheDocument();
    expect(screen.getByText("La contrasena es obligatoria")).toBeInTheDocument();
  });

  it("redirects to inicio when submit is valid", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={["/login"]}>
        <AppRoutes />
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText(/Correo:/i), "user@example.com");
    await user.type(screen.getByLabelText(/Contrasena:/i), "Clave2026!");
    await user.click(screen.getByRole("button", { name: "Iniciar Sesion" }));

    expect(screen.getByRole("heading", { name: "Inicio" })).toBeInTheDocument();
  });
});
