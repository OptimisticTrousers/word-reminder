import { render, screen } from "@testing-library/react";

import { App } from "./App";
import * as hooks from "../../hooks/useChromeStorageSync";
import { createRoutesStub } from "react-router-dom";

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

vi.mock("react-router-dom", async () => {
  const originalModule = await vi.importActual("react-router-dom");
  return {
    ...originalModule,
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
    const Stub = createRoutesStub([
      {
        path: "/",
        Component: function () {
          return <App user={user} />;
        },
      },
    ]);
    const mockUseChromeStorageSync = vi
      .spyOn(hooks, "useChromeStorageSync")
      .mockReturnValue([user.id, function () {}]);
    const { asFragment } = render(<Stub initialEntries={["/"]} />);

    const footer = screen.getByTestId("footer");
    const navigation = screen.getByTestId("navigation");
    const outlet = screen.getByTestId("outlet");
    expect(footer).toBeInTheDocument();
    expect(navigation).toBeInTheDocument();
    expect(outlet).toBeInTheDocument();
    expect(mockUseChromeStorageSync).toHaveBeenCalledTimes(1);
    expect(mockUseChromeStorageSync).toHaveBeenCalledWith(
      "userId",
      String(user.id)
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
