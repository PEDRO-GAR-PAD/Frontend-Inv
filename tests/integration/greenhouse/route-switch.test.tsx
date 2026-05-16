import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { AppRoutes } from "../../../src/app/routes/authRoutes";

describe("route switch from drawer", () => {
  it("navigates to all management screens", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={["/inicio"]}>
        <AppRoutes />
      </MemoryRouter>
    );

    expect(screen.getByRole("heading", { name: "Inicio" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Abrir menu principal" }));
    await user.click(screen.getByRole("button", { name: "Invernadero" }));
    expect(screen.getByRole("heading", { name: "Invernadero" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Abrir menu principal" }));
    await user.click(screen.getByRole("button", { name: "Cosecha" }));
    expect(screen.getByRole("heading", { name: "Cosecha" })).toBeInTheDocument();
  });
});
