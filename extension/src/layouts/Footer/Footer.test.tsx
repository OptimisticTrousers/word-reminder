import { render, screen } from "@testing-library/react";

import { Footer } from "./Footer";

describe("Footer component", () => {
  it("renders link to the github page", () => {
    const { asFragment } = render(<Footer />);

    const link = screen.getByRole("link");
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute(
      "href",
      "https://github.com/OptimisticTrousers/word-storer"
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
