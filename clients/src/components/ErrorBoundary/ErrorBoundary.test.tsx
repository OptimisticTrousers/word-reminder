import { MemoryRouter } from "react-router-dom";
import { render, screen } from "@testing-library/react";

import { ErrorBoundary } from "./ErrorBoundary";

describe("ErrorBoundary component", () => {
  const errorMessage = "Oops. Error!";
  const noErrorMessage = "No error.";

  function MaybeThrowError({ hasError }: { hasError: boolean }) {
    if (hasError) {
      throw new Error(errorMessage);
    }
    return <p>{noErrorMessage}</p>;
  }

  it("renders title, message, and link", async () => {
    vi.spyOn(console, "error").mockImplementation(() => null);

    const { asFragment } = render(
      <MemoryRouter>
        <ErrorBoundary>
          <MaybeThrowError hasError={true} />
        </ErrorBoundary>
      </MemoryRouter>
    );

    const title = screen.getByRole("heading", { name: "An error occurred." });
    const message = screen.getByText(errorMessage);
    const homeLink = screen.getByRole("link", {
      name: "Go back to the home page.",
    });
    expect(title).toBeInTheDocument();
    expect(message).toBeInTheDocument();
    expect(homeLink).toBeInTheDocument();
    expect(asFragment()).toMatchSnapshot();
  });

  it("does not render if there is no error", () => {
    render(
      <MemoryRouter>
        <ErrorBoundary>
          <MaybeThrowError hasError={false} />
        </ErrorBoundary>
      </MemoryRouter>
    );

    const noError = screen.getByText(noErrorMessage);
    const title = screen.queryByRole("heading", { name: "An error occurred." });
    const message = screen.queryByText(errorMessage);
    const homeLink = screen.queryByRole("link", {
      name: "Go back to the home page.",
    });
    expect(noError).toBeInTheDocument();
    expect(title).not.toBeInTheDocument();
    expect(message).not.toBeInTheDocument();
    expect(homeLink).not.toBeInTheDocument();
  });
});
