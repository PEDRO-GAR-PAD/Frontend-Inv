import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { AppRoutes } from "../../../src/app/routes/authRoutes";

describe("CropPage", () => {
  it("blocks submit when ranges are invalid", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={["/cosecha"]}>
        <AppRoutes />
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText("Nombre de cosecha"), "Tomate");
    await user.type(screen.getByLabelText("Temperatura MIN:"), "30");
    await user.type(screen.getByLabelText("Temperatura MAX:"), "20");
    await user.type(screen.getByLabelText("Humedad MIN:"), "50");
    await user.type(screen.getByLabelText("Humedad MAX:"), "70");
    await user.type(screen.getByLabelText("Luminacion MIN:"), "1000");
    await user.type(screen.getByLabelText("Luminacion MAX:"), "2000");
    await user.click(screen.getByRole("button", { name: "Guardar cosecha" }));

    expect(screen.getByText("Temperatura: el minimo debe ser menor al maximo")).toBeInTheDocument();
  });

  it("submits when all values are valid", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={["/cosecha"]}>
        <AppRoutes />
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText("Nombre de cosecha"), "Lechuga");
    await user.type(screen.getByLabelText("Temperatura MIN:"), "15");
    await user.type(screen.getByLabelText("Temperatura MAX:"), "24");
    await user.type(screen.getByLabelText("Humedad MIN:"), "45");
    await user.type(screen.getByLabelText("Humedad MAX:"), "70");
    await user.type(screen.getByLabelText("Luminacion MIN:"), "900");
    await user.type(screen.getByLabelText("Luminacion MAX:"), "1600");
    await user.click(screen.getByRole("button", { name: "Guardar cosecha" }));

    expect(screen.getByText("Cosecha configurada correctamente.")).toBeInTheDocument();
  });
});
