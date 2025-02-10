import { render, screen } from "@testing-library/react";

import { App } from "./App";

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

describe("App component", () => {
  it("renders main element and footer", () => {
    const { asFragment } = render(<App />);

    const footer = screen.getByTestId("footer");
    const navigation = screen.getByTestId("navigation");
    const outlet = screen.getByTestId("outlet");
    expect(footer).toBeInTheDocument();
    expect(navigation).toBeInTheDocument();
    expect(outlet).toBeInTheDocument();
    expect(asFragment()).toMatchSnapshot();
  });
});
