import { render, screen } from "@testing-library/react";

import { App } from "./App";
import * as hooks from "../../hooks/useUserId";

vi.mock("../../layouts/Footer", () => {
  return {
    Footer: function () {
      return <div data-testid="footer"></div>;
    },
  };
});

vi.mock("../../layouts/Navigation", () => {
  return {
    Navigation: function () {
      return <div data-testid="navigation"></div>;
    },
  };
});

vi.mock("react-router-dom", () => {
  return {
    Outlet: function () {
      return <div data-testid="outlet"></div>;
    },
  };
});

const user = {
  id: 1,
  email: "bob@gmail.com",
  confirmed: false,
  created_at: new Date(),
  updated_at: new Date(),
};

describe("App component", () => {
  it("renders main element and footer", () => {
    const mockUseUserId = vi.spyOn(hooks, "useUserId");
    const { asFragment } = render(<App user={user} />);

    const footer = screen.getByTestId("footer");
    const navigation = screen.getByTestId("navigation");
    const outlet = screen.getByTestId("outlet");
    expect(footer).toBeInTheDocument();
    expect(navigation).toBeInTheDocument();
    expect(outlet).toBeInTheDocument();
    expect(mockUseUserId).toHaveBeenCalledTimes(1);
    expect(mockUseUserId).toHaveBeenCalledWith(user.id);
    expect(asFragment()).toMatchSnapshot();
  });
});
