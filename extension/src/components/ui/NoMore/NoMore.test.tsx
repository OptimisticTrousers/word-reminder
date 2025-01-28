import { render, screen } from "@testing-library/react";

import { NoMore } from "./NoMore";

describe("NoMore component", () => {
  it("renders title and description", async () => {
    const props = {
      name: "Words",
    };

    const { asFragment } = render(<NoMore {...props} />);

    const lowerCaseName = props.name.toLowerCase();
    const title = screen.getByText(`No more ${lowerCaseName}`);
    const message = screen.getByText(
      `Add more ${lowerCaseName} to see more ${lowerCaseName} in your collection.`
    );
    expect(title).toBeInTheDocument();
    expect(message).toBeInTheDocument();
    expect(asFragment()).toMatchSnapshot();
  });

  it("renders title and description in lower case when name is uppercase", async () => {
    const props = {
      name: "WORDS",
    };

    const { asFragment } = render(<NoMore {...props} />);

    const lowerCaseName = props.name.toLowerCase();
    const title = screen.getByText(`No more ${lowerCaseName}`);
    const message = screen.getByText(
      `Add more ${lowerCaseName} to see more ${lowerCaseName} in your collection.`
    );
    expect(title).toBeInTheDocument();
    expect(message).toBeInTheDocument();
    expect(asFragment()).toMatchSnapshot();
  });
});
