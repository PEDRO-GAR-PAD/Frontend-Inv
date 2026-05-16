import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { AppRoutes } from "../../../src/app/routes/authRoutes";

describe("GreenhousePage", () => {
  it("shows validations on invalid submit", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={["/invernadero"]}>
        <AppRoutes />
      </MemoryRouter>
    );

    await user.click(screen.getByRole("button", { name: "Crear invernadero" }));

    expect(screen.getByText("Nombre es obligatorio")).toBeInTheDocument();
    expect(screen.getByText("Ubicacion es obligatorio")).toBeInTheDocument();
    expect(screen.getByText("Selecciona al menos 1 sensor")).toBeInTheDocument();
    expect(screen.getByText("Selecciona al menos 1 actuador")).toBeInTheDocument();
  });

  it("submits correctly with valid data", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={["/invernadero"]}>
        <AppRoutes />
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText("Nombre"), "Invernadero Centro");
    await user.type(screen.getByLabelText("Ubicacion"), "Sector A");
    await user.click(screen.getByLabelText("Humedad"));
    await user.click(screen.getByLabelText("Riego"));
    await user.click(screen.getByRole("button", { name: "Crear invernadero" }));

    expect(screen.getByText("Invernadero creado correctamente.")).toBeInTheDocument();
  });
});
