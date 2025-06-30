import { MemoryRouter } from "react-router-dom";
import { render, screen } from "@testing-library/react";

import { Error500 } from "./Error500";

describe("Error500 component", () => {
  it("renders message, error status, and link to the home page", () => {
    const message = "Oops. Try again later.";
    const { asFragment } = render(
      <MemoryRouter>
        <Error500 message={message} />
      </MemoryRouter>
    );

    const status = screen.getByText("500 Error");
    const errorMessage = screen.getByText(`Internal Server Error: ${message}`);
    const link = screen.getByRole("link", {
      name: "Go back to the home page.",
    });
    expect(status).toBeInTheDocument();
    expect(errorMessage).toBeInTheDocument();
    expect(link).toBeInTheDocument();
    expect(asFragment()).toMatchSnapshot();
  });

  it("renders generic error message when not provided", () => {
    const { asFragment } = render(
      <MemoryRouter>
        <Error500 />
      </MemoryRouter>
    );

    const status = screen.getByText("500 Error");
    const errorMessage = screen.getByText(
      `Internal Server Error: unknown error`
    );
    const link = screen.getByRole("link", {
      name: "Go back to the home page.",
    });
    expect(status).toBeInTheDocument();
    expect(errorMessage).toBeInTheDocument();
    expect(link).toBeInTheDocument();
    expect(asFragment()).toMatchSnapshot();
  });
});
