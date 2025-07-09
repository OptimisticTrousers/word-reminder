import { render, screen } from "@testing-library/react";
import { ErrorMessage } from "./ErrorMessage";

describe("ErrorMessage component", () => {
  it("renders message", () => {
    const props = { message: "Error Message." };

    const { asFragment } = render(<ErrorMessage {...props} />);

    const message = screen.getByText(props.message);
    expect(asFragment()).toMatchSnapshot();
    expect(message).toBeInTheDocument();
  });
});
