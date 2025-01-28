import { render } from "@testing-library/react";

import { App } from "./App";

describe("App component", () => {
  it("renders main element", () => {
    const { asFragment } = render(<App />);

    expect(asFragment()).toMatchSnapshot();
  });
});
