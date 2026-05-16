import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { AppRoutes } from "../../../src/app/routes/authRoutes";

describe("Login navigation", () => {
  it("navigates from login to register using bottom text", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={["/login"]}>
        <AppRoutes />
      </MemoryRouter>
    );

    await user.click(screen.getByRole("button", { name: "Ir a crear usuario" }));

    expect(screen.getByRole("heading", { name: "Crear Usuario" })).toBeInTheDocument();
  });
});
