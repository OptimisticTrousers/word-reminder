import { render, screen } from "@testing-library/react";

import loadingImage from "../../../assets/images/loading.gif";
import { Loading } from "./Loading";

describe("Loading component", () => {
  it("renders image", () => {
    const { asFragment } = render(<Loading />);

    const image = screen.getByAltText("loading");

    expect(image).toHaveAttribute("src", loadingImage);
    expect(asFragment()).toMatchSnapshot();
  });
});
