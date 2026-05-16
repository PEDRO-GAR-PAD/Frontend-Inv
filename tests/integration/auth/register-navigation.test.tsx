import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { AppRoutes } from "../../../src/app/routes/authRoutes";

describe("Register navigation", () => {
  it("navigates from register to login using bottom text", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={["/crear-usuario"]}>
        <AppRoutes />
      </MemoryRouter>
    );

    await user.click(screen.getByRole("button", { name: "Ir a login" }));

    expect(screen.getByRole("heading", { name: "Login" })).toBeInTheDocument();
  });
});
