import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { AppRoutes } from "../../../src/app/routes/authRoutes";

describe("management shell", () => {
  it("keeps topbar visible and confirms unsaved changes before leave", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={["/invernadero"]}>
        <AppRoutes />
      </MemoryRouter>
    );

    expect(screen.getByLabelText("Barra principal de gestion")).toBeInTheDocument();
    await user.type(screen.getByLabelText("Nombre"), "Invernadero 1");

    await user.click(screen.getByRole("button", { name: "Abrir menu principal" }));
    await user.click(screen.getByRole("button", { name: "Cosecha" }));

    expect(screen.getByRole("dialog", { name: "Confirmar salida" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Permanecer" }));
    expect(screen.getByRole("heading", { name: "Invernadero" })).toBeInTheDocument();
  });
});
