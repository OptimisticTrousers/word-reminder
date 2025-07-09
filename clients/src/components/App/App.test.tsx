import { render, screen } from "@testing-library/react";

import { App } from "./App";
import { createRoutesStub } from "react-router-dom";
import * as hooks from "../../hooks/useMobileTextSelectionAction";

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

vi.mock("../../pages/Auth/EmailConfirmation", () => {
  return {
    EmailConfirmation: function () {
      return <div data-testid="email-confirmation"></div>;
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
  confirmed: true,
  created_at: new Date(),
  updated_at: new Date(),
};

describe("App component", () => {
  describe("when MODE === 'production'", () => {
    it("renders main element and footer when the user is confirmed", () => {
      const mockUseMobileTextSelectionAction = vi
        .spyOn(hooks, "useMobileTextSelectionAction")
        .mockImplementation(vi.fn());
      vi.stubEnv("MODE", "production");
      const Stub = createRoutesStub([
        {
          path: "/",
          Component: function () {
            return <App user={user} />;
          },
        },
      ]);
      const { asFragment } = render(<Stub initialEntries={["/"]} />);

      const footer = screen.getByTestId("footer");
      const navigation = screen.getByTestId("navigation");
      const outlet = screen.getByTestId("outlet");
      expect(footer).toBeInTheDocument();
      expect(navigation).toBeInTheDocument();
      expect(outlet).toBeInTheDocument();
      expect(mockUseMobileTextSelectionAction).toHaveBeenCalledTimes(1);
      expect(mockUseMobileTextSelectionAction).toHaveBeenCalledWith(
        String(user.id)
      );
      expect(asFragment()).toMatchSnapshot();
    });

    it("renders main element and footer when the user is not confirmed", () => {
      const mockUseMobileTextSelectionAction = vi
        .spyOn(hooks, "useMobileTextSelectionAction")
        .mockImplementation(vi.fn());
      vi.stubEnv("MODE", "production");
      const Stub = createRoutesStub([
        {
          path: "/",
          Component: function () {
            return <App user={{ ...user, confirmed: false }} />;
          },
        },
      ]);
      render(<Stub initialEntries={["/"]} />);

      const emailConfirmation = screen.getByTestId("email-confirmation");
      expect(emailConfirmation).toBeInTheDocument();
      expect(mockUseMobileTextSelectionAction).toHaveBeenCalledTimes(1);
      expect(mockUseMobileTextSelectionAction).toHaveBeenCalledWith(
        String(user.id)
      );
    });
  });

  describe("when MODE !== 'production'", () => {
    it("renders main element and footer", () => {
      const mockUseMobileTextSelectionAction = vi
        .spyOn(hooks, "useMobileTextSelectionAction")
        .mockImplementation(vi.fn());
      vi.stubEnv("MODE", "development");
      const Stub = createRoutesStub([
        {
          path: "/",
          Component: function () {
            return <App user={{ ...user, confirmed: false }} />;
          },
        },
      ]);
      const { asFragment } = render(<Stub initialEntries={["/"]} />);

      const footer = screen.getByTestId("footer");
      const navigation = screen.getByTestId("navigation");
      const outlet = screen.getByTestId("outlet");
      expect(footer).toBeInTheDocument();
      expect(navigation).toBeInTheDocument();
      expect(outlet).toBeInTheDocument();
      expect(mockUseMobileTextSelectionAction).toHaveBeenCalledTimes(1);
      expect(mockUseMobileTextSelectionAction).toHaveBeenCalledWith(
        String(user.id)
      );
      expect(asFragment()).toMatchSnapshot();
    });
  });
});
